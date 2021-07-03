import { Editor } from "slate";
import { EditorType } from "../../common/Defines";
import { utils } from "../../common/utils";
import { ListLogic } from "../../comps/ListComp";
import { TableLogic } from "../../comps/Table";
import { TdLogic } from "../../comps/Td";

export const handleRangeExpand = (e: any, editor: EditorType):void => {
  const { selection } = editor;
  if (!selection) return;
  
  switch (e.key) {
    case "Escape": {
      const [td, isNotOnlyOne] = Editor.nodes(editor, {
        at: selection,
        match(n) {
          return TableLogic.isTd(n) && n.canTdEdit === true;
        },
      });
      if (!td || isNotOnlyOne) break;
      TdLogic.chooseTd(editor, td);
      break;
    }
    case "Tab": {
      e.preventDefault();

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
    }
  }
};
