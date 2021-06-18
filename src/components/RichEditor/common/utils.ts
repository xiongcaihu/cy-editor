/* eslint-disable eqeqeq */
import { Element, Editor, Path, Node } from "slate";
import { TextWrappers, EditorType, CET } from "./Defines";
import { ListLogic } from "./ListLogic";
import { TableLogic } from "./TableLogic";

export const utils = {
  isTextWrapper(node: Node) {
    return Element.isElement(node) && TextWrappers.includes(node.type);
  },
  // 获取包裹光标文本位置的li或者td
  getFirstAboveElementType(editor: EditorType) {
    const ele = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return (
          ListLogic.isListItem(n) || TableLogic.isTd(n) || Editor.isEditor(n)
        );
      },
    });
    if (!ele) return null;

    return (
      (Element.isElement(ele[0]) && ele[0].type) ||
      (Editor.isEditor(ele[0]) && CET.EDITOR)
    );
  },
  getPath(path: Path, type: "pre" | "next" | "parent") {
    const basePath = path.slice(0, path.length - 1);
    const t = path[path.length - 1];
    return type == "parent"
      ? basePath
      : [...basePath, type == "pre" ? t - 1 : t + 1];
  },
  getNodeByPath(editor: EditorType, path: Path) {
    try {
      return Editor.node(editor, path);
    } catch (error) {
      return [];
    }
  },
  getParent(editor: EditorType, path: Path) {
    return this.getNodeByPath(editor, this.getPath(path, "parent"));
  },
};
