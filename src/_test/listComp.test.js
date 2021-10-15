/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable no-undef */
import { mount, unmount } from "@cypress/react";
import CyEditor from "../components/RichEditor/RichEditor";
import { ReactEditor } from "slate-react";
import { Editor, Transforms } from "slate";

const content = `[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"apple"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"banana"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"two apple"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"three apple"}]}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"iphone"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"ios"}]}]}]}]`;

const getSlateNodeEntry = (editor, jqEl) => {
  try {
    const node = ReactEditor.toSlateNode(editor, jqEl.get(0));
    const nodePath = ReactEditor.findPath(editor, node);
    return [node, nodePath];
  } catch (error) {
    console.error("get slate node error");
    console.error(error);
    return null;
  }
};

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
  // cy.wait(200);
  unmount();
});

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

      const p1 = Editor.after(editor, Editor.start(editor, li[1]));
      const p2 = Editor.before(editor, Editor.end(editor, li2[1]));

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

it("在li第一个位置退格", function () {
  const editor = this.editor;

  cy.contains("li", "two apple").then((el) => {
    const li = getSlateNodeEntry(editor, el);
    Transforms.select(editor, Editor.start(editor, li[1]));

    cy.focused().type("{backspace}");
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
  });

  cy.get("ol").should("have.length", 2);
  cy.get("ol").eq(0).children().should("have.length", 4);
  cy.get("ol").eq(1).children().should("have.length", 1);
});
