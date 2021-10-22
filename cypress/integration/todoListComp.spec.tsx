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
  unmount();
});

describe("测试TODO组件", function () {
  describe("没有选区时", function () {
    describe("非空todo", function () {
      describe("光标在开头位置", function () {
        it("输入文字", function () {});
        it("按delete键", function () {});
        describe("按enter键", function () {
          it("只按一次", function () {});
          it("连续按两次", function () {});
          it("连续按三次", function () {});
        });
        describe("按backspace键", function () {
          it("位于第一个todo", function () {});
          it("位于第二个todo", function () {});
        });
      });
      describe("光标在中间位置", function () {
        it("输入文字", function () {});
        it("按delete键", function () {});
        describe("按enter键", function () {
          it("只按一次", function () {});
          it("连续按两次", function () {});
          it("连续按三次", function () {});
        });
        describe("按backspace键", function () {
          it("位于第一个todo", function () {});
          it("位于第二个todo", function () {});
        });
      });
      describe("光标在结尾位置", function () {
        it("输入文字", function () {});
        describe("按delete键", function () {
          it("位于第三个todo", function () {});
          it("位于第二个todo", function () {});
        });
        describe("按enter键", function () {
          it("只按一次", function () {});
          it("连续按两次", function () {});
          it("连续按三次", function () {});
        });
        it("按backspace键", function () {});
      });
    });
    describe("空todo", function () {
      it("输入文字", function () {});
      describe("按delete键", function () {
        it("位于第三个todo", function () {});
        it("位于第二个todo", function () {});
      });
      describe("按enter键", function () {
        it("只按一次", function () {});
        it("连续按两次", function () {});
        it("连续按三次", function () {});
      });
      describe("按backspace键", function () {
        it("位于第一个todo", function () {});
        it("位于第二个todo", function () {});
      });
    });
  });
  describe("有选区时", function () {
    describe("选中单个todo", function () {
      // 部分选和全选行为一致
      it("输入文字", function () {});
      it("按delete键", function () {});
      describe("按enter键", function () {
        it("只按一次", function () {});
        it("连续按两次", function () {});
        it("连续按三次", function () {});
      });
      describe("按backspace键", function () {});
    });
    describe("选中多个todo", function () {
      describe("未全选todo", function () {
        it("输入文字", function () {});
        it("按delete键", function () {});
        describe("按enter键", function () {
          it("只按一次", function () {});
          it("连续按两次", function () {});
          it("连续按三次", function () {});
        });
        describe("按backspace键", function () {});
      });
      describe("选中全部todo", function () {
        it("输入文字", function () {});
        it("按delete键", function () {});
        describe("按enter键", function () {
          it("只按一次", function () {});
          it("连续按两次", function () {});
          it("连续按三次", function () {});
        });
        describe("按backspace键", function () {});
      });
    });
  });
  describe("粘贴", function () {
    it("粘贴单个li进来", function () {});
    it("粘贴多个li进来", function () {});
    it("粘贴单个td进来", function () {});
    it("粘贴多个td进来", function () {});
    it("粘贴其他todo内容进来", function () {});
    it("粘贴普通文本过来", function () {});
    it("粘贴带inline元素的文本过来", function () {});
  });
  describe("切换todo", function () {
    it("切换第一个todo", function () {});
    it("切换第二个todo", function () {});
    it("切换三个todo(取消)", function () {});
    it("切换三个普通文本为todo", function () {});
    it("切换三个li为todo", function () {});
    it("将普通文本切换成todo", function () {});
    it("将带有inline元素的文本切换成todo", function () {});
  });
//   it("demo", function () {
//     const { editor } = this;
//     selectTodoPos(editor, "three", "start");
//     cy.focused().type("hahahah");
//   });
});
