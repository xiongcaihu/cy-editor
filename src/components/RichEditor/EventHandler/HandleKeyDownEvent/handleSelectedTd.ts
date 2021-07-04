import { EditorType } from "../../common/Defines";
import { TdLogic } from "../../comps/Td";
import { TableLogic } from "../../comps/Table";

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
    return;
  }

  if (e.ctrlKey && e.key === "v") {
    return;
  }
  return;
};
