/* eslint-disable eqeqeq */
import { Editor, Node, Element, Transforms, Path, NodeEntry } from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import { CET, CustomElement, EditorType } from "../common/Defines";
import { TableLogic } from "./Table";

type customTdShape = {
  start: boolean;
  colSpan: number;
  rowSpan: number;
  row: number; // 在tdMap里的坐标
  col: number; // 在tdMap里的坐标
  originRow: number; // 在原来tbody里的坐标
  originCol: number; // 在原来tbody里的坐标
} & CustomElement;

type tdMapShape = Array<customTdShape[]>;
type getTdMapReturn = {
  tdMap: tdMapShape;
  startPoins: customTdShape[];
};

const tdMinWidth = 100;
const tdMinHeight = 30;
export const TD: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  element,
  children,
}) => {
  const editor = useSlateStatic();

  const tdMouseDown = (e: any) => {
    if (["resizer", "columnSelector"].includes(e.target.className)) return;
    const selfDom = attributes.ref.current;
    if (!selfDom) return;

    const td = ReactEditor.toSlateNode(editor, selfDom);
    const tdPath = ReactEditor.findPath(editor, td);

    // 如果点击自己的时候，自己还是处于编辑状态，那么退出
    if (Element.isElement(td) && td.canTdEdit) return;

    const clickDom = e.target;
    const clickNode = ReactEditor.toSlateNode(editor, clickDom);
    const clickNodePath = ReactEditor.findPath(editor, clickNode);
    const isClickSelf = Path.equals(clickNodePath, tdPath);

    if (isClickSelf) {
      TdLogic.chooseTd(editor, [clickNode, clickNodePath]);
      return;
    }
    const tdWrapper = Editor.above(editor, {
      at: clickNodePath,
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (!tdWrapper) return;
    TdLogic.chooseTd(editor, tdWrapper);
  };
  const tdDBClick = (e: any) => {
    // 防止事件冒泡到父元素的td
    e.stopPropagation();
    const selfDom = attributes.ref.current;
    if (!selfDom) return;

    const td = ReactEditor.toSlateNode(editor, selfDom);
    const tdPath = ReactEditor.findPath(editor, td);

    TdLogic.editTd(editor, [td, tdPath]);
  };
  const resizeTdX = (e: any) => {
    let x = 0;
    let cell: any = null,
      table: any = null;
    x = e.clientX;

    for (let i = 0, paths = e.nativeEvent.path; i < paths.length; i++) {
      const ele = paths[i];
      if (ele.tagName == "TD") {
        cell = ele;
      }
      if (ele.tagName == "TABLE") {
        table = ele;
        break;
      }
    }

    if (cell == null || table == null) return;

    const getLeftTotalColSpan = (td: any) => {
      let sum = td.colSpan,
        nowTd = td;
      while (nowTd.previousElementSibling != null) {
        nowTd = nowTd.previousElementSibling;
        sum += nowTd.colSpan;
      }
      return sum;
    };

    const cells: any[] = Array.from(
      table.querySelectorAll(":scope>tbody>tr>td")
    ).filter((c: any) => {
      if (
        c.tagName == "TD" &&
        c.cellIndex + getLeftTotalColSpan(c) ==
          cell.cellIndex + getLeftTotalColSpan(cell)
      ) {
        c.initX = c.offsetWidth;
        return true;
      }
      return false;
    });

    const tableInitX = parseInt(window.getComputedStyle(table).width);

    const mouseMoveHandler = function (e: any) {
      const dx = e.clientX - x;
      cells.forEach((c) => {
        c.style.minWidth =
          (c.initX + dx < tdMinWidth ? tdMinWidth : c.initX + dx) + "px";
      });
      table.style.width = tableInitX + dx + "px";
    };

    const mouseUpHandler = function () {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };
  const resizeTdY = (e: any) => {
    let y = e.clientY;
    let h = 0;
    let cell: any = null,
      row: any = null,
      table: any = null;

    for (let i = 0, paths = e.nativeEvent.path; i < paths.length; i++) {
      const ele = paths[i];
      if (ele.tagName == "TD") {
        cell = ele;
      }
      if (ele.tagName == "TR") {
        row = ele;
      }
      if (ele.tagName == "TABLE") {
        table = ele;
        break;
      }
    }

    if (cell == null || row == null || table == null) return;

    const cells: any[] = Array.from(row.querySelectorAll(":scope>td"));

    const styles = window.getComputedStyle(cell);
    h = parseInt(styles.height, 10);

    const tableInitY = parseInt(window.getComputedStyle(table).minHeight);

    const mouseMoveHandler = function (e: any) {
      e.preventDefault();
      const dy = e.clientY - y;
      cells.forEach(
        (c) =>
          (c.style.height =
            (h + dy <= tdMinHeight ? tdMinHeight : h + dy) + "px")
      );
      table.style.height = tableInitY + dy + "px";
    };

    const mouseUpHandler = function () {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };
  const otherAttr: any = {
    contentEditable: false,
  };
  if (element.canTdEdit === true) {
    delete otherAttr.contentEditable;
  }
  return (
    <td
      {...attributes}
      colSpan={element.colSpan}
      rowSpan={element.rowSpan}
      style={{
        padding: 4,
        minWidth: tdMinWidth,
        minHeight: tdMinHeight,
        position: "relative",
        cursor: element.canTdEdit ? "text" : "pointer",
        backgroundColor: element.selected ? "rgba(180,215,255,.7)" : "unset",
        userSelect: element.canTdEdit ? "unset" : "none",
      }}
      {...otherAttr}
      onDoubleClick={tdDBClick}
      onMouseDown={tdMouseDown}
    >
      {children}
      <span
        className="resizer"
        style={{
          position: "absolute",
          width: 5,
          right: 0,
          top: 0,
          height: "100%",
          cursor: "col-resize",
          userSelect: "none",
        }}
        contentEditable={false}
        onMouseDown={resizeTdX}
      ></span>
      <span
        className="resizer"
        style={{
          position: "absolute",
          width: "100%",
          height: 5,
          left: 0,
          bottom: 0,
          cursor: "row-resize",
          userSelect: "none",
        }}
        contentEditable={false}
        onMouseDown={resizeTdY}
      ></span>
    </td>
  );
};

export const TdLogic = {
  editTd(editor: EditorType, td: NodeEntry) {
    TdLogic.deselectAllTd(editor);

    // 获取最顶层td
    const topTd = Editor.above(editor, {
      at: td[1],
      mode: "highest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });

    Transforms.setNodes(
      editor,
      { canTdEdit: true, start: true },
      {
        at: Editor.range(editor, topTd ? topTd[1] : td[1]),
        mode: "all",
        hanging: true,
        match(n) {
          return TableLogic.isTd(n);
        },
      }
    );
    Transforms.select(editor, td[1]);

    const tbody = Editor.above(editor, {
      at: td[1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody) return;

    Transforms.setNodes(
      editor,
      {
        preSelectedTdPos: {
          row: td[1][td[1].length - 2],
          col: td[1][td[1].length - 1],
        },
      },
      { at: tbody[1] }
    );
  },
  getTdMap(tbody: NodeEntry): getTdMapReturn {
    const trs = tbody[0].children as Element[];
    const startPoins: customTdShape[] = [];
    const tdMap: any = new Array(trs.length).fill(0).map(() => []);
    for (let i = 0; i < trs.length; i++) {
      const tr = trs[i];
      const tds = tr.children;
      for (let j = 0; j < tds.length; j++) {
        const td = tds[j] as Element;
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
        if (td.start) startPoins.push(fillTd as customTdShape);

        for (let row = rowStart; row < rowEnd; row++) {
          for (let col = colStart; col < colEnd; col++) {
            tdMap[row][col] = fillTd;
          }
        }
      }
    }
    return {
      tdMap,
      startPoins,
    };
  },
  getSelectedTd(tbody: NodeEntry) {
    const { tdMap, startPoins } = TdLogic.getTdMap(tbody);
    if (startPoins.length < 1) return null;
    if (startPoins.length == 1) startPoins[1] = startPoins[0];
    if (!tdMap) return null;

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
      selectedTdMap: Map<customTdShape, number>
    ) => {
      for (let i = rowStart; i < rowEnd; i++) {
        for (let j = colStart; j < colEnd; j++) {
          const td = tdMap[i][j];
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
  getEditingTd(editor: EditorType) {
    const [td] = Editor.nodes(editor, {
      at: [],
      match(n) {
        return TableLogic.isTd(n) && n.canTdEdit == true;
      },
    });
    return td;
  },
  deselectAllTd(editor: EditorType) {
    Transforms.unsetNodes(editor, ["selected", "start", "canTdEdit"], {
      at: [],
      mode: "all",
      match(n) {
        return (
          TableLogic.isTd(n) &&
          (n.selected == true || n.start == true || n.canTdEdit == true)
        );
      },
    });
    Transforms.unsetNodes(editor, ["preSelectedTdPos"], {
      at: [],
      mode: "all",
      match(n) {
        return (
          Element.isElement(n) &&
          n.type == CET.TBODY &&
          n.preSelectedTdPos != null
        );
      },
    });
  },
  /**
   * 找到下一个位置的td
   */
  findTargetTd(
    editor: EditorType,
    td: NodeEntry,
    direct: "left" | "right" | "up" | "down"
  ) {
    if (!td) return;
    // 首先判断当前是不是只有一个单元格被选中
    const tbody = Editor.above(editor, {
      at: td[1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody || !Element.isElement(tbody[0])) return;
    const { tdMap } = TdLogic.getTdMap(tbody);
    const preSelectedTdPos = tbody[0].preSelectedTdPos;
    if (!preSelectedTdPos) return;

    let row, col;
    tdMap.some((tr, i) => {
      return tr.some((td, j) => {
        if (td.start == true) {
          row = i;
          col = j;
          return true;
        }
        return false;
      });
    });
    if (row == null || col == null) return;
    const startTd = tdMap[row][col];

    TdLogic.deselectAllTd(editor);
    let targetCol: number = preSelectedTdPos.col,
      targetRow: number = preSelectedTdPos.row;
    if (direct == "left") {
      targetCol =
        col == 0
          ? row == 0
            ? 0
            : ((targetRow = preSelectedTdPos.row - 1), tdMap[0].length - 1)
          : col - 1;
    } else if (direct == "right") {
      const rightX = col + startTd.colSpan;
      targetCol =
        rightX >= tdMap[0].length
          ? row == tdMap.length - 1
            ? col
            : ((targetRow = preSelectedTdPos.row + 1), 0)
          : rightX;
    } else if (direct == "up") {
      targetRow = row == 0 ? 0 : row - 1;
    } else if (direct == "down") {
      targetRow =
        row + startTd.rowSpan >= tdMap.length ? row : row + startTd.rowSpan;
    }
    const targetTd = tdMap[targetRow][targetCol];

    Transforms.setNodes(
      editor,
      {
        preSelectedTdPos: {
          row: targetRow,
          col: targetCol,
        },
      },
      {
        at: tbody[1],
      }
    );
    Transforms.setNodes(
      editor,
      {
        selected: true,
        start: true,
      },
      {
        at: [...tbody[1], targetTd.originRow, targetTd.originCol],
      }
    );
  },
  chooseTd(editor: EditorType, td: NodeEntry) {
    TdLogic.deselectAllTd(editor);
    Transforms.deselect(editor);
    Transforms.setNodes(
      editor,
      {
        selected: true,
        start: true,
        canTdEdit: false,
      },
      { at: td[1] }
    );
    const tbody = Editor.above(editor, {
      at: td[1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody) return;
    Transforms.setNodes(
      editor,
      {
        preSelectedTdPos: {
          row: td[1][td[1].length - 2],
          col: td[1][td[1].length - 1],
        },
      },
      { at: tbody[1] }
    );
  },
  clearTd(editor: EditorType) {
    // 清空带有selected属性的td
    for (const [, p] of Editor.nodes(editor, {
      at: [],
      match(n) {
        return TableLogic.isTd(n) && n.selected == true;
      },
    })) {
      for (const [, childP] of Node.children(editor, p, {
        reverse: true,
      })) {
        Transforms.removeNodes(editor, { at: childP });
      }
      Transforms.unsetNodes(editor, ["selected", "start"], { at: p });
    }
  },
};
