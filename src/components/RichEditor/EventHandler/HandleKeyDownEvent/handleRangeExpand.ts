import { Editor } from "slate";
import { EditorType } from "../../common/Defines";
import { utils } from "../../common/utils";
import { ListLogic } from "../../comps/ListComp";
import { TableLogic } from "../../comps/Table";
import { ToDoListLogic } from "../../comps/TodoListComp";

export const handleRangeExpand = (e: any, editor: EditorType): void => {
  const { selection } = editor;
  if (!selection) return;

  switch (e.key) {
    case "Home": {
      ToDoListLogic.handleKeyDown(e, editor);
      return;
    }
    case "Tab": {
      e.preventDefault();

      const isInLi = ListLogic.isInLi(editor);

      if (isInLi) {
        for (const [, p] of Editor.nodes(editor, {
          at: selection,
          reverse: true,
          universal: true,
          match(n) {
            return utils.isTextWrapper(n);
          },
        })) {
          const [parent, pp] = utils.getParent(editor, p);
          if (!parent) continue;
          if (ListLogic.isListItem(parent)) {
            !e.shiftKey
              ? ListLogic.indentLi(editor, [parent, pp])
              : ListLogic.liftLi(editor, [parent, pp]);
          }
        }
        break;
      } else {
        const isInTable = TableLogic.isInTable(editor);
        if (isInTable) {
          !e.shiftKey
            ? TableLogic.tabEvent(editor)
            : TableLogic.shiftTabEvent(editor);
        }
      }
    }
  }
};
