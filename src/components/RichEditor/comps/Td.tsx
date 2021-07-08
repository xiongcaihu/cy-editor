/* eslint-disable eqeqeq */
import { useEffect } from "react";
import { Editor, Node, Element, Transforms, Path, NodeEntry } from "slate";
import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlateStatic,
} from "slate-react";
import { CET, CustomElement, EditorType, Marks } from "../common/Defines";
import {
  getEditingTdsPath,
  getPreSelectedTdPos,
  getStrPathSetOfSelectedTds,
  setEditingTdsPath,
  setPreSelectedTdPos,
  setStrPathSetOfSelectedTds,
} from "../common/globalStore";
import { TableLogic } from "./Table";

export type customTdShape = {
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

export let tdMinWidth = 100;
export const tdMinHeight = 30;

export const TD: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  element,
  children,
}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();

  useEffect(() => {
    const path = ReactEditor.findPath(editor, element);
    if (element.width == null || element.height == null) {
      Transforms.setNodes(
        editor,
        {
          width: element.width || tdMinWidth,
          height: element.height || tdMinHeight,
        },
        {
          at: path,
        }
      );
    }
    // 销毁时，删除状态
    return () => {
      const path = ReactEditor.findPath(editor, element);
      const pathStr = path.join(",");
      const selectedTds = getStrPathSetOfSelectedTds(editor);
      const editingTds = getEditingTdsPath(editor);
      selectedTds.delete(pathStr);
      editingTds.delete(pathStr);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const path = ReactEditor.findPath(editor, element);
    const pathStr = path.join(",");
    const selectedTds = getStrPathSetOfSelectedTds(editor);
    const editingTds = getEditingTdsPath(editor);
    const { canTdEdit: nowEdit, selected: nowSelected } = element;

    if (nowEdit === true) {
      editingTds.add(pathStr);
    } else {
      editingTds.delete(pathStr);
    }

    if (nowSelected === true) {
      selectedTds.add(pathStr);
    } else {
      selectedTds.delete(pathStr);
    }
  });

  const tdMouseDown = (e: any) => {
    if (["resizer", "columnSelector"].includes(e.target.className) || readOnly)
      return;
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

    let finallyTd: NodeEntry;
    if (isClickSelf) {
      finallyTd = [clickNode, clickNodePath];
    } else {
      const tdWrapper = Editor.above(editor, {
        at: clickNodePath,
        mode: "lowest",
        match(n) {
          return TableLogic.isTd(n);
        },
      });
      if (!tdWrapper) return;
      finallyTd = tdWrapper;
    }
    if (!finallyTd) return;
    TdLogic.chooseTd(editor, finallyTd);
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
    let x = e.clientX;
    let cell: any = null,
      table: any = null;

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

    const cellNode = ReactEditor.toSlateNode(editor, cell);
    const cellPath = ReactEditor.findPath(editor, cellNode);
    const tbody = Editor.above(editor, {
      at: cellPath,
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody) return;

    // 找到tdMap中在当前cell的最右边的cells
    const { tdMap } = TdLogic.getTdMap(tbody);
    // 先找到当前的cell在tdMap中的位置
    const [tdOriginRow, tdOriginCol] = cellPath.slice(cellPath.length - 2);
    let targetCol: number = -1;
    for (let i = 0; i < tdMap.length; i++) {
      for (let j = 0; j < tdMap[i].length; j++) {
        const td = tdMap[i][j];
        if (td.originCol == tdOriginCol && td.originRow == tdOriginRow) {
          targetCol = td.col + td.colSpan - 1;
          break;
        }
      }
      if (targetCol != -1) break;
    }
    if (targetCol == -1) return;

    const cells: any[] = [];
    for (let i = 0; i < tdMap.length; i++) {
      const tdInMap = tdMap[i][targetCol];
      const td = Editor.node(editor, [
        ...tbody[1],
        tdInMap.originRow,
        tdInMap.originCol,
      ]);
      const tdDom: any = ReactEditor.toDOMNode(editor, td[0]);
      tdDom.initX = tdDom.offsetWidth;
      cells.push(tdDom);
    }

    // const tableInitWidth = table.offsetWidth;

    const mouseMoveHandler = function (e: any) {
      const dx = e.clientX - x;
      cells.forEach((c) => {
        c.style.maxWidth =
          c.style.width =
          c.style.minWidth =
            (c.initX + dx < tdMinWidth ? tdMinWidth : c.initX + dx) + "px";
      });
      // table.style.width = tableInitWidth + dx + "px";
    };

    const mouseUpHandler = function () {
      const trs = Array.from(table.querySelectorAll(":scope>tbody>tr"));
      trs.forEach((tr: any, rowIndex) => {
        const tds = Array.from(tr.querySelectorAll(":scope>td"));
        tds.forEach((td: any, cellIndex) => {
          const width = parseInt(td.style.minWidth);
          const tdNode = ReactEditor.toSlateNode(editor, td);
          if (Element.isElement(tdNode) && tdNode.width != width) {
            Transforms.setNodes(
              editor,
              { width },
              { at: [...tbody[1], rowIndex, cellIndex] }
            );
          }
        });
      });
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const resizeTdY = (e: any) => {
    let y = e.clientY;
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

    const cellNode = ReactEditor.toSlateNode(editor, cell);
    const cellPath = ReactEditor.findPath(editor, cellNode);
    const tbody = Editor.above(editor, {
      at: cellPath,
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody) return;

    // 找到tdMap中在当前cell的最右边的cells
    const { tdMap } = TdLogic.getTdMap(tbody);

    // 先找到当前的cell在tdMap中的位置
    const [tdOriginRow, tdOriginCol] = cellPath.slice(cellPath.length - 2);
    let targetRow: number = -1;
    for (let i = 0; i < tdMap.length; i++) {
      for (let j = 0; j < tdMap[i].length; j++) {
        const td = tdMap[i][j];
        if (td.originCol == tdOriginCol && td.originRow == tdOriginRow) {
          targetRow = td.row + td.rowSpan - 1;
          break;
        }
      }
      if (targetRow != -1) break;
    }
    if (targetRow == -1) return;

    const cells: any[] = [];
    for (let i = 0; i < tdMap[0].length; i++) {
      const tdInMap = tdMap[targetRow][i];
      const td = Editor.node(editor, [
        ...tbody[1],
        tdInMap.originRow,
        tdInMap.originCol,
      ]);
      const tdDom: any = ReactEditor.toDOMNode(editor, td[0]);
      tdDom.initY = tdDom.offsetHeight;
      cells.push(tdDom);
    }

    // const tableInitY = parseInt(window.getComputedStyle(table).minHeight);

    const mouseMoveHandler = function (e: any) {
      e.preventDefault();
      const dy = e.clientY - y;
      cells.forEach(
        (c) =>
          (c.style.minHeight =
            c.style.height =
            c.style.maxHeight =
              (c.initY + dy <= tdMinHeight ? tdMinHeight : c.initY + dy) + "px")
      );
      // table.style.height = tableInitY + dy + "px";
    };

    const mouseUpHandler = function () {
      const trs = Array.from(table.querySelectorAll(":scope>tbody>tr"));
      trs.forEach((tr: any, rowIndex) => {
        const tds = Array.from(tr.querySelectorAll(":scope>td"));
        tds.forEach((td: any, cellIndex) => {
          const height = parseInt(td.style.height);
          const tdNode = ReactEditor.toSlateNode(editor, td);
          if (Element.isElement(tdNode) && tdNode.height != height) {
            Transforms.setNodes(
              editor,
              { height },
              { at: [...tbody[1], rowIndex, cellIndex] }
            );
          }
        });
      });
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
        minWidth: element.width || tdMinWidth,
        maxWidth: element.width || tdMinWidth,
        width: element.width || tdMinWidth,
        height: element.height || tdMinHeight,
        cursor: element.canTdEdit || readOnly ? "inherit" : "cell",
        color: element[Marks.Color] || "unset",
        backgroundColor: readOnly
          ? "unset"
          : element.selected
          ? "rgba(180,215,255,.7)"
          : element[Marks.BGColor] || "unset",
        userSelect: element.canTdEdit || readOnly ? "unset" : "none",
        textAlign: element[Marks.TextAlign] || "unset",
        fontSize: element[Marks.FontSize] || "unset",
        fontWeight: element[Marks.BOLD] ? "bold" : "unset",
        fontStyle: element[Marks.ITALIC] ? "italic" : "unset",
        textDecoration: `${element[Marks.Underline] ? "underline" : ""} ${
          element[Marks.LineThrough] ? "line-through" : ""
        }`,
      }}
      {...otherAttr}
      onDoubleClick={tdDBClick}
      onMouseDown={tdMouseDown}
    >
      {children}
      {!readOnly ? (
        <>
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
        </>
      ) : null}
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

    setPreSelectedTdPos({
      row: td[1][td[1].length - 2],
      col: td[1][td[1].length - 1],
    });
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
  getSelectedTdInTdMap(tbody: NodeEntry) {
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
    const selectedTdsPath = TableLogic.getSelectedTdsPath(editor);
    for (const path of selectedTdsPath) {
      Transforms.unsetNodes(editor, ["selected", "start", "canTdEdit"], {
        at: path,
      });
    }
    setStrPathSetOfSelectedTds(new Set());

    const editingTdsPath = TableLogic.getEditingTdsPath(editor);
    for (const tdStrPath of editingTdsPath) {
      const path: Path = tdStrPath.split(",").map((o) => +o);
      Transforms.unsetNodes(editor, ["selected", "start", "canTdEdit"], {
        at: path,
      });
    }
    setEditingTdsPath(new Set());

    setPreSelectedTdPos(null);
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
    const preSelectedTdPos = getPreSelectedTdPos();
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

    setPreSelectedTdPos({
      row: targetRow,
      col: targetCol,
    });
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
    setPreSelectedTdPos({
      row: td[1][td[1].length - 2],
      col: td[1][td[1].length - 1],
    });
  },
  clearTd(editor: EditorType) {
    // 清空带有selected属性的td
    const selectedTds = TableLogic.getSelectedTds(editor);
    for (const [, p] of selectedTds) {
      for (const [, childP] of Node.children(editor, p, {
        reverse: true,
      })) {
        Transforms.removeNodes(editor, { at: childP });
      }
      Transforms.unsetNodes(editor, ["selected", "start"], { at: p });
    }
  },
};
