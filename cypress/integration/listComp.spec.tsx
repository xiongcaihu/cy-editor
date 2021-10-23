/* eslint-disable no-loop-func */
/* eslint-disable no-throw-literal */
/* eslint-disable no-undef */
import * as React from "react";
import { mount, unmount } from "@cypress/react";
import CyEditor from "../../src/components/RichEditor/RichEditor";
import { ReactEditor } from "slate-react";
import { Descendant, Editor, NodeEntry, Path, Transforms } from "slate";
import {
  CET,
  CypressFlagValues,
  CypressTestFlag,
  EditorType,
} from "../../src/components/RichEditor/common/Defines";
import { ListLogic } from "../../src/components/RichEditor/comps/ListComp";

const emptyContent = `[{"type":"div","children":[{"text":""}]}]`;
var content = emptyContent;

const getSlateNodeEntry = (
  editor: EditorType,
  jqEl: JQuery<HTMLElement>
): NodeEntry => {
  try {
    const node = ReactEditor.toSlateNode(editor, jqEl.get(0));
    const nodePath = ReactEditor.findPath(editor, node);
    return [node, nodePath];
  } catch (error) {
    console.error("get slate node error");
    console.error(error);
    throw "li is null";
  }
};

function makeList(editor: EditorType) {
  Transforms.select(editor, [0]);
  cy.wait(100);
  cy.get(
    `button[${CypressTestFlag}='${CypressFlagValues.ORDER_LIST}']`
  ).click();
  cy.focused()
    .type("apple{enter}banana{enter}")
    .tab()
    .type("two apple{enter}")
    .type("three apple{enter}")
    .tab({ shift: true })
    .type("iphone{enter}")
    .type("ios");

  // 检查结果对不对
  cy.get("ol").should("have.length", 2);
  cy.get("ol").eq(0).children().should("have.length", 5);
  cy.get("ol").eq(1).children().should("have.length", 2);
  return cy.wrap(""); // 为了让此函数变成promise函数，等待cypress命令全部结束后才返回
}

function selectLiPos(
  editor: EditorType,
  content: string | RegExp,
  pos: "start" | "end" | "middle"
) {
  return cy
    .contains("li", content)
    .then((el) => {
      const li = getSlateNodeEntry(editor, el);
      const selectAction = {
        start: () => Editor.start(editor, li[1]),
        end: () => Editor.end(editor, li[1]),
        middle: () => ({
          path: li[1],
          offset: parseInt(
            String(
              (Editor.start(editor, li[1]).offset +
                Editor.end(editor, li[1]).offset) /
                2
            )
          ),
        }),
      };
      Transforms.select(editor, selectAction[pos]());
    })
    .wait(50);
}

function judgeListCount(type: "ul" | "ol", count: number) {
  return cy.get(type).should("have.length", count);
}
/**
 *
 * @param type
 * @param index 第几个父元素，比下标值要大一个数
 * @param count
 * @returns
 */
function judegeChildren(type: "ul" | "ol", index: number, count: number) {
  return cy
    .get(type)
    .eq(index - 1)
    .children()
    .should("have.length", count);
}

before((done) => {
  console.clear();
  console.log("开始生成数据");
  content = emptyContent;
  // 第一次运行的时候，生成测试数据
  mount(
    <CyEditor
      content={emptyContent}
      getEditor={(editor) => {
        makeList(editor).then(() => {
          console.log("数据生成完毕");
          setTimeout(() => {
            content = JSON.stringify(editor.children);
            console.log("生成的数据");
            console.log(content);
            unmount();
            done();
          }, 300);
        });
      }}
    />
  );
});

beforeEach(() => {
  mount(
    <CyEditor
      content={content}
      getEditor={(editor) => {
        cy.wrap(editor).as("editor");
      }}
    />
  );
});

afterEach(() => {
  cy.wait(50);
  unmount();
});

describe("测试list组件", function () {
  describe("没有选区时", function () {
    describe("li非空", function () {
      describe("光标处于li的开头", function () {
        it("输入文字", function () {
          const { editor } = this;
          selectLiPos(editor, "banana", "start");
          cy.focused().type("haha");

          cy.contains("li", /^hahabanana$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        it("输入delete键", function () {
          const { editor } = this;
          selectLiPos(editor, "banana", "start");
          cy.focused().type("{del}");

          cy.contains("li", /^anana$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        it("输入enter键", function () {
          const { editor } = this;
          selectLiPos(editor, "banana", "start");
          cy.focused().type("a{enter}");

          cy.contains("li", /^banana$/).should("have.length", 1);
          cy.contains("li", /^a$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 6);
          judegeChildren("ol", 2, 2);
        });
        it("输入backspace键", function () {
          const { editor } = this;
          selectLiPos(editor, "banana", "start");
          cy.focused().type("{backspace}");

          cy.contains("li", /^applebanana$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 4);
          judegeChildren("ol", 2, 2);
        });
        describe("输入tab键", function () {
          it("li上方是li，下方是list", function () {
            const { editor } = this;
            selectLiPos(editor, "banana", "start");
            cy.focused().tab();

            cy.contains("li", /^banana$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 4);
            judegeChildren("ol", 2, 3);
          });
          it("li上方是li，下方是li", function () {
            const { editor } = this;
            selectLiPos(editor, "banana", "end");
            cy.focused().type("{enter}temp", { delay: 50 });

            selectLiPos(editor, "banana", "start");
            cy.focused().tab();

            cy.contains("li", /^banana$/).should("have.length", 1);

            judgeListCount("ol", 3);
            judegeChildren("ol", 1, 6);
            judegeChildren("ol", 2, 1);
            judegeChildren("ol", 3, 2);
          });
          it("li上方是list，下方是li", function () {
            const { editor } = this;
            selectLiPos(editor, "iphone", "start");
            cy.focused().tab();

            cy.contains("li", /^iphone$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 4);
            judegeChildren("ol", 2, 3);
          });
          it("li上方是list，下方是list", function () {
            const { editor } = this;
            selectLiPos(editor, "apple", "start");
            cy.focused().tab();

            cy.contains("li", /^apple$/).should("have.length", 1);

            selectLiPos(editor, "banana", "start");
            cy.focused().tab();
            cy.contains("li", /^banana$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 3);
            judegeChildren("ol", 2, 4);
          });
        });
        describe("输入shift+tab键", function () {
          it("li位于第一层", function () {
            const { editor } = this;
            selectLiPos(editor, "apple", "start");
            cy.focused().tab({ shift: true });

            cy.contains("li", /^apple$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 5);
            judegeChildren("ol", 2, 2);
          });
          it("li位于第二层", function () {
            const { editor } = this;
            selectLiPos(editor, "two apple", "start");
            cy.focused().tab({ shift: true });

            cy.contains("li", /^two apple$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 6);
            judegeChildren("ol", 2, 1);
          });
          it("li上方是li，下方是list", function () {
            const { editor } = this;
            selectLiPos(editor, "banana", "start");
            cy.focused().tab({ shift: true });

            cy.contains("li", /^banana$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 5);
            judegeChildren("ol", 2, 2);
          });
          it("li上方是li，下方是li", function () {
            const { editor } = this;
            selectLiPos(editor, "three apple", "end");
            cy.focused().type("{enter}temp", { delay: 50 });

            selectLiPos(editor, "three apple", "start");
            cy.focused().tab({ shift: true });

            cy.contains("li", /^three apple$/).should("have.length", 1);

            judgeListCount("ol", 3);
            judegeChildren("ol", 1, 7);
            judegeChildren("ol", 2, 1);
            judegeChildren("ol", 3, 1);
          });
          it("li上方是list，下方是li", function () {
            const { editor } = this;
            selectLiPos(editor, "two apple", "start");
            cy.focused().tab({ shift: true });

            cy.contains("li", /^two apple$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 6);
            judegeChildren("ol", 2, 1);
          });
          it("li上方是list，下方是list", function () {
            const { editor } = this;
            selectLiPos(editor, "two apple", "start");
            cy.focused().tab({ shift: true });

            cy.contains("li", /^two apple$/).should("have.length", 1);

            selectLiPos(editor, "three apple", "start");
            cy.focused().tab({ shift: true });
            cy.contains("li", /^three apple$/).should("have.length", 1);

            judgeListCount("ol", 1);
            judegeChildren("ol", 1, 6);
          });
        });
      });
      describe("光标处于li的末尾", function () {
        it("输入文字", function () {
          const { editor } = this;
          selectLiPos(editor, "banana", "end");
          cy.focused().type("haha");

          cy.contains("li", /^bananahaha$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        describe("输入delete键", function () {
          it("li后面是一个list", function () {
            const { editor } = this;
            selectLiPos(editor, "banana", "end");
            cy.focused().type("{del}");

            cy.contains("li", /^bananatwo apple$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 5);
            judegeChildren("ol", 2, 1);
          });
          it("li后面是一个li", function () {
            const { editor } = this;
            selectLiPos(editor, "three apple", "end");
            cy.focused().type("{del}");

            cy.contains("li", /^three appleiphone$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 4);
            judegeChildren("ol", 2, 2);
          });
          it("li后面是一个表格", function () {});
          describe("li后面是一个普通文本", function () {
            it("纯文本", function () {
              const { editor } = this;
              selectLiPos(editor, "ios", "end");
              cy.focused().type("{enter}{enter}plain text...", { delay: 50 });

              selectLiPos(editor, "ios", "end");
              cy.focused().type("{del}");
              cy.contains("li", /^iosplain text...$/).should("have.length", 1);

              judgeListCount("ol", 2);
              judegeChildren("ol", 1, 5);
              judegeChildren("ol", 2, 2);
            });
            it("带有inline元素", function () {
              const { editor } = this;
              selectLiPos(editor, "ios", "end");
              cy.focused().type("{enter}{enter}plain text...", { delay: 50 });

              cy.document().then(() => {
                Transforms.insertNodes(editor, {
                  type: CET.IMG,
                  children: [{ text: "" }],
                });
              });

              selectLiPos(editor, "ios", "end");
              cy.focused().type("{del}");
              cy.contains("li", /^iosplain text.../).should("have.length", 1);

              judgeListCount("ol", 2);
              judegeChildren("ol", 1, 5);
              judegeChildren("ol", 2, 2);
            });
          });
          it("li后面是一个todo组件", function () {
            const { editor } = this;
            selectLiPos(editor, "ios", "end");
            cy.focused().type("{enter}{enter}");

            cy.document().then(() => {
              cy.wait(500);
              cy.get(
                `[${CypressTestFlag}='${CypressFlagValues.TODO_LIST}']`
              ).click({ force: true });
            });

            cy.wait(500);
            selectLiPos(editor, "ios", "end");
            cy.focused().type("{del}");
            cy.contains("li", /^iostodo...$/).should("have.length", 1);

            judgeListCount("ol", 2);
            judegeChildren("ol", 1, 5);
            judegeChildren("ol", 2, 2);
          });
        });
        it("输入enter键", function () {
          const { editor } = this;
          selectLiPos(editor, "banana", "end");
          cy.focused().type("{enter}haha");

          cy.contains("li", /^haha$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 6);
          judegeChildren("ol", 2, 2);
        });
        it("输入backspace键", function () {
          const { editor } = this;
          selectLiPos(editor, "banana", "end");
          cy.focused().type("{backspace}");

          cy.contains("li", /^banan$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        // 与光标位于li开始一样
        it.skip("输入tab键", function () {});
        describe.skip("输入shift+tab键", function () {
          it("li位于第一层", function () {});
          it("li位于第二层", function () {});
        });
      });
      describe("光标处于li的中间", function () {
        it.skip("输入文字", function () {});
        it.skip("输入delete键", function () {});
        it("输入enter键", function () {
          const { editor } = this;
          selectLiPos(editor, "banana", "middle");
          cy.focused().type("{enter}");

          cy.contains("li", /^ban$/).should("have.length", 1);
          cy.contains("li", /^ana$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 6);
          judegeChildren("ol", 2, 2);
        });
        it.skip("输入backspace键", function () {});
        it.skip("输入tab键", function () {});
        describe.skip("输入shift+tab键", function () {
          it("li位于第一层", function () {});
          it("li位于第二层", function () {});
        });
      });
    });
    describe("空li", function () {
      // 创建一个空的li
      beforeEach(function () {
        const { editor } = this;
        selectLiPos(editor, "banana", "end");
        cy.focused().type("{enter}");
      });
      it("输入文字", function () {
        cy.focused().type("123");

        cy.contains("li", /^123$/).should("have.length", 1);

        judgeListCount("ol", 2);
        judegeChildren("ol", 1, 6);
        judegeChildren("ol", 2, 2);
      });
      it("输入delete键", function () {
        cy.focused().type("{del}");

        cy.contains("li", /^two apple$/).should("have.length", 1);

        judgeListCount("ol", 2);
        judegeChildren("ol", 1, 6);
        judegeChildren("ol", 2, 1);
      });
      it("输入enter键", function () {
        cy.focused().type("{enter}");

        judgeListCount("ol", 3);
        judegeChildren("ol", 1, 2);
        judegeChildren("ol", 2, 3);
        judegeChildren("ol", 3, 2);
      });
      it("输入backspace键", function () {
        cy.focused().type("{backspace}");

        judgeListCount("ol", 2);
        judegeChildren("ol", 1, 5);
        judegeChildren("ol", 2, 2);
      });
      it("输入tab键", function () {
        cy.focused().tab();

        judgeListCount("ol", 2);
        judegeChildren("ol", 1, 5);
        judegeChildren("ol", 2, 3);
      });
      describe.skip("输入shift+tab键", function () {
        it("li位于第一层", function () {});
        it("li位于第二层", function () {});
      });
    });
  });

  describe("有选区时", function () {
    describe("区域在一个li里", function () {
      describe("选中li的全部", function () {
        beforeEach(function () {
          const { editor } = this;
          cy.contains("li", "two apple")
            .then((el) => {
              const li = getSlateNodeEntry(editor, el);
              Transforms.select(editor, li[1]);
            })
            .wait(50);
        });
        it("输入文字", function () {
          cy.focused().type("haha");

          cy.contains("li", /^haha$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        it("输入delete键", function () {
          cy.focused().type("{del}");

          cy.contains("li", /^two apple$/, { timeout: 2000 }).should(
            "have.length",
            0
          );

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        it("输入enter键", function () {
          cy.focused().type("{enter}");

          cy.contains("li", /^two apple$/, { timeout: 2000 }).should(
            "have.length",
            0
          );

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 3);
        });
        it("输入backspace键", function () {
          cy.focused().type("{backspace}");

          cy.contains("li", /^two apple$/, { timeout: 2000 }).should(
            "have.length",
            0
          );

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        it("输入tab键", function () {
          cy.focused().tab();

          cy.contains("li", /^two apple$/, { timeout: 2000 }).should(
            "have.length",
            1
          );

          judgeListCount("ol", 3);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
          judegeChildren("ol", 3, 1);
        });
        it("输入shift+tab键", function () {
          cy.focused().tab().wait(50).tab({ shift: true });

          cy.contains("li", /^two apple$/, { timeout: 2000 }).should(
            "have.length",
            1
          );

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
      });
      describe("选中li的部分", function () {
        beforeEach(function () {
          const { editor } = this;
          // 选中 o appl 部分
          cy.contains("li", "two apple")
            .then((el) => {
              const li = getSlateNodeEntry(editor, el);
              Transforms.select(editor, {
                anchor: {
                  path: li[1],
                  offset: 8,
                },
                focus: {
                  path: li[1],
                  offset: 2,
                },
              });
            })
            .wait(50);
        });
        it("输入文字", function () {
          cy.focused().type("123");

          cy.contains("li", /^tw123e$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        it("输入delete键", function () {
          cy.focused().type("{del}");

          cy.contains("li", /^twe$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        it("输入enter键", function () {
          cy.focused().type("{enter}");

          cy.contains("li", /^tw$/).should("have.length", 1);
          cy.contains("li", /^e$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 3);
        });
        it("输入backspace键", function () {
          cy.focused().type("{backspace}");

          cy.contains("li", /^twe$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
        it("输入tab键", function () {
          cy.focused().tab();

          judgeListCount("ol", 3);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
          judegeChildren("ol", 3, 1);
        });
        it("输入shift+tab键", function () {
          cy.focused().tab().wait(50).tab({ shift: true });

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
      });
    });
    describe("区域在多个li里", function () {
      describe("选中多个li的全部", function () {
        beforeEach(function () {
          const { editor } = this;
          // 选中 ba |nanatwo appl| e部分
          cy.contains("li", "two apple")
            .then((el) => {
              cy.contains("li", "banana").then((el2) => {
                const li = getSlateNodeEntry(editor, el);
                const li2 = getSlateNodeEntry(editor, el2);
                Transforms.select(editor, {
                  anchor: {
                    path: li[1],
                    offset: 8,
                  },
                  focus: {
                    path: li2[1],
                    offset: 2,
                  },
                });
              });
            })
            .wait(50);
        });
        it("输入文字", function () {
          cy.focused().type("123");

          cy.contains("li", /^ba123e$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 1);
        });
        it("输入delete键", function () {
          cy.focused().type("{del}");

          cy.contains("li", /^bae$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 1);
        });
        it("输入enter键", function () {
          cy.focused().type("{enter}");

          cy.contains("li", /^ba$/).should("have.length", 1);
          cy.contains("li", /^e$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 6);
          judegeChildren("ol", 2, 1);
        });
        it("输入backspace键", function () {
          cy.focused().type("{backspace}");

          cy.contains("li", /^bae$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 1);
        });
        it("输入tab键", function () {
          cy.focused().tab();

          cy.contains("li", /^banana$/).should("have.length", 1);
          cy.contains("li", /^two apple$/).should("have.length", 1);

          judgeListCount("ol", 3);
          judegeChildren("ol", 1, 4);
          judegeChildren("ol", 2, 3);
          judegeChildren("ol", 3, 1);
        });
        it("输入shift+tab键", function () {
          cy.focused().tab().wait(50).tab({ shift: true });

          cy.contains("li", /^banana$/).should("have.length", 1);
          cy.contains("li", /^two apple$/).should("have.length", 1);

          judgeListCount("ol", 2);
          judegeChildren("ol", 1, 5);
          judegeChildren("ol", 2, 2);
        });
      });
      describe("选中所有的li", function () {
        beforeEach(function () {
          const { editor } = this;
          // 选中 ba |nanatwo appl| e部分
          cy.document()
            .then(() => {
              Transforms.select(editor, [0]);
            })
            .wait(50);
        });
        it("输入文字", function () {
          cy.focused().type("a");

          cy.contains("li", /^a$/).should("have.length", 1);

          judgeListCount("ol", 1);
          judegeChildren("ol", 1, 1);
        });
        it("输入delete键", function () {
          cy.focused().type("{del}");

          judgeListCount("ol", 1);
          judegeChildren("ol", 1, 1);

          cy.get("ol li").eq(0).should("not.have.text");
        });
        it("输入enter键", function () {
          cy.focused().type("{enter}");

          judgeListCount("ol", 1);
          judegeChildren("ol", 1, 2);

          cy.get("ol li").eq(0).should("not.have.text");
          cy.get("ol li").eq(1).should("not.have.text");
        });
        it("输入backspace键", function () {
          cy.focused().type("{backspace}");

          judgeListCount("ol", 1);
          judegeChildren("ol", 1, 1);
          cy.get("ol li").eq(0).should("not.have.text");
        });
        it("输入tab键", function () {
          cy.focused().tab();

          judgeListCount("ol", 3);
          judegeChildren("ol", 1, 1);
          judegeChildren("ol", 2, 5);
          judegeChildren("ol", 3, 2);
        });
        it("输入shift+tab键", function () {
          cy.focused().tab({ shift: true });

          judgeListCount("ol", 1);
          judegeChildren("ol", 1, 6);
        });
      });
      describe.skip("选中多个li的部分", function () {
        it("输入文字", function () {});
        it("输入delete键", function () {});
        it("输入enter键", function () {});
        it("输入backspace键", function () {});
        it("输入tab键", function () {});
        describe("输入shift+tab键", function () {
          it("li位于第一层", function () {});
          it("li位于第二层", function () {});
        });
      });
    });
  });

  describe("测试切换list类型按钮", function () {
    it("在有序列表里选中第一层级的某个li，然后点击切换到无序列表按钮", function () {
      const { editor } = this;

      cy.contains("li", "banana").then(($li) => {
        const li = getSlateNodeEntry(editor, $li);
        // 选中li的倒数第二个位置
        const liEndPos = Editor.end(editor, li[1]);
        Transforms.select(editor, Editor.before(editor, liEndPos) || liEndPos);
      });

      // 点击切换无序列表按钮
      cy.wait(500);
      cy.get(
        `button[${CypressTestFlag}='${CypressFlagValues.NORMALIZE_LIST}']`
      ).click({ force: true });

      judgeListCount("ul", 1);
      judgeListCount("ol", 1);
      judegeChildren("ul", 1, 5);
      judegeChildren("ol", 1, 2);
    });

    it("在有序列表里选中第一层第二个li，然后按切换有序按钮", function () {
      const { editor } = this;

      cy.contains("li", "banana").then(($li) => {
        const li = getSlateNodeEntry(editor, $li);
        // 选中li的倒数第二个位置
        const liEndPos = Editor.end(editor, li[1]);
        Transforms.select(editor, Editor.before(editor, liEndPos) || liEndPos);
      });

      // 点击切换有序列表按钮
      cy.wait(500);
      cy.get(
        `button[${CypressTestFlag}='${CypressFlagValues.ORDER_LIST}']`
      ).click({ force: true });

      judgeListCount("ol", 3);
      judegeChildren("ol", 1, 1);
      judegeChildren("ol", 2, 3);
      judegeChildren("ol", 3, 2);

      cy.contains("banana").parents("li").should("have.length", 0);
    });

    it("在有序列表里选中第二层第1个li，然后非连续按切换有序按钮两次", function () {
      const { editor } = this;

      cy.contains("li", "two apple").then(($li) => {
        const li = getSlateNodeEntry(editor, $li);
        // 选中li的倒数第二个位置
        const liEndPos = Editor.end(editor, li[1]);
        Transforms.select(editor, Editor.before(editor, liEndPos) || liEndPos);
      });

      // 点击切换有序列表按钮
      cy.wait(500);
      cy.get(
        `button[${CypressTestFlag}='${CypressFlagValues.ORDER_LIST}']`
      ).click({ force: true });

      judgeListCount("ol", 3);
      judegeChildren("ol", 1, 2);
      judegeChildren("ol", 2, 3);
      judegeChildren("ol", 3, 1);

      cy.contains("two apple").parents("li").should("have.length", 0);

      cy.contains("two apple").then(($li) => {
        if (!$li) throw "error";
        const li = getSlateNodeEntry(editor, $li);
        // 选中li的倒数第二个位置
        const liEndPos = Editor.end(editor, li[1]);
        Transforms.select(editor, Editor.before(editor, liEndPos) || liEndPos);
      });

      // 点击切换有序列表按钮
      cy.wait(500);
      cy.get(
        `button[${CypressTestFlag}='${CypressFlagValues.ORDER_LIST}']`
      ).click({ force: true });

      judgeListCount("ol", 2);
      judegeChildren("ol", 1, 6);
      judegeChildren("ol", 2, 1);
    });
  });

  describe("测试复制粘贴", function () {
    it("复制list外部元素（普通文本）并粘贴到list中", function () {
      const editor: EditorType = this.editor;
      var copyedContent: Descendant[] | null = null;
      // 在list后插入文本，并选中部分文本，然后复制
      cy.document().then(() => {
        const [list] = Editor.nodes(editor, {
          match(n) {
            return ListLogic.isOrderList(n);
          },
        });
        if (list) {
          Transforms.insertNodes(
            editor,
            {
              type: CET.DIV,
              children: [{ text: "haha" }],
            },
            {
              at: Path.next(list[1]),
            }
          );
        }
      });

      cy.contains(/^haha$/).then(($el) => {
        const div = getSlateNodeEntry(editor, $el as any);
        const end = Editor.end(editor, div[1]);
        const start = Cypress._.cloneDeep(end);
        start.offset -= 2;
        Transforms.select(editor, Editor.range(editor, start, end));

        if (editor.selection) {
          copyedContent = Editor.fragment(editor, editor.selection);
        }
      });

      cy.contains("li", "banana").then(($li) => {
        const li = getSlateNodeEntry(editor, $li);
        // 选中li的倒数第二个位置
        const liEndPos = Editor.end(editor, li[1]);
        Transforms.select(editor, liEndPos);
      });

      cy.wait(300);
      cy.document().then(() => {
        copyedContent && editor.insertFragment(copyedContent);
      });

      cy.contains("li", "bananaha").should("be.visible");
    });

    it("复制单条li内容到list内部元素", function () {
      const editor: EditorType = this.editor;
      var copyedContent: Descendant[] | null = null;

      cy.contains("li", "banana").then(($li) => {
        const li = getSlateNodeEntry(editor, $li);
        Transforms.select(editor, Editor.range(editor, li[1]));
        copyedContent = editor.getFragment();
      });

      cy.contains("li", "apple").then(($li) => {
        const li = getSlateNodeEntry(editor, $li);
        Transforms.select(editor, Editor.end(editor, li[1]));
        copyedContent && editor.insertFragment(copyedContent);
      });

      cy.contains("li", "applebanana").should("be.visible");
    });

    it("复制多条li内容到list内部元素", function () {
      const editor: EditorType = this.editor;
      var copyedContent: Descendant[] | null = null;

      cy.contains("li", "banana").then(($li) => {
        cy.contains("li", "three apple").then(($li2) => {
          const li1 = getSlateNodeEntry(editor, $li);
          const li2 = getSlateNodeEntry(editor, $li2);
          Transforms.select(
            editor,
            Editor.range(
              editor,
              Editor.start(editor, li1[1]),
              Editor.end(editor, li2[1])
            )
          );
          copyedContent = editor.getFragment();
        });
      });

      cy.contains("li", "apple").then(($li) => {
        const li = getSlateNodeEntry(editor, $li);
        Transforms.select(editor, Editor.end(editor, li[1]));
        copyedContent && editor.insertFragment(copyedContent);
      });

      cy.contains("li", "applebanana").should("be.visible");
      cy.contains("li", "two applethree apple").should("be.visible");
      cy.get('li:contains("three apple")').should("have.length", 2);
      cy.get('li:contains("two apple")').should("have.length", 2);
    });
  });
});
