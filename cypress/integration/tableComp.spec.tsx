/* eslint-disable no-loop-func */
/* eslint-disable no-throw-literal */
/* eslint-disable no-undef */
import * as React from "react";
import { mount, unmount } from "@cypress/react";
import CyEditor from "../../src/components/RichEditor/RichEditor";
import { ReactEditor } from "slate-react";
import {
  Descendant,
  Editor,
  Element,
  NodeEntry,
  Path,
  Transforms,
} from "slate";
import {
  CET,
  CypressFlagValues,
  CypressTestFlag,
  EditorType,
} from "../../src/components/RichEditor/common/Defines";
import { ToDoListLogic } from "../../src/components/RichEditor/comps/TodoListComp";
import { TableLogic } from "../../src/components/RichEditor/comps/Table";
import { utils } from "../../src/components/RichEditor/common/utils";
import { TdLogic } from "../../src/components/RichEditor/comps/Td";

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

// 直接使用手动建好的表格数据
function makeTable() {
  return cy.wrap(
    `[{"type":"div","children":[{"text":"text1"}]},{"type":"table","wrapperWidthWhenCreated":1538,"children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"1"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"2"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"3"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"merge cell1"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"merge cell2"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"merge cell3"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"merge cell4"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"4"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"5"}]}]},{"type":"td","width":153.8,"height":30,"children":[{"type":"div","children":[{"text":"6"}]}]}],"shouldEmpty":false}]}]},{"type":"div","children":[{"text":"text2"}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"list1"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"list2"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"list2.1"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"list2.2"}]}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"list3"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"list4"}]}]}]},{"type":"todo","children":[{"text":"todo1"}]},{"type":"todo","children":[{"text":"todo2"}]},{"type":"todo","children":[{"text":"todo3"}]},{"type":"div","children":[{"text":"table2"}]},{"type":"table","wrapperWidthWhenCreated":1538,"children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","width":769,"height":30,"children":[{"type":"div","children":[{"text":"table2.1"}]}]},{"type":"td","width":769,"height":30,"children":[{"type":"div","children":[{"text":"table2.2"}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","width":769,"height":30,"children":[{"type":"div","children":[{"text":"table2.3"}]}]},{"type":"td","width":769,"height":30,"children":[{"type":"div","children":[{"text":"table2.4"}]}],"tdIsEditing":true,"start":true}],"shouldEmpty":false}]}]},{"type":"div","children":[{"text":""}]}]`
  ); // 为了让此函数变成promise函数，等待cypress命令全部结束后才返回
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

/**
 * 选中单个td或者将光标移动到td的指定位置
 *
 * @param {EditorType} editor
 * @param {number} tableIndex 第几个table，本测试用例中最多两个table，大部分情况是第一个table
 * @param {("start" | "end")} [index]
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
  return cy.contains("td", startTdText).then((el) => {
    td1 = el.get(0);
    return cy.contains("td", endTdText).then((el) => {
      td2 = el.get(0);
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
  it.only("test", function () {
    const editor: EditorType = this.editor;
    selectTd(editor, 0, "start", "start");

    cy.focused().type("haha");

    selectMultiTds(0, "haha1", "6");
  });
  describe("基本输入", function () {
    describe("输入普通文本", function () {
      describe("处于第一个td", function () {});
      describe("处于最后一个td", function () {});
    });
    describe("输入delete键", function () {
      describe("处于第一个td", function () {
        describe("光标在td第一位", function () {});
        describe("光标在td最后一位", function () {});
      });
      describe("处于最后一个td", function () {
        describe("光标在td第一位", function () {});
        describe("光标在td最后一位", function () {});
      });
    });
    describe("输入backspace键", function () {
      describe("处于第一个td", function () {
        describe("光标在td第一位", function () {});
        describe("光标在td最后一位", function () {});
      });
      describe("处于最后一个td", function () {
        describe("光标在td第一位", function () {});
        describe("光标在td最后一位", function () {});
      });
    });
    describe("输入enter键", function () {
      describe("处于第一个td", function () {
        describe("光标在td第一位", function () {});
        describe("光标在td最后一位", function () {});
      });
      describe("处于最后一个td", function () {
        describe("光标在td第一位", function () {});
        describe("光标在td最后一位", function () {});
      });
    });
    describe("输入esc键", function () {
      describe("有单个选中的td", function () {});
      describe("有多个选中的td", function () {});
      describe("有单个未选中的td", function () {});
    });
    describe("输入tab键", function () {
      describe("处于第一个td", function () {});
      describe("处于最后一个td", function () {});
    });
    describe("输入tab+shift键", function () {
      describe("处于第一个td", function () {});
      describe("处于最后一个td", function () {});
    });
    describe("输入arrowRight", function () {
      describe("处于第一个td", function () {
        describe("结束位置", function () {});
      });
      describe("处于最后一个td", function () {
        describe("结束位置", function () {});
      });
    });
    describe("输入arrowLeft", function () {
      describe("处于第一个td", function () {
        describe("开始位置", function () {});
      });
      describe("处于最后一个td", function () {
        describe("开始位置", function () {});
      });
    });
    describe("输入arrowTop", function () {
      describe("处于第一个td", function () {});
      describe("处于最后一个td", function () {});
    });
    describe("输入arrowDown", function () {
      describe("处于第一个td", function () {});
      describe("处于最后一个td", function () {});
    });
  });
  describe("鼠标动作", function () {
    describe("选中单个cell", function () {});
    describe("选中多个cell", function () {});
  });
  describe("复制粘贴", function () {
    describe("粘贴表格外内容到td", function () {
      describe("有选中的td", function () {
        describe("粘贴li", function () {});
        describe("粘贴todo", function () {});
        describe("粘贴带inline的文本", function () {});
        describe("粘贴另一个table里的内容", function () {
          describe("粘贴多个选中的td", function () {});
          describe("粘贴单个选中的td", function () {});
          describe("粘贴单个未选中的td里的内容", function () {});
        });
      });
      describe("没有选中的td", function () {
        describe("粘贴li", function () {});
        describe("粘贴todo", function () {});
        describe("粘贴带inline的文本", function () {});
        describe("粘贴另一个table里的内容", function () {
          describe("粘贴多个选中的td", function () {});
          describe("粘贴单个选中的td", function () {});
          describe("粘贴单个未选中的td里的内容", function () {});
        });
      });
    });
    describe("粘贴表格内的内容到本表格", function () {
      describe("粘贴单个选中的td", function () {
        it("到单个未选中的td", function () {});
        it("到单个选中的td", function () {});
        it("到多个选中的td", function () {});
      });
      describe("粘贴多个选中的单个td", function () {
        it("到单个未选中的td", function () {});
        it("到单个选中的td", function () {});
        it("到多个选中的td", function () {});
      });
      describe("粘贴未选中的单个td", function () {
        it("到单个未选中的td", function () {});
        it("到单个选中的td", function () {});
        it("到多个选中的td", function () {});
      });
    });
  });
  describe("合并单元格", function () {});
  describe("拆分单元格", function () {});
  describe("插入列", function () {
    describe("右边插入", function () {});
    describe("左边插入", function () {});
  });
  describe("插入行", function () {
    describe("右边插入", function () {});
    describe("左边插入", function () {});
  });
  describe("删除表格", function () {});
  describe("删除行", function () {
    describe("删除单行", function () {});
    describe("删除多行", function () {});
  });
  describe("删除列", function () {
    describe("删除单列", function () {});
    describe("删除多列", function () {});
  });
  describe("清空单元格", function () {
    describe("清空单个", function () {});
    describe("清空多个", function () {});
  });
});
