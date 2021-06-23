/* eslint-disable eqeqeq */
import _ from "lodash";
import {
  Node,
  NodeEntry,
  Element,
  Text,
  Range,
  Transforms,
  Editor,
  Path,
} from "slate";
import { RenderElementProps } from "slate-react";
import { CET, EditorType } from "../common/Defines";
import { utils } from "../common/utils";

declare module "react" {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    border?: any;
  }
}

type customTdShape = {
  start: boolean;
  colSpan: number;
  rowSpan: number;
  row: number; // 在tdMap里的坐标
  col: number; // 在tdMap里的坐标
  originRow: number; // 在原来tbody里的坐标
  originCol: number; // 在原来tbody里的坐标
};

type tdMapShape = Array<customTdShape[]>;

export const Table: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  element,
  children,
}) => {
  return (
    <div
      {...attributes}
      style={{
        display: "inline-block",
        position: "relative",
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
      }}
    >
      <table
        border="1"
        {...attributes}
        style={{ tableLayout: "auto", wordBreak: "break-all" }}
      >
        {children}
      </table>
      <span
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          right: -5,
          bottom: -5,
          display: "none",
          cursor: "se-resize",
          userSelect: "none",
        }}
        contentEditable={false}
        onMouseDown={(e: any) => {
          let y = e.clientY,
            x = e.clientX,
            h = 0,
            w = 0,
            table: any = e.target.previousElementSibling;

          if (table == null) return;

          const styles = window.getComputedStyle(table);
          w = parseInt(styles.width, 10);
          h = parseInt(styles.height, 10);
          const tableWidth = parseInt(window.getComputedStyle(table).width);
          const tableHeight = parseInt(window.getComputedStyle(table).height);
          Array.from(table.querySelectorAll(":scope>tbody>tr>td")).forEach(
            (td: any) => {
              td.initXPer =
                parseInt(window.getComputedStyle(td).width) / tableWidth;
              td.initYPer =
                parseInt(window.getComputedStyle(td).height) / tableHeight;
            }
          );

          const mouseMoveHandler = function (e: any) {
            e.preventDefault();
            const dx = e.clientX - x;
            const dy = e.clientY - y;
            const width = w + dx;
            const height = h + dy;
            table.style.width = width + "px";
            table.style.height = height + "px";
            Array.from(table.querySelectorAll(":scope>tbody>tr>td")).forEach(
              (td: any) => {
                if (td.nextElementSibling != null) {
                  td.style.width = td.initXPer * width + "px";
                  td.style.height = td.initYPer * height + "px";
                }
              }
            );
          };

          const mouseUpHandler = function () {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
          };

          document.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);
        }}
      ></span>
    </div>
  );
};

export const TableLogic = {
  testModel: JSON.parse(
    `[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string0"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string0"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string0"}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string1"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string1"}]},{"type":"div","children":[{"text":"string2"}]},{"type":"div","children":[{"text":"string2"}]},{"type":"div","children":[{"text":"string1"}]}],"colSpan":2,"rowSpan":2}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string2"}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string3"}]}]},{"type":"td","children":[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"string3d"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"ds"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"dsadsad"}]}]},{"type":"li","children":[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"dsad"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"sadas"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"asd"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"dsa"}]}]}]}]}]}]}]}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string3"}]},{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"d"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"dsa"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"sad"}]}]},{"type":"td","children":[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"dsadsa"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"dsad"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"sd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"das"}]}]},{"type":"li","children":[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"ds"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"d"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"adsa"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"das"}]}]}]}]}]}]}]}]}]}]}]}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string4"}]},{"type":"div","children":[{"text":"string4"}]}],"colSpan":2,"rowSpan":1},{"type":"td","children":[{"type":"div","children":[{"text":"string4"}]}]}],"shouldEmpty":false}]}]},{"type":"div","children":[{"text":"1"}]}]`
  ),
  model: [
    {
      type: CET.TABLE,
      children: [
        {
          type: CET.TBODY,
          children: new Array(5).fill(0).map((item, index) => {
            return {
              type: CET.TR,
              children: new Array(10).fill(0).map((item, index) => {
                return {
                  type: CET.TD,
                  children: [
                    {
                      type: CET.DIV,
                      children: [{ text: "string".repeat(1) + String(index) }],
                    },
                  ],
                };
              }),
            };
          }),
        },
      ],
    },
    {
      type: CET.DIV,
      children: [{ text: "1" }],
    },
  ],
  getTdMap(tbody: NodeEntry): tdMapShape {
    const trs: any = tbody[0].children;
    const tdMap: any = new Array(trs.length).fill(0).map((o) => []);
    for (let i = 0; i < trs.length; i++) {
      const tr = trs[i];
      const tds = tr.children;
      for (let j = 0; j < tds.length; j++) {
        const td = tds[j];
        if (!TableLogic.isTd(td)) continue;
        let colStart = tdMap[i].findIndex((o: any) => o == null);
        colStart = colStart == -1 ? tdMap[i].length : colStart;
        let colEnd = colStart + (td.colSpan || 1),
          rowStart = i,
          rowEnd = rowStart + (td.rowSpan || 1);
        const fillTd = {
          ...td,
          colSpan: td.colSpan || 1,
          rowSpan: td.rowSpan || 1,
          row: i,
          col: colStart,
          originRow: i,
          originCol: j,
        };
        const replaceFillTd = { ...fillTd, start: false };

        for (let row = rowStart; row < rowEnd; row++) {
          for (let col = colStart; col < colEnd; col++) {
            tdMap[row][col] = replaceFillTd;
          }
        }
        tdMap[rowStart][colStart] = fillTd;
      }
    }
    return tdMap;
  },
  getSelectedTd(tbody: NodeEntry) {
    const tdMap = TableLogic.getTdMap(tbody);
    const helper = (
      {
        colStart,
        colEnd,
        rowStart,
        rowEnd,
      }: {
        colStart: number;
        colEnd: number;
        rowStart: number;
        rowEnd: number;
      },
      selectedTdMap: Map<any, number>
    ) => {
      for (let i = rowStart; i < rowEnd; i++) {
        for (let j = colStart; j < colEnd; j++) {
          const td: any = tdMap[i][j];
          if (!selectedTdMap.has(td)) {
            selectedTdMap.set(td, 1);
            helper(
              {
                colStart: Math.min(td.col, colStart),
                colEnd: Math.max(colEnd, td.col + td.colSpan),
                rowStart: Math.min(td.row, rowStart),
                rowEnd: Math.max(td.row + td.rowSpan, rowEnd),
              },
              selectedTdMap
            );
            return;
          }
        }
      }
    };

    const startPoins: customTdShape[] = [];

    for (let i = 0; i < tdMap.length; i++) {
      for (let j = 0; j < tdMap[i].length; j++) {
        const td: any = tdMap[i][j];
        if (td.start) {
          startPoins.push(td);
        }
      }
      if (startPoins.length == 2) break;
    }
    if (startPoins.length != 2) return null;
    const [a, b] = startPoins;
    const selectedTd = new Map<customTdShape, number>([
      [a, 1],
      [b, 1],
    ]);
    helper(
      {
        colStart: Math.min(a.col, b.col),
        colEnd: Math.max(a.col + a.colSpan, b.col + b.colSpan),
        rowStart: Math.min(a.row, b.row),
        rowEnd: Math.max(a.row + a.rowSpan, b.row + b.rowSpan),
      },
      selectedTd
    );
    return selectedTd;
  },
  isTable(node: Node): node is Element {
    return Element.isElement(node) && CET.TABLE == node.type;
  },
  isTd(node: Node): node is Element {
    return Element.isElement(node) && [CET.TD].includes(node.type);
  },
  isInTd(editor: EditorType) {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      return utils.getFirstAboveElementType(editor) == CET.TD;
    }
    return false;
  },
  normalizeTable(editor: EditorType, nodeEntry: NodeEntry) {
    const [node, path] = nodeEntry;

    // tbody校验规则
    if (Element.isElement(node) && [CET.TBODY].includes(node.type)) {
      // 如果tbody的父元素不是table，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && parent.type == CET.TABLE)) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
    }

    // tr校验规则
    if (Element.isElement(node) && CET.TR == node.type) {
      // 如果父元素不为tbody，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && [CET.TBODY].includes(parent.type))) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
      if (node.children.length == 1 && Node.child(node, 0).type != CET.TD) {
        Transforms.setNodes(editor, { shouldEmpty: true }, { at: path });
        return;
      } else {
        Transforms.setNodes(editor, { shouldEmpty: false }, { at: path });
      }
    }
    // td校验
    if (Element.isElement(node) && CET.TD == node.type) {
      // 如果父元素不是tr，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && [CET.TR].includes(parent.type))) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
      // 如果没有子元素，那么默认添加一个
      if (
        node.children.length == 1 &&
        Text.isText(Node.child(node, 0)) &&
        Editor.string(editor, path, { voids: true }) == ""
      ) {
        Transforms.wrapNodes(
          editor,
          {
            type: CET.DIV,
            children: [{ text: "" }],
          },
          {
            at: [...path, 0],
          }
        );
        return true;
      }
    }
  },
  arrowKeyEvent(editor: EditorType, key: "ArrowUp" | "ArrowDown") {
    if (editor.selection && !Range.isCollapsed(editor.selection)) return false;
    const [td] = Editor.nodes(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    const table = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTable(n);
      },
    });
    const { selection } = editor;
    if (!td || !selection || !table) return false;
    const tr = utils.getParent(editor, td[1]);
    if (!tr[0]) return false;
    const trParent = utils.getParent(editor, tr[1]);
    if (!trParent[0]) return false;

    switch (key) {
      case "ArrowUp": {
        // 如果当前光标在第一行，使用原生行为
        if (_.last(tr[1]) == 0) return false;

        // 如果光标不在当前td的第一个文本域里，那么使用原生的行为
        const [, firstChildPath] = Editor.first(editor, td[1]);
        if (!Path.equals(firstChildPath, selection.anchor.path)) return false;

        // 找到上一行
        const preTr = Editor.previous(editor, {
          at: tr[1],
          match(n) {
            return (
              Element.isElement(n) && n.type == CET.TR && n.shouldEmpty != true
            );
          },
        });
        if (!preTr) return false;
        // 找到上一行对应的td
        const [, preTdPath] = utils.getNodeByPath(editor, [
          ...preTr[1],
          _.last(td[1]) || 0,
        ]);

        if (!preTdPath) return false;

        // 将光标移动到目标td的结尾
        const preTdLastText = Editor.last(editor, preTdPath);
        Transforms.select(editor, Editor.end(editor, preTdLastText[1]));
        return true;
      }
      case "ArrowDown": {
        // 如果当前光标在最后一行，使用原生行为
        if (_.last(tr[1]) == trParent[0].children.length - 1) return false;

        // 如果光标不在当前td的最后一个文本域里，那么使用原生的行为
        const [, lastChildPath] = Editor.last(editor, td[1]);
        if (!Path.equals(lastChildPath, selection.anchor.path)) return false;

        // 找到下一行
        const nextTr = Editor.next(editor, {
          at: tr[1],
          match(n) {
            return (
              Element.isElement(n) && n.type == CET.TR && n.shouldEmpty != true
            );
          },
        });
        if (!nextTr) return false;
        // 找到下一行对应的td
        const [, nextTdPath] = utils.getNodeByPath(editor, [
          ...nextTr[1],
          _.last(td[1]) || 0,
        ]);

        if (!nextTdPath) return false;
        // 将光标移动到目标td的开头
        const nextTdFirstText = Editor.first(editor, nextTdPath);
        Transforms.select(editor, Editor.start(editor, nextTdFirstText[1]));
        return true;
      }
    }
  },
  backspaceEvent(editor: EditorType) {
    Editor.deleteBackward(editor);
  },
  deleteEvent(editor: EditorType) {
    Editor.deleteForward(editor);
  },
  enterEvent(editor: EditorType) {
    Editor.insertBreak(editor);
  },
  tabEvent(editor: EditorType) {
    // 找到text文本对应的第一层td
    const td = Editor.above(editor, {
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (!td) return;
    const [, nextPath] = Editor.next(editor, { at: td[1] }) || [];
    if (!nextPath) return;
    Transforms.select(editor, Editor.start(editor, nextPath));
  },
  shiftTabEvent(editor: EditorType) {
    const td = Editor.above(editor, {
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (!td) return;
    const [, prePath] = Editor.previous(editor, { at: td[1] }) || [];
    if (!prePath) return;
    Transforms.select(editor, Editor.end(editor, prePath));
  },
};
