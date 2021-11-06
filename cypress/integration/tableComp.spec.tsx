/* eslint-disable no-loop-func */
/* eslint-disable no-throw-literal */
/* eslint-disable no-undef */
import { mount, unmount } from "@cypress/react";
import CyEditor from "../../src/components/RichEditor/RichEditor";
import { Editor, Transforms } from "slate";
import { EditorType } from "../../src/components/RichEditor/common/Defines";
import { ToDoListLogic } from "../../src/components/RichEditor/comps/TodoListComp";
import { TableLogic } from "../../src/components/RichEditor/comps/Table";
import { utils } from "../../src/components/RichEditor/common/utils";
import { TdLogic } from "../../src/components/RichEditor/comps/Td";
import { ListLogic } from "../../src/components/RichEditor/comps/ListComp";
import { doCopy, doPaste, doSyncFn, getSlateNodeEntry } from "../support/tool";

const emptyContent = `[{"type":"div","children":[{"text":""}]}]`;
var content = emptyContent;

// 直接使用手动建好的表格数据
function makeTable() {
  return cy.wrap(
    `[{"type":"div","children":[{"text":"text1"}]},{"type":"table","wrapperWidthWhenCreated":1538,"children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"1"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"2"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"3"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"merge cell1"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"merge cell2"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"merge cell3"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"merge cell4"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"4"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"5"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"6"}]}]}],"shouldEmpty":false}]}]},{"type":"div","children":[{"text":"text2"}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"list1"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"list2"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"list2.1"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"list2.2"}]}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"list3"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"list4"}]}]}]},{"type":"todo","children":[{"text":"todo1"}]},{"type":"todo","children":[{"text":"todo2"}]},{"type":"todo","children":[{"text":"todo3"}]},{"type":"div","children":[{"text":"table2"}]},{"type":"table","wrapperWidthWhenCreated":1538,"children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","width":769,"height":30,"children":[{"type":"div","children":[{"text":"table2.1"}]}]},{"type":"td","width":769,"height":30,"children":[{"type":"div","children":[{"text":"table2.2"}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":769,"height":30,"children":[{"type":"div","children":[{"text":"table2.3"}]}]},{"type":"td","width":769,"height":30,"children":[{"type":"div","children":[{"text":"table2.4"}]}],"tdIsEditing":true,"start":true}],"shouldEmpty":false}]}]},{"type":"div","children":[{"text":""}]}]`
  ); // 为了让此函数变成promise函数，等待cypress命令全部结束后才返回
}

/**
 * 选中单个td或者将光标移动到td的指定位置
 *
 * @param {EditorType} editor
 * @param {number} tableIndex 第几个table，本测试用例中最多两个table，大部分情况是第一个table
 * @param {("start" | "end")} [index] // start表示第一个td，end表示最后一个td
 * @param {("start" | "end")} [pos]
 * @returns
 */
function selectTd(
  editor: EditorType,
  tableIndex: number,
  index?: "start" | "end",
  pos?: "start" | "end"
) {
  const tables = Array.from(
    Editor.nodes(editor, {
      at: [],
      match: (n) => TableLogic.isTable(n),
    })
  );
  if (tables.length > 0) {
    const table = tables[tableIndex];
    const [td] = Editor.nodes(editor, {
      at:
        index === "start"
          ? Editor.start(editor, table[1])
          : Editor.end(editor, table[1]),
      mode: "lowest",
      match: (n) => TableLogic.isTd(n),
    });
    if (!td) return;
    if (pos) {
      // 表示要将光标移动到某个td的某个位置
      Transforms.select(
        editor,
        pos === "start"
          ? Editor.start(editor, td[1])
          : Editor.end(editor, td[1])
      );
      Transforms.setNodes(
        editor,
        {
          tdIsEditing: true,
        },
        {
          at: td[1],
        }
      );
    } else {
      Transforms.setNodes(
        editor,
        {
          selected: true,
          start: true,
        },
        {
          at: td[1],
        }
      );
    }
  }
}

function chooseTd(text: string) {
  return cy
    .get("td")
    .filter((index, td) => td.innerText === text)
    .eq(0)
    .dblclick(1, 1);
}

/**
 * 选中包含在以开头到结尾td为矩形区域内容的所有td
 *
 * @param {number} tableIndex
 * @param {string} startTdText 最好td里有唯一的内容，方便筛选
 * @param {string} endTdText
 * @returns
 */
function selectMultiTds(
  tableIndex: number,
  startTdText: string,
  endTdText: string
) {
  let td1: HTMLTableCellElement, td2: HTMLTableCellElement;
  return getTdByText(tableIndex, startTdText)
    .eq(0)
    .then((el) => {
      td1 = el.get(0) as HTMLTableCellElement;
      return getTdByText(tableIndex, endTdText)
        .eq(0)
        .then((el) => {
          td2 = el.get(0) as HTMLTableCellElement;
          const startPosX = td1.offsetLeft || 0,
            startPosY = td1.offsetTop || 0;
          const endPosX = td2.offsetLeft || 0,
            endPosY = td2.offsetTop || 0;
          return cy
            .get("table")
            .eq(tableIndex)
            .trigger("mousedown", startPosX, startPosY)
            .trigger("mousemove", endPosX, endPosY)
            .trigger("mouseup");
        });
    });
}

/**
 *
 * @param editor
 * @param pos
 * @returns
 */
function moveCursorToTd(
  editor: EditorType,
  pos: {
    tableIndex: number;
    rowIndex: number; // 用法和cypress eq里的参数一样
    colIndex: number;
    at: "start" | "end" | "all";
  }
) {
  return getJqTd(pos.tableIndex, pos.rowIndex, pos.colIndex).then(($td) => {
    return doSyncFn(() => {
      const td = getSlateNodeEntry(editor, $td);
      const range =
        pos.at === "start"
          ? Editor.start(editor, td[1])
          : pos.at === "end"
          ? Editor.end(editor, td[1])
          : Editor.range(editor, td[1]);
      td && Transforms.select(editor, range);
    }, 50);
  });
}

/**
 * 获取包含指定文本的td
 * @param editor
 * @param text
 * @returns
 */
function getTd(editor: EditorType, text: string) {
  const [td] = Editor.nodes(editor, {
    at: [],
    match: (n, p) => {
      return TableLogic.isTd(n) && Editor.string(editor, p) === text;
    },
  });
  return td;
}

function getJqTd(tableIndex: number, rowIndex: number, colIndex: number) {
  return cy
    .get("table")
    .eq(tableIndex)
    .find("tr")
    .eq(rowIndex)
    .find("td")
    .eq(colIndex);
}

function getTdByText(tableIndex: number, text: string) {
  return cy
    .get("table")
    .eq(tableIndex)
    .find("td")
    .filter((index, td) => td.innerText === text);
}

function getTextWrapper(editor: EditorType, text: string) {
  const [tw] = Editor.nodes(editor, {
    at: [],
    match: (n, p) =>
      utils.isTextWrapper(n) &&
      Editor.string(editor, p, { voids: true }) === text,
  });

  return tw;
}

before((done) => {
  console.clear();
  console.log("开始生成数据");
  content = emptyContent;
  // 第一次运行的时候，生成测试数据
  mount(
    <CyEditor
      content={emptyContent}
      getEditor={() => {
        makeTable().then((data) => {
          console.log("数据生成完毕");
          setTimeout(() => {
            content = data;
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

describe("测试Table组件", function () {
  describe("基本输入", function () {
    describe("输入普通文本", function () {
      it("处于第一个td", function () {
        const editor: EditorType = this.editor;
        selectTd(editor, 0, "start", "start");

        cy.focused().type("haha");

        cy.contains("td", "haha1").should("have.length", 1);
      });
      it("处于最后一个td", function () {
        const editor: EditorType = this.editor;
        selectTd(editor, 0, "end", "start");

        cy.focused().type("haha");

        cy.contains("td", "haha6").should("have.length", 1);
      });
    });
    describe("输入delete键", function () {
      describe("处于第一个td", function () {
        it("光标在td第一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "start", "start");

          cy.focused().type("{del}");

          cy.get("td").eq(0).should("not.contain.text");
        });
        it("光标在td最后一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "start", "end");

          cy.focused().type("{del}");

          cy.contains("td", "1").should("have.length", 1);

          cy.contains("td", "2").should("have.length", 1);
        });
      });
      describe("处于最后一个td", function () {
        it("光标在td第一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "end", "start");

          cy.focused().type("{del}");

          cy.get("table").eq(0).find("td").last().should("not.contain.text");
        });
        it("光标在td最后一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "end", "end");

          cy.focused().type("{del}");

          cy.contains("td", "6").should("have.length", 1);

          cy.contains("text2").should("have.length", 1);
        });
      });
    });
    describe("输入backspace键", function () {
      describe("处于第一个td", function () {
        it("光标在td第一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "start", "start");

          cy.focused().type("{backspace}");

          cy.contains("td", "1").should("have.length", 1);
          cy.contains("text1").should("have.length", 1);
        });
        it("光标在td最后一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "start", "end");

          cy.focused().type("{backspace}");

          cy.get("td").eq(1).should("not.contain.text");
        });
      });
      describe("处于最后一个td", function () {
        it("光标在td第一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "end", "start");

          cy.focused().type("{backspace}");

          cy.contains("td", "6").should("have.length", 1);
          cy.contains("td", "5").should("have.length", 1);
        });
        it("光标在td最后一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "end", "end");

          cy.focused().type("{backspace}");

          cy.get("table").eq(0).find("td").last().should("not.contain.text");
          cy.contains("td", "5").should("have.length", 1);
        });
      });
      describe("区域选择表格部分内容", function () {
        describe("从表格下方的普通文本往上选择", function () {
          it("覆盖表格的部分", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text2");
              if (!tw) return;
              const anchor = Editor.end(editor, tw[1]);
              const td = getTd(editor, "merge cell1");
              if (!td) return;
              const focus = Editor.before(editor, Editor.end(editor, td[1]));

              if (anchor && focus) {
                Transforms.select(editor, {
                  anchor,
                  focus,
                });
              }
            }, 50);

            cy.focused().type("{backspace}").wait(50);

            getTdByText(0, "merge cell").should("have.length", 1);

            cy.get("table").should("have.length", 2);
            cy.get("table").eq(0).find("td").should("have.length", 100);

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text2");
              return tw;
            }, 50).should("be.undefined");
          });
          it("覆盖表格全部", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text2");
              if (!tw) return;
              const anchor = Editor.end(editor, tw[1]);
              const tw2 = getTextWrapper(editor, "text1");
              if (!tw2) return;
              const focus = Editor.before(editor, Editor.end(editor, tw2[1]));

              if (anchor && focus) {
                Transforms.select(editor, {
                  anchor,
                  focus,
                });
              }
            }, 50);

            cy.focused().type("{backspace}").wait(50);

            cy.get("table").should("have.length", 1);
            cy.get("table").eq(0).find("td").should("have.length", 4);

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text2");
              return tw;
            }, 50).should("be.undefined");
            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              return tw;
            }, 50).should("be.undefined");
          });
          it("覆盖一个表格的全部，另一个表格的部分", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const [, table2] = Editor.nodes(editor, {
                at: [],
                match: (n) => TableLogic.isTable(n),
              });
              if (!table2) return;
              const anchor = Editor.after(
                editor,
                Editor.end(editor, table2[1])
              );
              const td = getTd(editor, "merge cell1");
              if (!td) return;
              const focus = Editor.before(editor, Editor.end(editor, td[1]));

              if (anchor && focus) {
                Transforms.select(editor, {
                  anchor,
                  focus,
                });
              }
            }, 50);

            cy.focused().type("{backspace}").wait(50);

            cy.get("table").should("have.length", 1);
            cy.get("table").eq(0).find("td").should("have.length", 100);

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text2");
              return tw;
            }, 50).should("be.undefined");
            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              return tw;
            }, 50).should("not.be.undefined");
            cy.contains("list2.1").should("have.length", 0);
            cy.contains("todo2").should("have.length", 0);
          });
          it("覆盖两个表格的全部", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const [, table2] = Editor.nodes(editor, {
                at: [],
                match: (n) => TableLogic.isTable(n),
              });
              if (!table2) return;
              const anchor = Editor.after(
                editor,
                Editor.end(editor, table2[1])
              );
              const tw2 = getTextWrapper(editor, "text1");
              if (!tw2) return;
              const focus = Editor.before(editor, Editor.end(editor, tw2[1]));

              if (anchor && focus) {
                Transforms.select(editor, {
                  anchor,
                  focus,
                });
              }
            }, 50);

            cy.focused().type("{backspace}").wait(50);

            cy.get("table").should("have.length", 0);

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text2");
              return tw;
            }, 50).should("be.undefined");
            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              return tw;
            }, 50).should("be.undefined");
            cy.contains("list2.1").should("have.length", 0);
            cy.contains("todo2").should("have.length", 0);
          });
        });
        describe("从表格上方的普通文本往下选择", function () {
          it("覆盖表格的部分", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              if (!tw) return;
              const anchor = Editor.start(editor, tw[1]);
              const td = getTd(editor, "merge cell1");
              if (!td) return;
              const focus = Editor.end(editor, td[1]);

              if (anchor && focus) {
                Transforms.select(editor, {
                  anchor,
                  focus,
                });
              }
            }, 50);

            cy.focused().type("{backspace}").wait(50);

            getTdByText(0, "merge cell1").should("have.length", 0);

            cy.get("table").should("have.length", 2);
            cy.get("table").eq(0).find("td").should("have.length", 100);
            cy.get("table").eq(1).find("td").should("have.length", 4);

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              return tw;
            }, 50).should("be.undefined");
          });
          it("覆盖表格全部", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              if (!tw) return;
              const anchor = Editor.start(editor, tw[1]);
              const tw2 = getTextWrapper(editor, "text2");
              if (!tw2) return;
              const focus = Editor.before(editor, Editor.end(editor, tw2[1]));

              if (anchor && focus) {
                Transforms.select(editor, {
                  anchor,
                  focus,
                });
              }
            }, 50);

            cy.focused().type("{backspace}").wait(50);

            cy.get("table").should("have.length", 1);
            cy.get("table").eq(0).find("td").should("have.length", 4);

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text2");
              return tw;
            }, 50).should("be.undefined");
            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              return tw;
            }, 50).should("be.undefined");
          });
          it("覆盖一个表格的全部，另一个表格的部分", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              if (!tw) return;
              const anchor = Editor.start(editor, tw[1]);
              const td = getTd(editor, "table2.4");
              if (!td) return;
              const focus = Editor.before(editor, Editor.end(editor, td[1]));

              if (anchor && focus) {
                Transforms.select(editor, {
                  anchor,
                  focus,
                });
              }
            }, 50);

            cy.focused().type("{backspace}").wait(50);

            cy.get("table").should("have.length", 1);
            cy.get("table").eq(0).find("td").should("have.length", 4);

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text2");
              return tw;
            }, 50).should("be.undefined");
            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              return tw;
            }, 50).should("be.undefined");
            cy.contains("list2.1").should("have.length", 0);
            cy.contains("todo2").should("have.length", 0);
          });
          it("覆盖两个表格的全部", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              if (!tw) return;
              const anchor = Editor.start(editor, tw[1]);

              const [, table2] = Editor.nodes(editor, {
                at: [],
                match: (n) => TableLogic.isTable(n),
              });
              if (!table2) return;
              const focus = Editor.after(editor, Editor.end(editor, table2[1]));

              if (anchor && focus) {
                Transforms.select(editor, {
                  anchor,
                  focus,
                });
              }
            }, 50);

            cy.focused().type("{backspace}").wait(50);

            cy.get("table").should("have.length", 0);

            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text2");
              return tw;
            }, 50).should("be.undefined");
            doSyncFn(() => {
              const tw = getTextWrapper(editor, "text1");
              return tw;
            }, 50).should("be.undefined");
            cy.contains("list2.1").should("have.length", 0);
            cy.contains("todo2").should("have.length", 0);
          });
        });
      });
    });
    describe("输入enter键", function () {
      describe("处于第一个td", function () {
        it("光标在td第一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "start", "start");

          cy.focused().type("{enter}");

          cy.contains("td", "1").should("have.length", 1);
          cy.contains("td", "2").should("have.length", 1);
          cy.contains("text1").should("have.length", 1);

          // 判断td里的textWrapper数量
          doSyncFn(() => {
            const td = getTd(editor, "1");
            const textWrapperLength =
              td &&
              Array.from(
                Editor.nodes(editor, {
                  at: td[1],
                  match: (n) => utils.isTextWrapper(n),
                })
              ).length;
            return textWrapperLength || 0;
          }).should("eq", 2);
        });
        it("光标在td最后一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "start", "end");

          cy.focused().type("{enter}");

          cy.contains("td", "1").should("have.length", 1);
          cy.contains("td", "2").should("have.length", 1);
          cy.contains("text1").should("have.length", 1);

          // 判断td里的textWrapper数量
          doSyncFn(() => {
            const td = getTd(editor, "1");
            const textWrapperLength =
              td &&
              Array.from(
                Editor.nodes(editor, {
                  at: td[1],
                  match: (n) => utils.isTextWrapper(n),
                })
              ).length;
            return textWrapperLength || 0;
          }).should("eq", 2);
        });
      });
      describe("处于最后一个td", function () {
        it("光标在td第一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "end", "start");

          cy.focused().type("{enter}");

          cy.contains("td", "6").should("have.length", 1);
          cy.contains("td", "5").should("have.length", 1);
          cy.contains("text2").should("have.length", 1);

          // 判断td里的textWrapper数量
          doSyncFn(() => {
            const td = getTd(editor, "6");
            const textWrapperLength =
              td &&
              Array.from(
                Editor.nodes(editor, {
                  at: td[1],
                  match: (n) => utils.isTextWrapper(n),
                })
              ).length;
            return textWrapperLength || 0;
          }).should("eq", 2);
        });
        it("光标在td最后一位", function () {
          const editor: EditorType = this.editor;
          selectTd(editor, 0, "end", "end");

          cy.focused().type("{enter}");

          cy.contains("td", "6").should("have.length", 1);
          cy.contains("td", "5").should("have.length", 1);
          cy.contains("text2").should("have.length", 1);

          // 判断td里的textWrapper数量
          doSyncFn(() => {
            const td = getTd(editor, "6");
            const textWrapperLength =
              td &&
              Array.from(
                Editor.nodes(editor, {
                  at: td[1],
                  match: (n) => utils.isTextWrapper(n),
                })
              ).length;
            return textWrapperLength || 0;
          }).should("eq", 2);
        });
      });
    });
    describe("输入esc键", function () {
      it("有单个选中的td", function () {
        const editor: EditorType = this.editor;

        chooseTd("1");

        cy.get("table").eq(0).type("{esc}");

        doSyncFn(() => {
          return TableLogic.getSelectedTdsSize(editor);
        }).should("eq", 0);
      });
      it("有多个选中的td", function () {
        const editor: EditorType = this.editor;

        selectMultiTds(0, "1", "3");

        cy.get("table").eq(0).type("{esc}");

        doSyncFn(() => {
          return TableLogic.getSelectedTdsSize(editor);
        }).should("eq", 0);
      });
      it("有单个未选中的td", function () {
        const editor: EditorType = this.editor;

        selectTd(editor, 0, "start", "start");

        cy.get("table").eq(0).type("{esc}");

        doSyncFn(() => {
          return TableLogic.getEditingTd(editor);
        }).should("not.be.undefined");
      });
    });
    describe("移动焦点", function () {
      const getFocusedTd = (editor: EditorType, text: string) => {
        return doSyncFn(() => {
          const [td] = Editor.nodes(editor, {
            match: (n, p) =>
              TableLogic.isTd(n) && Editor.string(editor, p) === text,
          });
          return td;
        });
      };
      const getFocusedTextWrapper = (editor: EditorType, text: string) => {
        return doSyncFn(() => {
          const [tw] = Editor.nodes(editor, {
            match: (n, p) =>
              utils.isTextWrapper(n) && Editor.string(editor, p) === text,
          });
          return tw;
        });
      };
      describe("输入tab键", function () {
        it("处于第一个td", function () {
          const editor: EditorType = this.editor;

          selectTd(editor, 0, "start", "start");

          cy.focused().tab().wait(300);

          getFocusedTd(editor, "2").should("not.be.undefined");
        });
        it("处于最后一个td", function () {
          const editor: EditorType = this.editor;

          selectTd(editor, 0, "end", "start");

          cy.focused().tab().wait(300);

          getFocusedTd(editor, "6").should("not.be.undefined");
        });
      });
      describe("输入tab+shift键", function () {
        it("处于第一个td", function () {
          const editor: EditorType = this.editor;

          selectTd(editor, 0, "start", "start");

          cy.focused().tab({ shift: true }).wait(300);

          getFocusedTd(editor, "1").should("not.be.undefined");
        });
        it("处于最后一个td", function () {
          const editor: EditorType = this.editor;

          selectTd(editor, 0, "end", "start");

          cy.focused().tab({ shift: true }).wait(300);

          getFocusedTd(editor, "5").should("not.be.undefined");
        });
      });
      describe("输入arrowRight", function () {
        describe("处于第一个td", function () {
          it("结束位置", function () {
            const editor: EditorType = this.editor;

            selectTd(editor, 0, "start", "end");

            cy.focused().type("{rightArrow}").wait(300);

            getFocusedTd(editor, "2").should("not.be.undefined");
          });
        });
        describe("处于最后一个td", function () {
          it("结束位置", function () {
            const editor: EditorType = this.editor;

            selectTd(editor, 0, "end", "end");

            cy.focused().type("{rightArrow}").wait(300);

            getFocusedTd(editor, "6").should("be.undefined");

            getFocusedTextWrapper(editor, "text2").should("not.be.undefined");
          });
        });
      });
      describe("输入arrowLeft", function () {
        describe("处于第一个td", function () {
          it("开始位置", function () {
            const editor: EditorType = this.editor;

            selectTd(editor, 0, "start", "start");

            cy.focused().type("{leftArrow}").wait(300);

            getFocusedTd(editor, "1").should("be.undefined");

            getFocusedTextWrapper(editor, "text1").should("not.be.undefined");
          });
        });
        describe("处于最后一个td", function () {
          it("开始位置", function () {
            const editor: EditorType = this.editor;

            selectTd(editor, 0, "end", "start");

            cy.focused().type("{leftArrow}").wait(300);

            getFocusedTd(editor, "5").should("not.be.undefined");
          });
        });
      });
      describe("输入arrowTop", function () {
        it("处于第一个td", function () {
          const editor: EditorType = this.editor;

          selectTd(editor, 0, "start", "start");

          cy.focused().type("{upArrow}").wait(300);

          getFocusedTd(editor, "1").should("be.undefined");

          getFocusedTextWrapper(editor, "text1").should("not.be.undefined");
        });
        it("处于最后一个td", function () {
          const editor: EditorType = this.editor;

          selectTd(editor, 0, "end", "start");

          cy.focused().type("{upArrow}");

          cy.wait(300);

          getFocusedTd(editor, "6").should("be.undefined");

          cy.focused().type("111");
          getJqTd(0, -2, -1).should("contain.text", "111");
        });
      });
      describe("输入arrowDown", function () {
        it("处于第一个td", function () {
          const editor: EditorType = this.editor;

          selectTd(editor, 0, "start", "start");

          cy.focused().type("{downArrow}");

          cy.wait(300);

          getFocusedTd(editor, "1").should("be.undefined");

          cy.focused().type("111");

          getJqTd(0, 1, 0).should("contain.text", "111");
        });
        it("处于最后一个td", function () {
          const editor: EditorType = this.editor;

          selectTd(editor, 0, "end", "start");

          cy.focused().type("{downArrow}");

          cy.wait(300);

          getFocusedTd(editor, "1").should("be.undefined");

          getFocusedTextWrapper(editor, "text2").should("not.be.undefined");
        });
      });
    });
  });
  describe("鼠标动作", function () {
    it("选中单个cell", function () {
      chooseTd("1");

      cy.get("table")
        .eq(0)
        .find("td")
        .filter((index, td) => {
          return td.style.backgroundColor !== "unset";
        })
        .should("have.length", 1);
    });
    it("选中多个cell", function () {
      selectMultiTds(0, "1", "6");

      cy.get("table")
        .eq(0)
        .find("td")
        .filter((index, td) => {
          return td.style.backgroundColor !== "unset";
        })
        .should("have.length", 100);
    });
  });
  describe("复制粘贴", function () {
    describe("粘贴表格外内容到td", function () {
      describe("有选中的单个td", function () {
        it("粘贴li", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const [list] = Editor.nodes(editor, {
              at: [],
              match: (n) => ListLogic.isOrderList(n),
            });
            list && Transforms.select(editor, list[1]);
            return;
          }, 300);

          doCopy();

          chooseTd("1");

          doPaste();

          cy.contains("td", "list2.2")
            .then((el) => {
              return cy.contains("td", "list4").then((el2) => {
                return el.get(0) === el2.get(0);
              });
            })
            .should("eq", true);
        });
        it("粘贴todo", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const [todo] = Editor.nodes(editor, {
              at: [],
              match: (n, p) =>
                ToDoListLogic.isTodoList(n) &&
                Editor.string(editor, p) === "todo2",
            });
            todo && Transforms.select(editor, todo[1]);
            return;
          }, 300);

          doCopy();

          chooseTd("1");

          doPaste();

          cy.contains("td", "todo2").should("have.length", 1);
        });
        it("粘贴带inline的文本", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const [tw] = Editor.nodes(editor, {
              at: [],
              match: (n, p) =>
                utils.isTextWrapper(n) && Editor.string(editor, p) === "text2",
            });
            tw && Transforms.select(editor, tw[1]);
            return;
          }, 300);

          doCopy();

          chooseTd("1");

          doPaste();

          cy.contains("td", "text2").should("have.length", 1);
        });
        describe("粘贴另一个table里的内容", function () {
          it("粘贴多个选中的td", function () {
            selectMultiTds(1, "table2.1", "table2.4");

            doCopy();
            chooseTd("1");
            doPaste();

            getTdByText(0, "table2.1").should("have.length", 1);
            getTdByText(0, "table2.2").should("have.length", 1);
            getTdByText(0, "table2.3").should("have.length", 1);
            getTdByText(0, "table2.4").should("have.length", 1);
            cy.get("table").eq(0).find("td").should("have.length", 100);
          });
          it("粘贴单个选中的td", function () {
            chooseTd("table2.4");

            doCopy();

            chooseTd("1");

            doPaste();

            getTdByText(0, "table2.4").should("have.length", 1);
            cy.get("table").eq(0).find("td").should("have.length", 100);
          });
          it("粘贴单个未选中的td里的内容", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const [td] = Editor.nodes(editor, {
                at: [],
                match(n, p) {
                  return (
                    TableLogic.isTd(n) &&
                    Editor.string(editor, p) === "table2.1"
                  );
                },
              });
              td && Transforms.select(editor, td[1]);
            }, 300);

            doCopy();

            chooseTd("1");

            doPaste();

            getTdByText(0, "table2.1").should("have.length", 1);
            cy.get("table").eq(0).find("td").should("have.length", 100);
          });
        });
      });
      describe("有选中的多个td", function () {
        it("粘贴li", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const [list] = Editor.nodes(editor, {
              at: [],
              match: (n) => ListLogic.isOrderList(n),
            });
            list && Transforms.select(editor, list[1]);
            return;
          }, 300);

          doCopy();

          selectMultiTds(0, "1", "3");

          doPaste();

          cy.get('td:contains("list2.1")').should("have.length", 3);
          cy.get('td:contains("list4")').should("have.length", 3);
        });
        it("粘贴todo", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const [todo] = Editor.nodes(editor, {
              at: [],
              match: (n, p) =>
                ToDoListLogic.isTodoList(n) &&
                Editor.string(editor, p) === "todo2",
            });
            todo && Transforms.select(editor, todo[1]);
            return;
          }, 300);

          doCopy();

          selectMultiTds(0, "1", "3");

          doPaste();

          cy.get('td:contains("todo2")').should("have.length", 3);
        });
        it("粘贴带inline的文本", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const [tw] = Editor.nodes(editor, {
              at: [],
              match: (n, p) =>
                utils.isTextWrapper(n) && Editor.string(editor, p) === "text2",
            });
            tw && Transforms.select(editor, tw[1]);
            return;
          }, 300);

          doCopy();

          selectMultiTds(0, "1", "3");

          doPaste();

          cy.get('td:contains("text2")').should("have.length", 3);
        });
        describe("粘贴另一个table里的内容", function () {
          it("粘贴多个选中的td", function () {
            selectMultiTds(1, "table2.1", "table2.4");

            doCopy();

            selectMultiTds(0, "1", "3");

            doPaste();

            getTdByText(0, "table2.1").should("have.length", 1);
            getTdByText(0, "table2.2").should("have.length", 1);
            getTdByText(0, "table2.3").should("have.length", 1);
            getTdByText(0, "table2.4").should("have.length", 1);
            cy.get("table").eq(0).find("td").should("have.length", 100);
          });
          it("粘贴单个选中的td", function () {
            chooseTd("table2.4");

            doCopy();

            selectMultiTds(0, "1", "3");

            doPaste();

            getTdByText(0, "table2.4").should("have.length", 3);
            cy.get("table").eq(0).find("td").should("have.length", 100);
          });
          it("粘贴单个未选中的td里的内容", function () {
            const editor: EditorType = this.editor;

            doSyncFn(() => {
              const [td] = Editor.nodes(editor, {
                at: [],
                match(n, p) {
                  return (
                    TableLogic.isTd(n) &&
                    Editor.string(editor, p) === "table2.1"
                  );
                },
              });
              td && Transforms.select(editor, td[1]);
            }, 300);

            doCopy();

            selectMultiTds(0, "1", "3");

            doPaste();

            getTdByText(0, "table2.1").should("have.length", 3);
            cy.get("table").eq(0).find("td").should("have.length", 100);
          });
        });
      });
      describe("没有选中的td，但是有正在编辑的td", function () {
        it("粘贴li", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const [list] = Editor.nodes(editor, {
              at: [],
              match: (n) => ListLogic.isOrderList(n),
            });
            list && Transforms.select(editor, list[1]);
            return;
          }, 300);

          doCopy();

          doSyncFn(() => {
            selectTd(editor, 0, "start", "end");
          });

          doPaste();

          cy.get('td:contains("list2.1")').should("have.length", 1);
          cy.get('td:contains("list4")').should("have.length", 1);

          cy.contains("td", "list2.1")
            .then((el) => {
              return cy.contains("td", "list4").then((el2) => {
                return cy
                  .get("table")
                  .eq(0)
                  .find("td")
                  .first()
                  .then((el3) => {
                    return (
                      el.get(0) === el2.get(0) && el2.get(0) === el3.get(0)
                    );
                  });
              });
            })
            .should("eq", true);
        });
        it("粘贴todo", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const [todo] = Editor.nodes(editor, {
              at: [],
              match: (n, p) =>
                ToDoListLogic.isTodoList(n) &&
                Editor.string(editor, p) === "todo2",
            });
            todo && Transforms.select(editor, todo[1]);
            return;
          }, 300);

          doCopy();

          doSyncFn(() => {
            selectTd(editor, 0, "start", "end");
          });

          doPaste();

          cy.get('td:contains("todo2")').should("have.length", 1);

          cy.contains("td", "todo2")
            .then((el) => {
              return cy
                .get("table")
                .eq(0)
                .find("td")
                .first()
                .then((el2) => {
                  return el.get(0) === el2.get(0);
                });
            })
            .should("eq", true);
        });
        it("粘贴带inline的文本", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const [tw] = Editor.nodes(editor, {
              at: [],
              match: (n, p) =>
                utils.isTextWrapper(n) && Editor.string(editor, p) === "text2",
            });
            tw && Transforms.select(editor, tw[1]);
            return;
          }, 300);

          doCopy();

          doSyncFn(() => {
            selectTd(editor, 0, "start", "end");
          });

          doPaste();

          cy.get('td:contains("text2")').should("have.length", 1);

          cy.contains("td", "text2")
            .then((el) => {
              return getJqTd(0, 0, 0).then((el2) => {
                return el.get(0) === el2.get(0);
              });
            })
            .should("eq", true);
        });
        describe("粘贴另一个table里的内容", function () {
          it("粘贴多个选中的td", function () {
            const editor: EditorType = this.editor;

            selectMultiTds(1, "table2.1", "table2.4");

            doCopy();

            doSyncFn(() => {
              selectTd(editor, 0, "start", "end");
            }, 300);

            doPaste();

            cy.contains("td", "table2.1")
              .then((el) => {
                return getJqTd(0, 0, 0).then((el2) => {
                  return el.get(0) === el2.get(0);
                });
              })
              .should("eq", true);
          });
          it("粘贴单个选中的td", function () {
            const editor: EditorType = this.editor;

            chooseTd("table2.4");

            doCopy();

            doSyncFn(() => {
              selectTd(editor, 0, "start", "end");
            }, 300);

            doPaste();

            cy.contains("td", "table2.4")
              .then((el) => {
                return getJqTd(0, 0, 0).then((el2) => {
                  return el.get(0) === el2.get(0);
                });
              })
              .should("eq", true);
          });
          it("粘贴单个未选中的td里的内容", function () {
            const editor: EditorType = this.editor;
            doSyncFn(() => {
              const [td] = Editor.nodes(editor, {
                at: [],
                match(n, p) {
                  return (
                    TableLogic.isTd(n) &&
                    Editor.string(editor, p) === "table2.1"
                  );
                },
              });
              td && Transforms.select(editor, td[1]);
            }, 300);

            doCopy();

            doSyncFn(() => {
              selectTd(editor, 0, "start", "end");
            }, 300);

            doPaste();

            cy.contains("td", "table2.1")
              .then((el) => {
                return getJqTd(0, 0, 0).then((el2) => {
                  return el.get(0) === el2.get(0);
                });
              })
              .should("eq", true);
          });
        });
      });
    });
    describe("粘贴表格内的内容到本表格", function () {
      describe("粘贴单个选中的td", function () {
        it("到单个未选中的td", function () {
          const editor: EditorType = this.editor;

          chooseTd("1");

          doCopy();

          doSyncFn(() => {
            selectTd(editor, 0, "end", "end");
          }, 300);

          doPaste();

          getTdByText(0, "61").should("have.length", 1);
        });
        it("到单个选中的td", function () {
          chooseTd("1");

          doCopy();

          chooseTd("2");

          doPaste();

          getTdByText(0, "1").should("have.length", 2);
        });
        it("到多个选中的td", function () {
          chooseTd("1");

          doCopy();

          selectMultiTds(0, "4", "6");

          doPaste();

          getTdByText(0, "1").should("have.length", 4);
        });
      });
      describe("粘贴多个选中的td", function () {
        it("到单个未选中的td", function () {
          const editor: EditorType = this.editor;

          selectMultiTds(0, "1", "3");

          doCopy();

          doSyncFn(() => {
            selectTd(editor, 0, "end", "end");
          }, 300);

          doPaste();

          getTdByText(0, "61\n2\n3").should("have.length", 1);
        });
        it("到单个选中的td", function () {
          selectMultiTds(0, "1", "3");

          doCopy();

          chooseTd("6");

          doPaste();

          // 应该是不会复制成功
          getTdByText(0, "6").should("have.length", 1);

          chooseTd("4");

          doPaste();

          getTdByText(0, "6").should("have.length", 0);
          getTdByText(0, "1").should("have.length", 2);
          getTdByText(0, "2").should("have.length", 2);
          getTdByText(0, "3").should("have.length", 2);
        });
        it("到多个选中的td", function () {
          selectMultiTds(0, "1", "3");

          doCopy();

          selectMultiTds(0, "4", "6");

          doPaste();

          getTdByText(0, "4").should("have.length", 0);
          getTdByText(0, "5").should("have.length", 0);
          getTdByText(0, "6").should("have.length", 0);
          getTdByText(0, "1").should("have.length", 2);
          getTdByText(0, "2").should("have.length", 2);
          getTdByText(0, "3").should("have.length", 2);
        });
      });
      describe("粘贴未选中的单个td", function () {
        it("到单个未选中的td", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const td = getTd(editor, "1");
            td && Transforms.select(editor, td[1]);
          }, 300);

          doCopy();

          doSyncFn(() => {
            selectTd(editor, 0, "end", "end");
          }, 300);

          doPaste();

          getTdByText(0, "61").should("have.length", 1);
        });
        it("到单个选中的td", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const td = getTd(editor, "1");
            td && Transforms.select(editor, td[1]);
          }, 300);

          doCopy();

          chooseTd("6");

          doPaste();

          getTdByText(0, "6").should("have.length", 0);
          getTdByText(0, "1").should("have.length", 2);
        });
        it("到多个选中的td", function () {
          const editor: EditorType = this.editor;
          doSyncFn(() => {
            const td = getTd(editor, "1");
            td && Transforms.select(editor, td[1]);
          }, 300);

          doCopy();

          selectMultiTds(0, "4", "6");

          doPaste();

          getTdByText(0, "4").should("have.length", 0);
          getTdByText(0, "5").should("have.length", 0);
          getTdByText(0, "6").should("have.length", 0);
          getTdByText(0, "1").should("have.length", 4);
        });
      });
    });
    describe("复制表格", function () {
      it("当有单元格正在编辑时", function () {
        const editor: EditorType = this.editor;

        doSyncFn(() => {
          selectTd(editor, 0, "start", "start");
        }, 50);

        doSyncFn(() => {
          TableLogic.copyTable(editor);
        }, 50);

        cy.get("table").should("have.length", 3);
        cy.get("table").eq(0).find("td").should("have.length", 100);
        cy.get("table").eq(1).find("td").should("have.length", 100);
        getTdByText(0, "merge cell1").should("have.length", 1);
        getTdByText(1, "merge cell1").should("have.length", 1);
      });
      it("当有单个单元格被选中时", function () {
        const editor: EditorType = this.editor;

        chooseTd("1");

        doSyncFn(() => {
          TableLogic.copyTable(editor);
        }, 50);

        cy.get("table").should("have.length", 3);
        getTdByText(0, "merge cell1").should("have.length", 1);
        getTdByText(1, "merge cell1").should("have.length", 1);
        cy.get("table").eq(0).find("td").should("have.length", 100);
        cy.get("table").eq(1).find("td").should("have.length", 100);
      });
      it("当有多个单元格被选中时", function () {
        const editor: EditorType = this.editor;

        selectMultiTds(0, "1", "3");

        doSyncFn(() => {
          TableLogic.copyTable(editor);
        }, 50);

        cy.get("table").should("have.length", 3);
        getTdByText(0, "merge cell1").should("have.length", 1);
        getTdByText(1, "merge cell1").should("have.length", 1);
        cy.get("table").eq(0).find("td").should("have.length", 100);
        cy.get("table").eq(1).find("td").should("have.length", 100);
      });
    });
  });
  describe("合并与拆分单元格", function () {
    it("合并四个单元格并拆分", function () {
      const editor: EditorType = this.editor;
      selectMultiTds(0, "merge cell1", "merge cell4");

      doSyncFn(() => {
        TableLogic.mergeTd(editor);
      }, 300);

      cy.get("td")
        .filter((i, td) => {
          const { colSpan, rowSpan } = td as HTMLTableCellElement;
          return colSpan === 2 && rowSpan === 2;
        })
        .should("have.length", 1);

      doSyncFn(() => {
        TableLogic.splitTd(editor);
      }, 300);

      cy.get("td")
        .filter((i, td) => {
          const { colSpan, rowSpan } = td as HTMLTableCellElement;
          return colSpan === 2 && rowSpan === 2;
        })
        .should("have.length", 0);

      cy.get("table").eq(0).find("td").should("have.length", 100);
      getTdByText(
        0,
        "merge cell1\nmerge cell2\nmerge cell3\nmerge cell4"
      ).should("have.length", 1);
    });
    it("合并已经合并过的单元格和与未合并的单元格，然后拆分", function () {
      const editor: EditorType = this.editor;

      selectMultiTds(0, "merge cell1", "merge cell4");

      doSyncFn(() => {
        TableLogic.mergeTd(editor);
      }, 300);

      selectMultiTds(0, "1", "3");

      doSyncFn(() => {
        TableLogic.mergeTd(editor);
      }, 300);

      selectMultiTds(
        0,
        "1\n2\n3",
        "merge cell1\nmerge cell2\nmerge cell3\nmerge cell4"
      );

      cy.wait(300);

      doSyncFn(() => {
        TableLogic.mergeTd(editor);
      }, 300);

      cy.wait(300);

      cy.get("td")
        .filter((i, td) => {
          const { colSpan, rowSpan, innerText } = td as HTMLTableCellElement;
          return (
            colSpan === 5 &&
            rowSpan === 4 &&
            innerText ===
              "1\n2\n3\nmerge cell1\nmerge cell2\nmerge cell3\nmerge cell4"
          );
        })
        .should("have.length", 1);

      doSyncFn(() => {
        TableLogic.splitTd(editor);
      }, 300);

      cy.get("td")
        .filter((i, td) => {
          const { colSpan, rowSpan } = td as HTMLTableCellElement;
          return colSpan === 5 && rowSpan === 4;
        })
        .should("have.length", 0);

      cy.get("table").eq(0).find("td").should("have.length", 100);
      getTdByText(
        0,
        "1\n2\n3\nmerge cell1\nmerge cell2\nmerge cell3\nmerge cell4"
      ).should("have.length", 1);
    });
    it("测试合并单元格后选择多个td时，选择的范围是否有问题", function () {
      const editor: EditorType = this.editor;

      selectMultiTds(0, "merge cell1", "merge cell4");

      cy.wait(300);

      doSyncFn(() => {
        TableLogic.mergeTd(editor);
      }, 300);

      moveCursorToTd(editor, {
        tableIndex: 0,
        rowIndex: 1,
        colIndex: 1,
        at: "start",
      }).wait(50);

      cy.focused().type("test1-1");

      moveCursorToTd(editor, {
        tableIndex: 0,
        rowIndex: 4,
        colIndex: 4,
        at: "start",
      }).wait(50);

      cy.focused().type("test1-2");

      selectMultiTds(0, "test1-1", "test1-2");

      cy.get("table")
        .eq(0)
        .find("td")
        .filter((i, td) => {
          return td.style.backgroundColor !== "unset";
        })
        .should("have.length", 13);
    });
    it("测试合并单元格后选择多个td时，选择的范围是否有问题2", function () {
      const editor: EditorType = this.editor;

      selectMultiTds(0, "merge cell1", "merge cell4");

      cy.wait(300);

      doSyncFn(() => {
        TableLogic.mergeTd(editor);
      }, 300);

      moveCursorToTd(editor, {
        tableIndex: 0,
        rowIndex: 4,
        colIndex: 3,
        at: "start",
      }).wait(50);

      cy.focused().type("test1-1");

      moveCursorToTd(editor, {
        tableIndex: 0,
        rowIndex: 3,
        colIndex: 2,
        at: "start",
      }).wait(50);

      cy.focused().type("test1-2");

      selectMultiTds(0, "test1-1", "test1-2");

      cy.get("table")
        .eq(0)
        .find("td")
        .filter((i, td) => {
          return td.style.backgroundColor !== "unset";
        })
        .should("have.length", 6);
    });
  });
  describe("插入列", function () {
    it("右边插入", function () {
      const editor: EditorType = this.editor;

      doSyncFn(() => {
        selectTd(editor, 0, "start", "start");
      }, 50);

      doSyncFn(() => {
        TableLogic.insertColumn(editor, "after");
      }, 300);

      doSyncFn(() => {
        const td = getTd(editor, "1");
        const nextTd = Editor.next(editor, {
          at: td[1],
          match: (n) => TableLogic.isTd(n),
        });

        return nextTd && Editor.string(editor, nextTd[1]) === "";
      }, 50).should("eq", true);

      cy.get("table").eq(0).find("td").should("have.length", 110);

      chooseTd("2");

      doSyncFn(() => {
        TableLogic.insertColumn(editor, "after");
      }, 300);
      doSyncFn(() => {
        const td = getTd(editor, "2");
        const nextTd = Editor.next(editor, {
          at: td[1],
          match: (n) => TableLogic.isTd(n),
        });

        return nextTd && Editor.string(editor, nextTd[1]) === "";
      }, 50).should("eq", true);

      cy.get("table").eq(0).find("td").should("have.length", 120);
    });
    it("左边插入", function () {
      const editor: EditorType = this.editor;

      doSyncFn(() => {
        const td = getTd(editor, "2");
        td && Transforms.select(editor, Editor.start(editor, td[1]));
      }, 50);

      doSyncFn(() => {
        TableLogic.insertColumn(editor, "before");
      }, 300);

      doSyncFn(() => {
        const td = getTd(editor, "1");
        const nextTd = Editor.next(editor, {
          at: td[1],
          match: (n) => TableLogic.isTd(n),
        });

        return nextTd && Editor.string(editor, nextTd[1]) === "";
      }, 50).should("eq", true);

      cy.get("table").eq(0).find("td").should("have.length", 110);

      chooseTd("3");

      doSyncFn(() => {
        TableLogic.insertColumn(editor, "before");
      }, 300);
      doSyncFn(() => {
        const td = getTd(editor, "2");
        const nextTd = Editor.next(editor, {
          at: td[1],
          match: (n) => TableLogic.isTd(n),
        });

        return nextTd && Editor.string(editor, nextTd[1]) === "";
      }, 50).should("eq", true);

      cy.get("table").eq(0).find("td").should("have.length", 120);
    });
  });
  describe("插入行", function () {
    it("上边插入", function () {
      const editor: EditorType = this.editor;

      doSyncFn(() => {
        const td = getTd(editor, "1");
        td && Transforms.select(editor, Editor.start(editor, td[1]));
      }, 50);

      doSyncFn(() => {
        TableLogic.insertRow(editor, "before");
      }, 300);

      // 第二行第一个单元格是1
      getJqTd(0, 1, 0).invoke("text").should("eq", "1");
      cy.get("table").eq(0).find("td").should("have.length", 110);

      chooseTd("6");

      doSyncFn(() => {
        TableLogic.insertRow(editor, "before");
      }, 300);

      cy.get("table").eq(0).find("td").should("have.length", 120);
      // 倒数第一行最后一个单元格是6
      getJqTd(0, -1, -1).invoke("text").should("eq", "6");
    });
    it("下边插入", function () {
      const editor: EditorType = this.editor;

      doSyncFn(() => {
        const td = getTd(editor, "6");
        td && Transforms.select(editor, Editor.start(editor, td[1]));
      }, 50);

      doSyncFn(() => {
        TableLogic.insertRow(editor, "after");
      }, 300);

      cy.get("table").eq(0).find("td").should("have.length", 110);
      // 倒数第二行最后一个单元格是6
      getJqTd(0, -2, -1).invoke("text").should("eq", "6");

      chooseTd("1");

      doSyncFn(() => {
        TableLogic.insertRow(editor, "after");
      }, 300);

      cy.get("table").eq(0).find("td").should("have.length", 120);
      // 第1行第一个单元格是1
      getJqTd(0, 0, 0).invoke("text").should("eq", "1");
    });
  });
  describe("删除表格", function () {
    it("单元格处于编辑状态时删除", function () {
      const editor: EditorType = this.editor;
      selectTd(editor, 0, "start", "start");

      doSyncFn(() => {
        TableLogic.deleteTable(editor);
      }, 50);

      cy.get("table").should("have.length", 1);
      cy.get("table").eq(0).find("td").should("have.length", 4);
    });
    it("单个单元格处于选中状态时删除", function () {
      const editor: EditorType = this.editor;
      chooseTd("1");

      doSyncFn(() => {
        TableLogic.deleteTable(editor);
      }, 50);

      cy.get("table").should("have.length", 1);
      cy.get("table").eq(0).find("td").should("have.length", 4);
    });
    it("多个单元格处于选中状态时删除", function () {
      const editor: EditorType = this.editor;

      selectMultiTds(0, "1", "3");

      doSyncFn(() => {
        TableLogic.deleteTable(editor);
      }, 50);

      cy.get("table").should("have.length", 1);
      cy.get("table").eq(0).find("td").should("have.length", 4);
    });
  });
  describe("删除行", function () {
    describe("删除单行", function () {
      it("单元格处于编辑状态时删除", function () {
        const editor: EditorType = this.editor;
        selectTd(editor, 0, "start", "start");

        doSyncFn(() => {
          TableLogic.deleteRow(editor);
        }, 50);

        getTdByText(0, "1").should("have.length", 0);
        cy.get("table").should("have.length", 2);
        cy.get("table").eq(0).find("td").should("have.length", 90);
      });
      it("单个单元格处于选中状态时删除", function () {
        const editor: EditorType = this.editor;
        chooseTd("1");

        doSyncFn(() => {
          TableLogic.deleteRow(editor);
        }, 50);

        getTdByText(0, "1").should("have.length", 0);
        cy.get("table").should("have.length", 2);
        cy.get("table").eq(0).find("td").should("have.length", 90);
      });
      it("多个单元格处于选中状态时删除", function () {
        const editor: EditorType = this.editor;

        selectMultiTds(0, "1", "3");

        doSyncFn(() => {
          TableLogic.deleteRow(editor);
        }, 50);

        getTdByText(0, "1").should("have.length", 0);
        cy.get("table").should("have.length", 2);
        cy.get("table").eq(0).find("td").should("have.length", 90);
      });
    });
    it("删除多行", function () {
      const editor: EditorType = this.editor;

      selectMultiTds(0, "1", "merge cell4");

      doSyncFn(() => {
        TableLogic.deleteRow(editor);
      }, 50);

      getTdByText(0, "1").should("have.length", 0);
      getTdByText(0, "merge cell4").should("have.length", 0);
      getTdByText(0, "merge cell2").should("have.length", 0);
      cy.get("table").should("have.length", 2);
      cy.get("table").eq(0).find("td").should("have.length", 60);
    });
  });
  describe("删除列", function () {
    describe("删除单列", function () {
      it("单元格处于编辑状态时删除", function () {
        const editor: EditorType = this.editor;
        selectTd(editor, 0, "start", "start");

        doSyncFn(() => {
          TableLogic.deleteColumn(editor);
        }, 50);

        getTdByText(0, "1").should("have.length", 0);
        getTdByText(0, "2").should("have.length", 1);
        cy.get("table").should("have.length", 2);
        cy.get("table").eq(0).find("td").should("have.length", 90);
      });
      it("单个单元格处于选中状态时删除", function () {
        const editor: EditorType = this.editor;
        chooseTd("1");

        doSyncFn(() => {
          TableLogic.deleteColumn(editor);
        }, 50);

        getTdByText(0, "1").should("have.length", 0);
        getTdByText(0, "2").should("have.length", 1);
        cy.get("table").should("have.length", 2);
        cy.get("table").eq(0).find("td").should("have.length", 90);
      });
      it("多个单元格处于选中状态时删除", function () {
        const editor: EditorType = this.editor;

        selectMultiTds(0, "1", "3");

        doSyncFn(() => {
          TableLogic.deleteColumn(editor);
        }, 50);

        getTdByText(0, "1").should("have.length", 0);
        getTdByText(0, "2").should("have.length", 0);
        getTdByText(0, "3").should("have.length", 0);
        cy.get("table").should("have.length", 2);
        cy.get("table").eq(0).find("td").should("have.length", 70);
      });
    });
  });
  describe("清空单元格", function () {
    it("清空单个", function () {
      const editor: EditorType = this.editor;

      chooseTd("1");

      doSyncFn(() => {
        TdLogic.clearTd(editor);
      }, 50);

      getTdByText(0, "1").should("have.length", 0);
      cy.get("table").should("have.length", 2);
      cy.get("table").eq(0).find("td").should("have.length", 100);
    });
    it("清空多个", function () {
      const editor: EditorType = this.editor;

      selectMultiTds(0, "1", "6");

      doSyncFn(() => {
        TdLogic.clearTd(editor);
      }, 300);

      getTdByText(0, "1").should("have.length", 0);
      getTdByText(0, "2").should("have.length", 0);
      getTdByText(0, "3").should("have.length", 0);
      getTdByText(0, "4").should("have.length", 0);
      getTdByText(0, "5").should("have.length", 0);
      getTdByText(0, "6").should("have.length", 0);
      cy.get("table")
        .eq(0)
        .find('td:contains("merge cell")')
        .should("have.length", 0);
      cy.get("table").should("have.length", 2);
      cy.get("table").eq(0).find("td").should("have.length", 100);
    });
  });
});
