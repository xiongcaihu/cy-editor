import { CET, CustomElement, EditorType } from "../../common/Defines";
import { customTdShape, TdLogic } from "../../comps/Td";
import { TableLogic } from "../../comps/Table";
import {
  getCopyedCellsPath,
  getCopyedMaxRowAndCol,
  setCopyedCellsPath,
  setCopyedMaxRowAndCol,
} from "../../common/globalStore";
import _ from "lodash";
import { Editor, Element, Node, NodeEntry, Path, Transforms } from "slate";
import { message } from "antd";

export const handleSelectedTd = (e: any, editor: EditorType) => {
  // 当没有选区的时候，查看是否已经选中表格
  const isNotOnlyOneTd = TableLogic.getSelectedTdsSize(editor) > 1;

  const getFirstTd = () => TableLogic.getFirstSelectedTd(editor);

  switch (e.key) {
    case "Delete":
    case "Backspace": {
      TdLogic.clearTd(editor);
      break;
    }
    case "Tab": {
      e.preventDefault();
      if (isNotOnlyOneTd) break;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, e.shiftKey ? "left" : "right");
      break;
    }
    case "Escape": {
      e.preventDefault();
      TdLogic.deselectAllTd(editor);
      break;
    }
    // 直接全选选中的td的内容，进入编辑状态
    case " ":
    case "Enter":
      {
        e.preventDefault();
        if (isNotOnlyOneTd) break;
        const td = getFirstTd();
        td && TdLogic.editTd(editor, td);
      }
      break;
    case "ArrowUp": {
      e.preventDefault();
      if (isNotOnlyOneTd) break;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, "up");
      break;
    }
    case "ArrowDown": {
      e.preventDefault();
      if (isNotOnlyOneTd) break;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, "down");
      break;
    }
    case "ArrowLeft": {
      e.preventDefault();
      if (isNotOnlyOneTd) break;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, "left");
      break;
    }
    case "ArrowRight": {
      e.preventDefault();
      if (isNotOnlyOneTd) break;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, "right");
      break;
    }
  }

  if (!e.ctrlKey && (e.key.length === 1 || e.key === "Process")) {
    if (isNotOnlyOneTd) return;
    const td = getFirstTd();
    TdLogic.clearTd(editor);
    td && TdLogic.editTd(editor, td);
  }

  if (e.ctrlKey && e.key === "c") {
    const selectedTdsPath = TableLogic.getSelectedTdsPath(editor);
    setCopyedCellsPath(_.clone(selectedTdsPath));
    const tbody = Editor.above(editor, {
      at: selectedTdsPath[0],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type === CET.TBODY;
      },
    });
    if (!tbody) return;
    const tds = Array.from(
      TdLogic.getSelectedTdInTdMap(tbody)?.keys() || ([] as customTdShape[])
    );
    const { startPoins } = TdLogic.getTdMap(tbody);
    let preMaxCol = 0,
      preMaxRow = 0;
    tds.forEach((td) => {
      const { row, col } = td;
      preMaxCol = Math.max(
        col + (td.colSpan || 1) - startPoins[0].col,
        preMaxCol
      );
      preMaxRow = Math.max(
        row + (td.rowSpan || 1) - startPoins[0].row,
        preMaxRow
      );
    });
    setCopyedMaxRowAndCol({
      copyedMaxCol: preMaxCol,
      copyedMaxRow: preMaxRow,
    });
    return;
  }

  if (e.ctrlKey && e.key === "v") {
    // 检查复制的单元格区域能否完全覆盖目标区域
    const copyedCellsPath = getCopyedCellsPath();
    if (!copyedCellsPath) return;
    copyedCellsPath.sort((a, b) => {
      const [arow, acol] = a.slice(a.length - 2);
      const [brow, bcol] = b.slice(b.length - 2);
      return arow > brow ? 1 : arow === brow ? acol - bcol : -1;
    });
    const { copyedMaxCol: preMaxCol, copyedMaxRow: preMaxRow } =
      getCopyedMaxRowAndCol();
    const selectedTds = Array.from(TableLogic.getSelectedTds(editor));
    const tbody = Editor.above(editor, {
      at: selectedTds[0][1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type === CET.TBODY;
      },
    });
    if (!tbody) return;
    const { tdMap, startPoins } = TdLogic.getTdMap(tbody);
    const startPoint = startPoins[0];
    if (
      startPoint.row + preMaxRow > tdMap.length ||
      startPoint.col + preMaxCol > tdMap[0].length
    ) {
      message.error("无法完整覆盖目标区域");
      return false;
    }
    const waitToDeleteTdsPath = [];
    // 验证覆盖区域是否合法
    for (
      let row = startPoint.row;
      row < tdMap.length && row < startPoint.row + preMaxRow;
      row++
    ) {
      for (
        let col = startPoint.col;
        col < tdMap[0].length && col < startPoint.col + preMaxCol;
        col++
      ) {
        const td = tdMap[row][col];
        waitToDeleteTdsPath.unshift([td.originRow, td.originCol]);
        if (
          td.col < startPoint.col ||
          td.col + td.colSpan > startPoint.col + preMaxCol ||
          td.row < startPoint.row ||
          td.row + td.rowSpan > startPoint.row + preMaxRow
        ) {
          message.error("无法完整覆盖目标区域");
          return false;
        }
      }
    }

    // 缓存之前复制的td
    const cacheTds: { originTd: Node; path: Path }[] = [];
    copyedCellsPath.forEach((path) => {
      const td = Editor.node(editor, path);
      td &&
        cacheTds.push({
          originTd: _.cloneDeep({
            ...td[0],
            selected: false,
            start: false,
            canTdEdit: false,
          }),
          path,
        });
    });

    _.uniqWith(waitToDeleteTdsPath, (a, b) => {
      return a.join(",") === b.join(",");
    }).forEach((path) => {
      Transforms.removeNodes(editor, { at: [...tbody[1], ...path] });
    });

    let minRow = copyedCellsPath.slice().reduce((p, c) => {
      return Math.min(p, c[c.length - 2]);
    }, Infinity);

    for (
      let row = startPoint.row, nowCopyedCellsRow = minRow;
      row < startPoint.row + preMaxRow;
      row++, nowCopyedCellsRow++
    ) {
      const td = tdMap[row][startPoint.col];
      const insertTds: any[] = [];
      cacheTds.forEach((td) => {
        const path = td.path;
        if (path[path.length - 2] === nowCopyedCellsRow) {
          insertTds.push(td.originTd);
        }
      });
      insertTds.length > 0 &&
        Transforms.insertNodes(editor, _.cloneDeep(insertTds), {
          at: [...tbody[1], row, td.originCol],
        });
    }

    TdLogic.deselectAllTd(editor);
    TableLogic.resetSelectedTds(editor);
    setCopyedCellsPath(null);
    setCopyedMaxRowAndCol({ copyedMaxCol: 0, copyedMaxRow: 0 });

    return;
  }
  return;
};
