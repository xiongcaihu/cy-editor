/* eslint-disable eqeqeq */
import { Node, Transforms, Editor, Element } from "slate";
import { CET, EditorType } from "../../common/Defines";
import { utils } from "../../common/utils";
import { ListLogic } from "../../comps/ListComp";
import { TableLogic } from "../../comps/Table";
import { TdLogic } from "../../comps/Td";

export const handleRangeCollapsed = (e: any, editor: EditorType): void => {
  const { selection } = editor;
  if (!selection) return;

  // 以下是没有选区的情况下的事件
  const elementType = utils.getFirstAboveElementType(editor);

  const getEditingTd = () => {
    const [td] = Editor.nodes(editor, {
      at: [],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.canTdEdit === true;
      },
    });
    return td;
  };

  // 如果默认事件没有被组件拦截掉，那么在这里重新定义拦截逻辑
  switch (e.key) {
    case "Tab": {
      e.preventDefault();
      if (CET.LIST_ITEM === elementType) {
        e.shiftKey
          ? ListLogic.shiftTabEvent(editor)
          : ListLogic.tabEvent(editor);
        break;
      }
      if (CET.TD === elementType) {
        e.shiftKey
          ? TableLogic.shiftTabEvent(editor)
          : TableLogic.tabEvent(editor);
        break;
      }
      // 如果是在其他元素上
      !e.shiftKey && Transforms.insertText(editor, "    ");
      break;
    }
    case "Escape": {
      const td = getEditingTd();
      if (!td) break;
      TdLogic.chooseTd(editor, td);
      break;
    }
    case "ArrowUp": {
      const td = getEditingTd();
      if (td) {
        const first = Node.child(td[0], 0);
        const cursor = Editor.parent(editor, selection.anchor);
        if (first == cursor[0]) {
          TdLogic.findTargetTd(editor, td, "up");
          Transforms.deselect(editor);
          e.preventDefault();
          return;
        }
        return;
      }
      return;
    }
    case "ArrowDown": {
      const td = getEditingTd();
      if (td) {
        const last = Node.child(td[0], td[0].children.length - 1);
        const cursor = Editor.parent(editor, selection.anchor);
        if (last == cursor[0]) {
          TdLogic.findTargetTd(editor, td, "down");
          Transforms.deselect(editor);
          e.preventDefault();
          return;
        }
        return;
      }
      return;
    }
    case "ArrowLeft": {
      const td = getEditingTd();
      if (td && Editor.isStart(editor, selection.anchor, td[1])) {
        TdLogic.findTargetTd(editor, td, "left");
        Transforms.deselect(editor);
        e.preventDefault();
        return;
      }
      return;
    }
    case "ArrowRight": {
      const td = getEditingTd();
      if (td && Editor.isEnd(editor, selection.anchor, td[1])) {
        TdLogic.findTargetTd(editor, td, "right");
        Transforms.deselect(editor);
        e.preventDefault();
        return;
      }
      return;
    }
  }
  return;
};
