import { Editor } from "slate";
import { EditorType } from "../../common/Defines";
import { utils } from "../../common/utils";
import { ListLogic } from "../../comps/ListComp";
import { TableLogic } from "../../comps/Table";

export const handleRangeExpand = (e: any, editor: EditorType): void => {
  const { selection } = editor;
  if (!selection) return;

  switch (e.key) {
    // case "Escape": {
    //   const [td, isNotOnlyOne] = Editor.nodes(editor, {
    //     at: selection,
    //     match(n) {
    //       return TableLogic.isTd(n) && n.canTdEdit === true;
    //     },
    //   });
    //   if (!td || isNotOnlyOne) break;
    //   TdLogic.chooseTd(editor, td);
    //   break;
    // }
    // case "ArrowUp": {
    //   const td = TableLogic.getEditingTd(editor);
    //   if (td) {
    //     const isInFirstChild = Path.isDescendant(selection.anchor.path, [
    //       ...td[1],
    //       0,
    //     ]);
    //     if (isInFirstChild) {
    //       TdLogic.findTargetTd(editor, td, "up");
    //       e.preventDefault();
    //       return;
    //     }
    //     return;
    //   }
    //   return;
    // }
    // case "ArrowDown": {
    //   const td = TableLogic.getEditingTd(editor);
    //   if (td) {
    //     const isInLastChild = Path.isDescendant(selection.anchor.path, [
    //       ...td[1],
    //       td[0].children.length - 1,
    //     ]);
    //     if (isInLastChild) {
    //       TdLogic.findTargetTd(editor, td, "down");
    //       e.preventDefault();
    //       return;
    //     }
    //     return;
    //   }
    //   return;
    // }
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
