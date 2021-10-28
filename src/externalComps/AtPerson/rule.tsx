import { ReactEditor } from "slate-react";
import { EditorType } from "../../components/RichEditor/common/Defines";
import { Box } from "./box";

export const type = "atPerson";

export const rule = (editor: EditorType) => {
  const { isVoid, setFixLayoutBox, insertText } = editor;

  editor.isVoid = (node) => {
    if ([type].includes(node.type)) {
      return true;
    }
    return isVoid(node);
  };

  editor.insertText = (text) => {
    const range =
      editor.selection && ReactEditor.toDOMRange(editor, editor.selection);
    const rangePos = range && range.getBoundingClientRect();
    console.log(rangePos);
    insertText(text);
    if (text === "@") {
      setFixLayoutBox?.(
        {
          left: rangePos?.left,
          top: (rangePos?.top || 0) + 24,
          visible: true,
        },
        Box
      );
    }
  };

  return editor;
};
