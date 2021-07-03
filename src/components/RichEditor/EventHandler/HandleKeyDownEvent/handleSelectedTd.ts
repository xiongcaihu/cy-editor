import { EditorType } from "../../common/Defines";
import { TdLogic } from "../../comps/Td";
import { TableLogic } from "../../comps/Table";

export const handleSelectedTd = (e: any, editor: EditorType) => {
  // 当没有选区的时候，查看是否已经选中表格
  const isNotOnlyOneTd = TableLogic.getSelectedTdsSize() > 1;

  const getFirstTd = () => TableLogic.getFirstSelectedTd(editor);

  switch (e.key) {
    case "Delete":
    case "Backspace": {
      TdLogic.clearTd(editor);
      return;
    }
    case "Tab": {
      e.preventDefault();
      if (isNotOnlyOneTd) return;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, e.shiftKey ? "left" : "right");
      return;
    }
    case "Escape": {
      e.preventDefault();
      TdLogic.deselectAllTd(editor);
      return;
    }
    // 直接全选选中的td的内容，进入编辑状态
    case " ":
    case "Enter":
      {
        e.preventDefault();
        if (isNotOnlyOneTd) return;
        const td = getFirstTd();
        td && TdLogic.editTd(editor, td);
      }
      return;
    case "ArrowUp": {
      e.preventDefault();
      if (isNotOnlyOneTd) return;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, "up");
      return;
    }
    case "ArrowDown": {
      e.preventDefault();
      if (isNotOnlyOneTd) return;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, "down");
      return;
    }
    case "ArrowLeft": {
      e.preventDefault();
      if (isNotOnlyOneTd) return;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, "left");
      return;
    }
    case "ArrowRight": {
      e.preventDefault();
      if (isNotOnlyOneTd) return;
      const td = getFirstTd();
      td && TdLogic.findTargetTd(editor, td, "right");
      return;
    }
  }
  if (!e.ctrlKey && (e.key.length === 1 || e.key === "Process")) {
    if (isNotOnlyOneTd) return;
    const td = getFirstTd();
    TdLogic.clearTd(editor);
    td && TdLogic.editTd(editor, td);
  }
  return;
};
