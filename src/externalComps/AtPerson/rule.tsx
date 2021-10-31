import { Range, Transforms } from "slate";
import { EditorType } from "../../components/RichEditor/common/Defines";
import { utils } from "../../components/RichEditor/common/utils";

export const type = "atPerson";

export const rule = (editor: EditorType) => {
  const { isVoid,  isInline, insertText } = editor;

  editor.isVoid = (node) => {
    if ([type].includes(node.type)) {
      return true;
    }
    return isVoid(node);
  };
  editor.isInline = (node) => {
    if ([type].includes(node.type)) {
      return true;
    }
    return isInline(node);
  };

  editor.insertText = (text) => {
    if (text === "@") {
      if (editor.selection && Range.isExpanded(editor.selection)) {
        utils.removeRangeElement(editor);
      }
      Transforms.insertNodes(editor, {
        type,
        person: {
          name: "点击搜索员工",
          id: '',
        },
        children: [{ text: "@点击搜索员工" }],
      } as any);
    } else {
      insertText(text);
    }
  };

  return editor;
};
