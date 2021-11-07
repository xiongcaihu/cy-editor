/* eslint-disable no-loop-func */
/* eslint-disable no-throw-literal */
/* eslint-disable no-undef */
import { mount, unmount } from "@cypress/react";
import CyEditor from "../../src/components/RichEditor/RichEditor";
import {
  CypressFlagValues,
  CypressTestFlag,
  EditorType,
} from "../../src/components/RichEditor/common/Defines";
import { doSyncFn } from "../support/tool";
import { Editor, Transforms } from "slate";
import { ReactEditor } from "slate-react";

var content = `[{"type":"div","children":[{"text":"font in normal textWrapper"}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"font in list1"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"font in list2"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"font in list3"}]}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"font in list4"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"font in list5"}]}]}]},{"type":"todo","children":[{"text":"font in todo1"}]},{"type":"todo","children":[{"text":"font in todo2"}]},{"type":"div","children":[{"text":""},{"type":"link","url":"http://www.baidu.com","children":[{"text":"font in link"}]},{"text":""}]},{"type":"table","wrapperWidthWhenCreated":1555,"children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":"font in cell1"}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":155.5,"height":30,"children":[{"type":"div","children":[{"text":"font in cell2"}]}]}],"shouldEmpty":false}]}]},{"type":"div","children":[{"text":""}]}]`;

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

describe("测试font改变属性", function () {
  const selectText = (editor: EditorType, text: string) => {
    return doSyncFn(() => {
      ReactEditor.focus(editor);
      Transforms.deselect(editor);
      const [match] = Editor.nodes(editor, {
        at: [],
        mode: "lowest",
        match: (n, p) => Editor.string(editor, p, { voids: true }) === text,
      });
      match && Transforms.select(editor, match[1]);
    }, 50);
  };
  const styleItems = [
    {
      title: "粗体",
      menuButtonSelector: `[${[CypressTestFlag]}='${
        CypressFlagValues.SET_BOLD
      }']`,
      valideStyleContent: "font-weight: bold;",
    },
    {
      title: "斜体",
      menuButtonSelector: `[${[CypressTestFlag]}='${
        CypressFlagValues.SET_ITALIC
      }']`,
      valideStyleContent: "font-style: italic;",
    },
    {
      title: "下划线",
      menuButtonSelector: `[${[CypressTestFlag]}='${
        CypressFlagValues.SET_UNDERLINE
      }']`,
      valideStyleContent: "text-decoration: underline;",
    },
    {
      title: "贯穿线",
      menuButtonSelector: `[${[CypressTestFlag]}='${
        CypressFlagValues.SET_LINETHROUGH
      }']`,
      valideStyleContent: "text-decoration: line-through;",
    },
  ];
  const fontSizeButton = `[${[CypressTestFlag]}='${
    CypressFlagValues.SET_FONT_SIZE
  }']`;
  const fontAlignButton = `[${[CypressTestFlag]}='${
    CypressFlagValues.SET_FONT_ALIGN
  }']`;
  describe("改变字体包裹", function () {
    const fontWrapperButtonSelector = `[${[CypressTestFlag]}='${
      CypressFlagValues.WRAP_FONT_COMP
    }']`;
    const chooseH1 = () => {
      cy.wait(50);
      cy.get(fontWrapperButtonSelector).trigger("mousedown");
      cy.wait(50);
      cy.get(".cyEditor__toolbar__dropdown")
        .filter(":visible")
        .contains("H1")
        .click();
    };
    const chooseNormal = () => {
      cy.wait(50);
      cy.get(fontWrapperButtonSelector).trigger("mousedown");
      cy.wait(50);
      cy.get(".cyEditor__toolbar__dropdown")
        .filter(":visible")
        .contains("正文")
        .click();
    };
    describe("从正文到h1，再从h1到正文", function () {
      it("处于普通文本-1", function () {
        cy.contains("font in normal textWrapper").realClick({
          position: "right",
        });

        chooseH1();

        cy.contains("h1", "font in normal textWrapper").should(
          "have.length",
          1
        );

        chooseNormal();

        cy.contains("h1", "font in normal textWrapper").should(
          "have.length",
          0
        );
      });
      it("处于list-1", function () {
        cy.contains("font in list2").realClick({
          position: "right",
        });

        chooseH1();

        cy.contains("h1", "font in list2").should("have.length", 1);
        cy.get("li").should("have.length", 5);

        chooseNormal();

        cy.contains("h1", "font in list2").should("have.length", 0);
        cy.get("li").should("have.length", 5);
      });
      it("处于todo-1", function () {
        cy.contains("font in todo1").realClick({
          position: "right",
        });

        chooseH1();

        cy.contains("h1", "font in todo1").should("have.length", 1);
        cy.get("input[type='checkbox']").should("have.length", 2);

        chooseNormal();

        cy.contains("h1", "font in todo1").should("have.length", 0);

        cy.get("input[type='checkbox']").should("have.length", 2);
      });
      it("处于表格-1", function () {
        cy.contains("font in cell1").realClick({
          position: "right",
        });

        chooseH1();

        cy.contains("h1", "font in cell1").should("have.length", 1);

        chooseNormal();

        cy.contains("h1", "font in cell1").should("have.length", 0);
      });
    });
  });
  describe("改变字体大小", function () {
    const changeFontSize = [12, 24];
    const matchText = [
      "font in normal textWrapper",
      "font in list2",
      "font in todo1",
      "font in cell1",
    ];
    describe("改为12px和24px", function () {
      const setFontSize = (size: number) => {
        cy.get(fontSizeButton).realMouseDown();
        cy.wait(50);
        cy.get(".cyEditor__toolbar__dropdown")
          .filter(":visible")
          .contains(String(size) + "px")
          .click();
      };
      changeFontSize.forEach((size) => {
        matchText.forEach((text) => {
          it(`设置文本：【${text}】的文字大小为【${size}】px`, function () {
            cy.contains(text).realClick({
              position: "right",
            });

            selectText(this.editor, text);

            setFontSize(size);

            cy.get(`[style="font-size: ${size}px;"]`)
              .should("have.length", 1)
              .and("contain.text", text);
          });
        });
      });
    });
  });
  describe("改变对齐方式", function () {
    const matchText = [
      "font in normal textWrapper",
      "font in list2",
      "font in todo1",
      "font in cell1",
    ];
    const setFontAlign = (align: string) => {
      cy.get(fontAlignButton).realMouseDown();
      cy.wait(50);
      cy.get(".cyEditor__toolbar__dropdown")
        .filter(":visible")
        .contains(String(align))
        .click();
    };
    const aligns = ["左对齐", "右对齐", "居中对齐"];
    aligns.forEach((align) => {
      matchText.forEach((text) => {
        it(`设置文本：【${text}】的对齐方式为【${align}】`, function () {
          cy.contains(text).realClick({
            position: "right",
          });

          selectText(this.editor, text);

          setFontAlign(align);

          cy.get(
            `[style="text-align: ${
              align === "左对齐"
                ? "left"
                : align === "右对齐"
                ? "right"
                : "center"
            };"]`
          )
            .should("have.length", 1)
            .and("contain.text", text);
        });
      });
    });
  });
  describe.skip("改变字体颜色【暂不测试，因为颜色不确定】", function () {
    it("处于普通文本", function () {});
    it("处于list", function () {});
    it("处于todo", function () {});
    it("处于表格", function () {});
  });
  describe.skip("改变背景色【暂不测试，因为颜色不确定】", function () {
    it("处于普通文本", function () {});
    it("处于list", function () {});
    it("处于todo", function () {});
    it("处于表格", function () {});
  });
  describe("改变字体样式", function () {
    const matchText = [
      "font in normal textWrapper",
      "font in list2",
      "font in todo1",
      "font in cell1",
    ];
    const triggerMenuStyleButton = (buttonSelector: string) => {
      cy.get(buttonSelector).realMouseDown();
      cy.wait(50);
    };
    styleItems.forEach((item) => {
      matchText.forEach((text) => {
        it(`设置字体【${text}】为【${item.title}】`, function () {
          cy.contains(text).realClick({
            position: "right",
          });

          selectText(this.editor, text);

          triggerMenuStyleButton(item.menuButtonSelector);

          cy.get(`[style="${item.valideStyleContent}"]`)
            .should("have.length", 1)
            .and("contain.text", text);
        });
      });
    });
  });
  describe("格式刷", function () {
    const matchText = [
      "font in normal textWrapper",
      "font in list2",
      "font in todo1",
      "font in cell1",
    ];
    const loopSync = (fns: Function[]) => {
      const fn = fns.shift();
      fn?.();
      if (fns.length === 0) return;
      loopSync(fns);
    };
    const addStyleToText = (editor: EditorType, text: string) => {
      selectText(editor, text);

      loopSync(
        styleItems.map((item) => {
          return () => {
            cy.get(item.menuButtonSelector).trigger("mousedown");
            cy.wait(50);
          };
        })
      );

      loopSync(
        [
          {
            selector: fontAlignButton,
            value: "右对齐",
          },
          {
            selector: fontSizeButton,
            value: "24px",
          },
        ].map((o) => {
          return () => {
            selectText(editor, text);
            cy.get(o.selector).trigger("mousedown");
            cy.get(".cyEditor__toolbar__dropdown")
              .filter(":visible")
              .contains(String(o.value))
              .click();
          };
        })
      );

      return cy.wait(50);
    };

    const formatButtonSelector = `[${CypressTestFlag}='${CypressFlagValues.COPY_FORMAT}']`;
    // 从当前位置复制文字样式到其他地方
    matchText.forEach((targetText) => {
      matchText.forEach((copyedText) => {
        if (copyedText === targetText) return;
        it(`从【${copyedText}】复制样式到【${targetText}】`, function () {
          addStyleToText(this.editor, copyedText);
          cy.wait(50);

          selectText(this.editor, copyedText);
          cy.wait(50);
          cy.get(formatButtonSelector).realMouseDown();
          cy.wait(50);

          selectText(this.editor, targetText);
          cy.wait(50);

          cy.contains(targetText).realClick();

          cy.wait(300);

          cy.contains("span", targetText)
            .parents("[data-slate-leaf]")
            .eq(0)
            .should((el) => {
              const targetStyle = el.attr("style");
              expect(targetStyle).not.eq(undefined);
              const expectStyle = `font-weight: bold; font-style: italic; text-decoration: underline line-through; font-size: 24px;`;
              const tSet = new Set(targetStyle && targetStyle.split(";"));
              expect(expectStyle.split(";").every((s) => tSet.has(s))).eq(true);
            });
          cy.get(`[style="text-align: right;"]`).should((els) => {
            expect(els.length).eq(2);
            els.each((i, eq) => {
              expect(
                eq.textContent &&
                  [copyedText, targetText].includes(eq.textContent)
              ).eq(true);
            });
          });
        });
      });
    });
  });
  describe("清除格式", function () {});
});
