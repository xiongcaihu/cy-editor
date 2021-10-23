/* eslint-disable no-loop-func */
/* eslint-disable no-throw-literal */
/* eslint-disable no-undef */
import * as React from "react";
import { mount, unmount } from "@cypress/react";
import CyEditor from "../../src/components/RichEditor/RichEditor";
import { ReactEditor } from "slate-react";
import { Descendant, Editor, Element, NodeEntry, Transforms } from "slate";
import {
  CET,
  CypressFlagValues,
  CypressTestFlag,
  EditorType,
} from "../../src/components/RichEditor/common/Defines";
import { ToDoListLogic } from "../../src/components/RichEditor/comps/TodoListComp";
import { TableLogic } from "../../src/components/RichEditor/comps/Table";
import { utils } from "../../src/components/RichEditor/common/utils";

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
  cy.get(`button[${CypressTestFlag}='${CypressFlagValues.TODO_LIST}']`).click();
  cy.focused()
    .type(
      "{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}"
    )
    .type("one{enter}two{enter}three", { delay: 20 });
  return cy.wrap(""); // 为了让此函数变成promise函数，等待cypress命令全部结束后才返回
}

function selectTodoPos(
  editor: EditorType,
  content: string | RegExp,
  pos: "start" | "end" | "middle"
) {
  return cy
    .contains("div", content)
    .then((el) => {
      const todo = getSlateNodeEntry(editor, el);
      const selectAction = {
        start: () => Editor.start(editor, todo[1]),
        end: () => Editor.end(editor, todo[1]),
        middle: () => ({
          path: todo[1],
          offset: parseInt(
            String(
              (Editor.start(editor, todo[1]).offset +
                Editor.end(editor, todo[1]).offset) /
                2
            )
          ),
        }),
      };
      Transforms.select(editor, selectAction[pos]());
    })
    .wait(50);
}

function getTodoListCount(editor: EditorType) {
  return cy
    .wrap(
      new Promise((rel) => {
        setTimeout(() => {
          rel(null);
        }, 50);
      })
    )
    .then(() => {
      return cy.wrap(
        Array.from(
          Editor.nodes(editor, {
            at: [],
            match: (n) => ToDoListLogic.isTodoList(n),
          })
        ).length
      );
    });
}

function doSyncFn(fn: Function, timeout?: number) {
  return cy
    .wrap({
      fn: () =>
        new Promise((rel) => {
          if (timeout) {
            setTimeout(() => {
              rel(fn());
            }, timeout);
          } else rel(fn());
        }),
    })
    .invoke("fn");
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

describe("测试TODO组件", function () {
  describe("没有选区时", function () {
    describe("非空todo", function () {
      describe("光标在开头位置", function () {
        it("输入文字", function () {
          const { editor } = this;
          selectTodoPos(editor, "three", "start");
          cy.focused().type("hahahah");

          cy.contains("div", /^hahahahthree$/).should("have.length", 1);
        });
        it("按delete键", function () {
          const { editor } = this;
          selectTodoPos(editor, "three", "start");

          cy.focused().type("{del}");

          cy.contains("div", /^hree$/).should("have.length", 1);
        });
        describe("按enter键", function () {
          it("只按一次", function () {
            const { editor } = this;
            selectTodoPos(editor, "three", "start");

            cy.focused().type("{enter}");

            getTodoListCount(editor).should("eq", 4);
          });
          it("连续按两次", function () {
            const { editor } = this;
            selectTodoPos(editor, "three", "start");

            cy.focused().type("{enter}{enter}", { delay: 50 });

            getTodoListCount(editor).should("eq", 5);
          });
          it("连续按三次", function () {
            const { editor } = this;
            selectTodoPos(editor, "three", "start");

            cy.focused().type("{enter}{enter}{enter}", { delay: 50 });

            getTodoListCount(editor).should("eq", 6);
          });
        });
        describe("按backspace键", function () {
          it("位于第一个todo", function () {
            const { editor } = this;
            selectTodoPos(editor, "one", "start");

            cy.focused().type("{backspace}", { delay: 50 });

            getTodoListCount(editor).should("eq", 2);
          });
          it("位于第二个todo", function () {
            const { editor } = this;
            selectTodoPos(editor, "two", "start");

            cy.focused().type("{backspace}", { delay: 50 });

            getTodoListCount(editor).should("eq", 2);

            cy.contains(/^onetwo$/).should("have.length", 1);
          });
        });
      });
      describe("光标在中间位置", function () {
        it("输入文字", function () {
          const { editor } = this;
          selectTodoPos(editor, "three", "middle");
          cy.focused().type("123");

          cy.contains("div", /^th123ree$/).should("have.length", 1);
        });
        it("按delete键", function () {
          const { editor } = this;
          selectTodoPos(editor, "three", "middle");
          cy.focused().type("{del}");

          cy.contains("div", /^thee$/).should("have.length", 1);
        });
        describe("按enter键", function () {
          it("只按一次", function () {
            const { editor } = this;
            selectTodoPos(editor, "three", "middle");
            cy.focused().type("{enter}");

            cy.contains("div", /^th$/).should("have.length", 1);
            cy.contains("div", /^ree$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 4);
          });
          it("连续按两次", function () {
            const { editor } = this;
            selectTodoPos(editor, "three", "middle");
            cy.focused().type("{enter}{enter}", { delay: 50 });

            cy.contains("div", /^th$/).should("have.length", 1);
            cy.contains("div", /^ree$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 5);
          });
          it("连续按三次", function () {
            const { editor } = this;
            selectTodoPos(editor, "three", "middle");
            cy.focused().type("{enter}{enter}{enter}", { delay: 50 });

            cy.contains("div", /^th$/).should("have.length", 1);
            cy.contains("div", /^ree$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 6);
          });
        });
        it("按backspace键", function () {
          const { editor } = this;
          selectTodoPos(editor, "one", "middle");
          cy.focused().type("{backspace}", { delay: 50 });

          cy.contains("div", /^ne$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 3);
        });
      });
      describe("光标在结尾位置", function () {
        it("输入文字", function () {
          const { editor } = this;
          selectTodoPos(editor, "one", "end");
          cy.focused().type("123", { delay: 50 });

          cy.contains("div", /^one123$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 3);
        });
        describe("按delete键", function () {
          it("位于第三个todo", function () {
            const { editor } = this;
            selectTodoPos(editor, "three", "end");
            cy.focused().type("{del}", { delay: 50 });

            cy.contains("div", /^three/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 3);
          });
          it("位于第二个todo", function () {
            const { editor } = this;
            selectTodoPos(editor, "two", "end");
            cy.focused().type("{del}", { delay: 50 });

            cy.contains("div", /^twothree$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 2);
          });
        });
        describe("按enter键", function () {
          it("只按一次", function () {
            const { editor } = this;
            selectTodoPos(editor, "two", "end");
            cy.focused().type("{enter}", { delay: 50 });

            cy.contains("div", /^two$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 4);
          });
          it("连续按两次", function () {
            const { editor } = this;
            selectTodoPos(editor, "two", "end");
            cy.focused().type("{enter}{enter}", { delay: 50 });

            cy.contains("div", /^two$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 3);
          });
          it("连续按三次", function () {
            const { editor } = this;
            selectTodoPos(editor, "two", "end");
            cy.focused().type("{enter}{enter}{enter}", { delay: 50 });

            cy.contains("div", /^two$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 3);
          });
        });
        it("按backspace键", function () {
          const { editor } = this;
          selectTodoPos(editor, "two", "end");
          cy.focused().type("{backspace}", { delay: 50 });

          cy.contains("div", /^tw$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 3);
        });
      });
    });
    describe("空todo", function () {
      beforeEach(function () {
        const { editor } = this;
        selectTodoPos(editor, "two", "end");

        cy.focused().type("{backspace}{backspace}{backspace}", { delay: 50 });
      });
      it("输入文字", function () {
        const { editor } = this;
        selectTodoPos(editor, "one", "end");
        cy.focused().type("{rightArrow}haha", { delay: 50 });

        cy.contains("div", /^haha$/).should("have.length", 1);

        getTodoListCount(editor).should("eq", 3);
      });
      describe("按delete键", function () {
        it("位于第三个todo", function () {
          const { editor } = this;
          selectTodoPos(editor, "three", "end");
          cy.focused().type(
            "{backspace}{backspace}{backspace}{backspace}{backspace}",
            { delay: 50 }
          );

          cy.focused().type("{del}", { delay: 50 });

          getTodoListCount(editor).should("eq", 2);
        });
        it("位于第二个todo", function () {
          const { editor } = this;
          selectTodoPos(editor, "one", "end");
          cy.focused().type("{rightArrow}{del}", { delay: 50 });

          cy.contains("div", /^three$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 2);
        });
      });
      describe("按enter键", function () {
        it("只按一次", function () {
          const { editor } = this;
          selectTodoPos(editor, "one", "end");
          cy.focused().type("{rightArrow}{enter}", { delay: 50 });

          getTodoListCount(editor).should("eq", 2);
        });
        it("连续按两次", function () {
          const { editor } = this;
          selectTodoPos(editor, "one", "end");
          cy.focused().type("{rightArrow}{enter}{enter}", { delay: 50 });

          getTodoListCount(editor).should("eq", 2);
        });
        it("连续按三次", function () {
          const { editor } = this;
          selectTodoPos(editor, "one", "end");
          cy.focused().type("{rightArrow}{enter}{enter}{enter}", { delay: 50 });

          getTodoListCount(editor).should("eq", 2);
        });
      });
      describe("按backspace键", function () {
        it("位于第一个todo", function () {
          const { editor } = this;
          selectTodoPos(editor, "one", "end");
          cy.focused().type("{backspace}{backspace}{backspace}", { delay: 50 });
          cy.focused().type("{backspace}", { delay: 50 });

          getTodoListCount(editor).should("eq", 2);
        });
        it("位于第二个todo", function () {
          const { editor } = this;
          selectTodoPos(editor, "one", "end");
          cy.focused().type("{rightArrow}{backspace}", { delay: 50 });

          getTodoListCount(editor).should("eq", 2);
        });
      });
    });
  });
  describe("有选区时", function () {
    describe("选中单个todo", function () {
      beforeEach(function () {
        // 选中two的 w 部分
        const { editor } = this;
        doSyncFn(() => {
          Transforms.select(editor, {
            anchor: {
              path: [1, 0],
              offset: 2,
            },
            focus: {
              path: [1, 0],
              offset: 1,
            },
          });
        }).wait(50);
      });
      // 部分选和全选行为一致
      it("输入文字", function () {
        const { editor } = this;
        cy.focused().type("123");
        cy.contains("div", /^t123o$/).should("have.length", 1);

        getTodoListCount(editor).should("eq", 3);
      });
      it("按delete键", function () {
        const { editor } = this;
        cy.focused().type("{del}");
        cy.contains("div", /^to$/).should("have.length", 1);

        getTodoListCount(editor).should("eq", 3);
      });
      describe("按enter键", function () {
        it("只按一次", function () {
          const { editor } = this;
          cy.focused().type("{enter}", { delay: 50 });
          cy.contains("div", /^t$/).should("have.length", 1);
          cy.contains("div", /^o$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 4);
        });
        it("连续按两次", function () {
          const { editor } = this;
          cy.focused().type("{enter}{enter}", { delay: 50 });
          cy.contains("div", /^t$/).should("have.length", 1);
          cy.contains("div", /^o$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 5);
        });
        it("连续按三次", function () {
          const { editor } = this;
          cy.focused().type("{enter}{enter}{enter}", { delay: 50 });
          cy.contains("div", /^t$/).should("have.length", 1);
          cy.contains("div", /^o$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 6);
        });
      });
      it("按backspace键", function () {
        const { editor } = this;
        cy.focused().type("{backspace}", { delay: 50 });
        cy.contains("div", /^to$/).should("have.length", 1);

        getTodoListCount(editor).should("eq", 3);
      });
    });
    describe("选中多个todo", function () {
      describe("未全选todo", function () {
        beforeEach(function () {
          // 选中one的 ne 到 three 的 thr
          const { editor } = this;
          doSyncFn(() => {
            Transforms.select(editor, {
              anchor: {
                path: [0, 0],
                offset: 1,
              },
              focus: {
                path: [2, 0],
                offset: 3,
              },
            });
          }).wait(50);
        });
        it("输入文字", function () {
          const { editor } = this;
          cy.focused().type("123");
          cy.contains("div", /^o123ee$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 1);
        });
        it("按delete键", function () {
          const { editor } = this;
          cy.focused().type("{del}", { delay: 50 });
          cy.contains("div", /^oee$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 1);
        });
        describe("按enter键", function () {
          it("只按一次", function () {
            const { editor } = this;
            cy.focused().type("{enter}", { delay: 50 });
            cy.contains("div", /^o$/).should("have.length", 1);
            cy.contains("div", /^ee$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 2);
          });
          it("连续按两次", function () {
            const { editor } = this;
            cy.focused().type("{enter}{enter}", { delay: 50 });
            cy.contains("div", /^o$/).should("have.length", 1);
            cy.contains("div", /^ee$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 3);
          });
          it("连续按三次", function () {
            const { editor } = this;
            cy.focused().type("{enter}{enter}{enter}", { delay: 50 });
            cy.contains("div", /^o$/).should("have.length", 1);
            cy.contains("div", /^ee$/).should("have.length", 1);

            getTodoListCount(editor).should("eq", 4);
          });
        });
        it("按backspace键", function () {
          const { editor } = this;
          cy.focused().type("{backspace}", { delay: 50 });
          cy.contains("div", /^oee$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 1);
        });
      });
      describe("选中全部todo", function () {
        beforeEach(function () {
          // 选中one的 ne 到 three 的 thr
          const { editor } = this;
          doSyncFn(() => {
            Transforms.select(editor, {
              anchor: {
                path: [0, 0],
                offset: 0,
              },
              focus: {
                path: [2, 0],
                offset: 5,
              },
            });
          }).wait(50);
        });
        it("输入文字", function () {
          const { editor } = this;
          cy.focused().type("123");
          cy.contains("div", /^123$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 1);
        });
        it("按delete键", function () {
          const { editor } = this;
          cy.focused().type("{del}a", { delay: 50 });

          cy.contains("div", /^a$/).should("have.length", 1);

          getTodoListCount(editor).should("eq", 1);
        });
        describe("按enter键", function () {
          it("只按一次", function () {
            const { editor } = this;
            cy.focused().type("{enter}", { delay: 50 });

            getTodoListCount(editor).should("eq", 2);
          });
          it("连续按两次", function () {
            const { editor } = this;
            cy.focused().type("{enter}{enter}", { delay: 50 });

            getTodoListCount(editor).should("eq", 1);
          });
          it("连续按三次", function () {
            const { editor } = this;
            cy.focused().type("{enter}{enter}{enter}", { delay: 50 });

            getTodoListCount(editor).should("eq", 1);
          });
        });
        it("按backspace键", function () {
          const { editor } = this;
          cy.focused().type("{backspace}", { delay: 50 });

          getTodoListCount(editor).should("eq", 1);
        });
      });
    });
  });
  describe("粘贴", function () {
    describe("粘贴li", function () {
      beforeEach(function () {
        const { editor } = this;
        Transforms.select(editor, Editor.end(editor, []));

        cy.wait(500);
        cy.get(
          `button[${CypressTestFlag}='${CypressFlagValues.ORDER_LIST}']`
        ).click({ force: true });

        cy.focused().type("123{enter}321{enter}333", { delay: 50 });
      });
      it("粘贴单个li进来", function () {
        const editor: EditorType = this.editor;
        var copyedContent: Descendant[] | null = null;
        doSyncFn(() => {
          Transforms.select(editor, {
            anchor: {
              path: [3, 0, 0, 0],
              offset: 0,
            },
            focus: {
              path: [3, 0, 0, 0],
              offset: 3,
            },
          });
          copyedContent = editor.getFragment();
        });

        selectTodoPos(editor, "two", "end");

        doSyncFn(() => {
          copyedContent && editor.insertFragment(copyedContent);
        });

        cy.contains("div", /^two123$/).should("have.length", 1);
        getTodoListCount(editor).should("eq", 3);
      });
      it("粘贴多个li进来", function () {
        const editor: EditorType = this.editor;
        var copyedContent: Descendant[] | null = null;
        doSyncFn(() => {
          Transforms.select(editor, {
            anchor: {
              path: [3, 0, 0, 0],
              offset: 0,
            },
            focus: {
              path: [3, 2, 0, 0],
              offset: 3,
            },
          });
          copyedContent = editor.getFragment();
        });

        selectTodoPos(editor, "two", "end");

        doSyncFn(() => {
          copyedContent && editor.insertFragment(copyedContent);
        });

        cy.contains("div", /^two123$/).should("have.length", 1);
        getTodoListCount(editor).should("eq", 3);
      });
    });
    describe("粘贴td", function () {
      beforeEach(function () {
        const { editor } = this;
        Transforms.select(editor, Editor.end(editor, []));

        cy.wait(500);
        doSyncFn(() => {
          const tableContent = `[{"type":"table","wrapperWidthWhenCreated":1555,"children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":"1"}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":"3"}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":"5"}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":"2"}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":"4"}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":"6"}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}],"tdIsEditing":true},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false}]}]},{"type":"div","children":[{"text":""}]}]`;
          Transforms.insertNodes(editor, JSON.parse(tableContent));
        }).wait(50);
      });
      it("粘贴单个td（非选中）进来", function () {
        const editor: EditorType = this.editor;
        var copyedContent: Descendant[] | null = null;
        doSyncFn(() => {
          const [td] = Editor.nodes(editor, {
            at: [],
            match: (n, p) =>
              Element.isElement(n) &&
              n.type === CET.TD &&
              Editor.string(editor, p, { voids: true }) === "1",
          });
          if (td) {
            Transforms.select(editor, td[1]);
            copyedContent = editor.getFragment();
          }
        });

        selectTodoPos(editor, "two", "end");

        doSyncFn(() => {
          copyedContent && editor.insertFragment(copyedContent);
        });

        cy.contains("div", /^two1$/).should("have.length", 1);
        getTodoListCount(editor).should("eq", 3);
      });
      it("粘贴单个td（选中）进来", function () {
        const editor: EditorType = this.editor;
        doSyncFn(() => {
          const [td] = Editor.nodes(editor, {
            at: [],
            match: (n, p) =>
              Element.isElement(n) &&
              n.type === CET.TD &&
              Editor.string(editor, p, { voids: true }) === "1",
          });
          if (td) {
            Transforms.setNodes(
              editor,
              {
                start: true,
                tdIsEditing: true,
                selected: true,
              },
              {
                at: td[1],
              }
            );
            Transforms.deselect(editor);
            setTimeout(() => {
              TableLogic.copyCells(editor);
            }, 50);
          }
        }).wait(50);

        selectTodoPos(editor, "two", "end");

        doSyncFn(() => {
          editor.insertFragment([]);
        }).wait(50);

        cy.contains("div", /^two1$/).should("have.length", 1);
        getTodoListCount(editor).should("eq", 3);
      });
      it("粘贴多个td进来", function () {
        const editor: EditorType = this.editor;
        doSyncFn(() => {
          const tds = Array.from(
            Editor.nodes(editor, {
              at: [],
              match: (n, p) =>
                Element.isElement(n) &&
                n.type === CET.TD &&
                ["1", "3", "2", "4"].indexOf(
                  Editor.string(editor, p, { voids: true })
                ) !== -1,
            })
          );
          if (tds) {
            tds.forEach((td) => {
              Transforms.setNodes(
                editor,
                {
                  selected: true,
                },
                {
                  at: td[1],
                }
              );
            });
            Transforms.deselect(editor);
            setTimeout(() => {
              TableLogic.copyCells(editor);
            }, 50);
          }
        }).wait(50);

        selectTodoPos(editor, "two", "end");

        doSyncFn(() => {
          editor.insertFragment([]);
        }).wait(50);

        cy.contains("div", /^two1$/).should("have.length", 1);
        getTodoListCount(editor).should("eq", 3);
      });
    });
    it("粘贴其他todo内容进来", function () {
      // 选中one的 ne 到 three 的 thr
      const editor: EditorType = this.editor;
      var copyedContent: Descendant[] | null = null;
      doSyncFn(() => {
        Transforms.select(editor, {
          anchor: {
            path: [0, 0],
            offset: 1,
          },
          focus: {
            path: [0, 0],
            offset: 2,
          },
        });
        copyedContent = editor.getFragment();
      }).wait(50);

      selectTodoPos(editor, "two", "end");

      doSyncFn(() => {
        copyedContent && editor.insertFragment(copyedContent);
      });

      cy.contains("div", /^twon$/).should("have.length", 1);
      getTodoListCount(editor).should("eq", 3);
    });
    it("粘贴普通文本过来", function () {
      const editor: EditorType = this.editor;
      var copyedContent: Descendant[] | null = null;
      doSyncFn(() => {
        Transforms.select(editor, Editor.end(editor, []));

        Transforms.insertText(editor, "123");

        Transforms.select(editor, [3]);

        copyedContent = editor.getFragment();
      }).wait(50);

      selectTodoPos(editor, "two", "end");

      doSyncFn(() => {
        copyedContent && editor.insertFragment(copyedContent);
      });

      cy.contains("div", /^two123$/).should("have.length", 1);
      getTodoListCount(editor).should("eq", 3);
    });
    it("粘贴带inline元素的文本过来", function () {
      const editor: EditorType = this.editor;
      var copyedContent: Descendant[] | null = null;

      doSyncFn(() => {
        Transforms.select(editor, Editor.end(editor, []));

        Transforms.insertText(editor, "123");

        Transforms.insertNodes(editor, {
          type: CET.IMG,
          children: [{ text: "" }],
        });
        Transforms.move(editor);
        Transforms.insertText(editor, "321");

        Transforms.select(editor, [3]);

        copyedContent = editor.getFragment();
      }).wait(50);

      selectTodoPos(editor, "two", "end");

      doSyncFn(() => {
        copyedContent && editor.insertFragment(copyedContent);
      });

      cy.contains("div", /^two123/).should("have.length", 1);
      cy.contains("div", /321$/).should("have.length", 1);
      getTodoListCount(editor).should("eq", 3);

      doSyncFn(() => {
        const [todo] = Editor.nodes(editor, {
          at: [],
          match: (n, p) => {
            return (
              ToDoListLogic.isTodoList(n) &&
              Editor.string(editor, p, { voids: false }) === "two123321"
            );
          },
        });
        return todo;
      }, 500).should("not.be.empty");
    });
  });
  describe("切换todo", function () {
    it("切换第一个todo，再切换回来", function () {
      const editor: EditorType = this.editor;
      selectTodoPos(editor, "one", "end");

      cy.wait(500);
      cy.get(
        `button[${CypressTestFlag}='${CypressFlagValues.TODO_LIST}']`
      ).click({ force: true });

      getTodoListCount(editor).should("eq", 2);

      doSyncFn(() => {
        const tws = Array.from(
          Editor.nodes(editor, {
            at: [],
            match: (n, p) =>
              utils.isTextWrapper(n) && Editor.string(editor, p) === "one",
          })
        );
        Transforms.select(editor, {
          anchor: Editor.start(editor, tws[0][1]),
          focus: Editor.end(editor, tws[0][1]),
        });
      }, 500);

      cy.wait(500);
      cy.get(
        `button[${CypressTestFlag}='${CypressFlagValues.TODO_LIST}']`
      ).click({ force: true });

      getTodoListCount(editor).should("eq", 3);
    });
    it("切换第二个todo", function () {
      const editor: EditorType = this.editor;
      selectTodoPos(editor, "two", "end");

      cy.wait(500);
      cy.get(
        `button[${CypressTestFlag}='${CypressFlagValues.TODO_LIST}']`
      ).click({ force: true });

      getTodoListCount(editor).should("eq", 2);
    });
    it("先切换三个todo(取消)，再切换回来", function () {
      const editor: EditorType = this.editor;

      doSyncFn(() => {
        const todos = Array.from(
          Editor.nodes(editor, {
            at: [],
            match: (n) => ToDoListLogic.isTodoList(n),
          })
        );
        Transforms.select(editor, {
          anchor: Editor.start(editor, todos[0][1]),
          focus: Editor.end(editor, todos[2][1]),
        });
      });

      cy.wait(500);
      cy.get(
        `button[${CypressTestFlag}='${CypressFlagValues.TODO_LIST}']`
      ).click({ force: true });

      getTodoListCount(editor).should("eq", 0);

      doSyncFn(() => {
        const tWrappers = Array.from(
          Editor.nodes(editor, {
            at: [],
            match: (n) => utils.isTextWrapper(n),
          })
        );
        return tWrappers.length;
      }, 500).should("eq", 4); // 因为文档的最后一行永远是一个tw

      doSyncFn(() => {
        const tws = Array.from(
          Editor.nodes(editor, {
            at: [],
            match: (n) => utils.isTextWrapper(n),
          })
        );
        Transforms.select(editor, {
          anchor: Editor.start(editor, tws[0][1]),
          focus: Editor.end(editor, tws[2][1]),
        });
      });

      cy.wait(500);
      cy.get(
        `button[${CypressTestFlag}='${CypressFlagValues.TODO_LIST}']`
      ).click({ force: true });

      getTodoListCount(editor).should("eq", 3);
    });
    it.skip("切换三个li为todo【不打算实现】", function () {});
    it.skip("将带有inline元素的文本切换成todo【与普通文本的切换一样】", function () {});
  });
});
