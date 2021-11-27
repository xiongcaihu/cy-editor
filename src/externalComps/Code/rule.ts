import { Editor, Transforms, Element } from "slate";
import { CET, EditorType } from "../../components/RichEditor/common/Defines";

export const type = "code";

export const rule = (editor: EditorType) => {
  const { isVoid, deleteForward, deleteBackward } = editor;

  editor.isVoid = (node) => {
    if ([type].includes(node.type)) {
      return true;
    }
    return isVoid(node);
  };

  editor.deleteForward = (unit) => {
    if (!editor.selection) return;

    const afterPos = Editor.after(editor, editor.selection.anchor);
    if (afterPos) {
      const code = Editor.above(editor, {
        at: afterPos,
        match(n) {
          return Element.isElement(n) && n.type === CET.CODE;
        },
      });
      if (code) {
        Transforms.removeNodes(editor, {
          at: code[1],
          hanging: true,
        });
        return;
      }
    }

    deleteForward(unit);
  };

  editor.deleteBackward = (unit) => {
    if (!editor.selection) return;

    const prePos = Editor.before(editor, editor.selection.anchor);
    if (prePos) {
      const code = Editor.above(editor, {
        at: prePos,
        match(n) {
          return Element.isElement(n) && n.type === CET.CODE;
        },
      });
      if (code) {
        Transforms.removeNodes(editor, {
          at: code[1],
          hanging: true,
        });
        return true;
      }
    }

    deleteBackward(unit);
  };

  return editor;
};
