/* eslint-disable no-loop-func */
/* eslint-disable no-throw-literal */
/* eslint-disable no-undef */
import * as React from "react";
import { mount, unmount } from "@cypress/react";
import CyEditor from "../../src/components/RichEditor/RichEditor";
import { ReactEditor } from "slate-react";
import { Editor, NodeEntry, Transforms } from "slate";
import {
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
            unmount();
            done();
          }, 2000);
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

describe("测试delete键", function () {
  it("在非空li的末尾按delete键", function () {
    const editor = this.editor;

    cy.contains("li", /^banana$/).then(($li) => {
      const li = getSlateNodeEntry(editor, $li);
      Transforms.select(editor, Editor.end(editor, li[1]));

      cy.focused().type("{del}");
      cy.get("ol").should("have.length", 2);
      cy.get("ol").eq(1).children().should("have.length", 1);
      cy.contains("li", /^bananatwo apple$/).should("have.length", 1);
    });

    cy.contains("li", /^bananatwo apple$/).then(($li) => {
      const li = getSlateNodeEntry(editor, $li);
      Transforms.select(editor, Editor.end(editor, li[1]));
      cy.focused().type("{del}");
      cy.get("ol").should("have.length", 1);
      cy.get("ol").eq(0).children().should("have.length", 4);
      cy.contains("li", /^bananatwo applethree apple$/).should(
        "have.length",
        1
      );
    });
  });

  it("在空li里delete键", function () {
    const editor = this.editor;

    cy.contains("li", /^banana$/).then(($li) => {
      const li = getSlateNodeEntry(editor, $li);
      Transforms.select(editor, Editor.start(editor, li[1]));

      cy.focused().type("{del}{del}{del}{del}{del}{del}{del}", { delay: 100 });
      cy.get("ol").should("have.length", 2);
      cy.get("ol").eq(0).children().should("have.length", 4);
      cy.get("ol").eq(1).children().should("have.length", 2);
    });
  });
});

describe("测试回车和正向tab和反向tab", function () {
  it("测试回车和tab功能", function () {
    const editor = this.editor;

    cy.contains("li", "banana").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.end(editor, li[1]));

      Editor.insertBreak(editor);
      Editor.insertText(editor, "haha");

      cy.focused().tab();
    });

    cy.get("ol").eq(0).children().should("have.length", 5);
    cy.get("ol").eq(1).children().should("have.length", 3);

    cy.focused().tab({ shift: true });

    cy.get("ol").eq(0).children().should("have.length", 6);
    cy.get("ol").eq(1).children().should("have.length", 2);

    cy.contains("li", "three apple").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.end(editor, li[1]));
      cy.focused().tab({ shift: true });
    });

    cy.contains("li", "iphone").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.end(editor, li[1]));
      cy.focused().tab();
    });

    cy.get("ol").should("have.length", 3);

    cy.contains("li", "three apple").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.end(editor, li[1]));
      cy.focused().tab();
    });

    cy.get("ol").should("have.length", 2);
    cy.get("ol").eq(0).children().should("have.length", 5);
    cy.get("ol").eq(1).children().should("have.length", 3);
  });

  it("测试在li的最后一个位置连续回车", function () {
    const editor = this.editor;

    cy.contains("li", "two apple").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.end(editor, li[1]));
    });

    cy.focused().type("{enter}{enter}");

    cy.get("ol").should("have.length", 3);
    cy.get("ol").eq(0).children().should("have.length", 7);
    cy.get("ol").eq(1).children().should("have.length", 1);
    cy.get("ol").eq(2).children().should("have.length", 1);

    cy.focused().type("{enter}");

    cy.get("ol").should("have.length", 4);
    cy.get("ol").eq(0).children().should("have.length", 3);
    cy.get("ol").eq(1).children().should("have.length", 1);
    cy.get("ol").eq(2).children().should("have.length", 3);
    cy.get("ol").eq(3).children().should("have.length", 1);
  });

  it("第一级li进行shift tab", function () {
    const editor = this.editor;
    cy.contains("li", "apple").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.start(editor, li[1]));
      cy.focused().tab({ shift: true });
    });
    cy.get("ol").should("have.length", 2);
    cy.get("ol").eq(0).children().should("have.length", 5);
    cy.get("ol").eq(1).children().should("have.length", 2);
    cy.contains("li", "two apple").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.start(editor, li[1]));
      cy.focused().tab({ shift: true });
    });
    cy.get("ol").should("have.length", 2);
    cy.get("ol").eq(0).children().should("have.length", 6);
    cy.get("ol").eq(1).children().should("have.length", 1);
    cy.contains("li", "three apple").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.start(editor, li[1]));
      cy.focused().tab({ shift: true });
    });
    cy.get("ol").should("have.length", 1);
    cy.get("ol").eq(0).children().should("have.length", 6);
  });
});

describe("测试区域操作", function () {
  it("全选list，删除", function () {
    const editor = this.editor;
    // 全选list，然后按退格键，判断是否不再有list
    cy.get("ol")
      .eq(0)
      .then((el) => {
        const ol = getSlateNodeEntry(editor, el);
        Transforms.select(editor, ol[1]);

        cy.focused().type("{backspace}");
      });
    cy.get("ol").should("have.length", 1);
    cy.get("ol").children().should("have.length", 1);
  });

  it("区域删除", function () {
    const editor = this.editor;
    // 选中banana的第一个位置和haha的倒数第二个位置，然后判断结果是否正确
    cy.contains("li", "banana").then((el) => {
      cy.contains("li", "two apple").then((el2) => {
        const li = getSlateNodeEntry(editor, el);
        const li2 = getSlateNodeEntry(editor, el2);

        const p1 =
          Editor.after(editor, Editor.start(editor, li[1])) ||
          Editor.start(editor, li[1]);
        const p2 =
          Editor.before(editor, Editor.end(editor, li2[1])) ||
          Editor.end(editor, li2[1]);

        Transforms.select(editor, {
          anchor: p1,
          focus: p2,
        });

        cy.focused().type("{backspace}");
      });
    });

    cy.contains("li", /^be$/).should("be.visible");
    cy.get("ol").eq(0).children().should("have.length", 5);
    cy.get("ol").eq(1).children().should("have.length", 1);
  });

  it("全选某个li，然后按两下退格", function () {
    const editor = this.editor;
    cy.contains("li", "two apple").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, li[1]);
      Transforms.delete(editor, {
        reverse: true,
      });
      Transforms.delete(editor, {
        reverse: true,
      });
    });

    cy.get("ol").eq(0).children().should("have.length", 5);
    cy.get("ol").eq(1).children().should("have.length", 1);

    cy.contains("li", "three apple").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, li[1]);
      Transforms.delete(editor, {
        reverse: true,
      });
      Transforms.delete(editor, {
        reverse: true,
      });
    });

    cy.get("ol").eq(0).children().should("have.length", 4);
    cy.get("ol").should("have.length", 1);
  });
});

describe("测试退格", function () {
  it("在li第一个位置退格", function () {
    const editor = this.editor;

    cy.contains("li", "two apple").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.start(editor, li[1]));

      cy.focused().type("{backspace}");
      cy.contains("li", /^bananatwo apple$/).should("have.length", 1);
    });

    cy.get("ol").should("have.length", 2);
    cy.get("ol").eq(0).children().should("have.length", 5);
    cy.get("ol").eq(1).children().should("have.length", 1);

    cy.contains("li", "iphone").then((el) => {
      const li = getSlateNodeEntry(editor, el);
      Transforms.select(editor, Editor.start(editor, li[1]));

      cy.focused().type("{backspace}");
      cy.focused().type("{backspace}");
      cy.focused().type("{backspace}");
      cy.contains("li", /^three appiphone$/).should("have.length", 1);
    });

    cy.get("ol").should("have.length", 2);
    cy.get("ol").eq(0).children().should("have.length", 4);
    cy.get("ol").eq(1).children().should("have.length", 1);
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

    cy.get("ul").should("have.length", 1);
    cy.get("ol").should("have.length", 1);
    cy.get("ul").eq(0).children().should("have.length", 5);
    cy.get("ol").eq(0).children().should("have.length", 2);
  });
});
