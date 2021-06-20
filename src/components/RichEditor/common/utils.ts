/* eslint-disable eqeqeq */
import {
  Element,
  Editor,
  Path,
  Text,
  Node,
  Point,
  Transforms,
  Range,
  Descendant,
} from "slate";
import { TextWrappers, EditorType, CET } from "./Defines";
import { ListLogic } from "../comps/ListComp";
import { TableLogic } from "../comps/Table";

export const utils = {
  encodeSlateContent(data: Descendant[]) {
    return window?.btoa(encodeURIComponent(JSON.stringify(data)));
  },
  decodeContentToSlateData(data: string) {
    return JSON.parse(decodeURIComponent(window.atob(data)));
  },
  removeRangeElement(editor: EditorType) {
    const { selection } = editor;
    if (!selection) return;
    if (Point.equals(selection.anchor, selection.focus)) {
      Transforms.collapse(editor);
      return;
    }
    // 如果全选了表格，那么直接删除表格
    const tables = Editor.nodes(editor, {
      at: selection,
      match(n) {
        return TableLogic.isTable(n);
      },
    });
    for (const table of tables) {
      if (table) {
        const tableRange = Editor.range(editor, table[1]);
        const inte = Range.intersection(selection, tableRange);
        if (inte && Range.equals(tableRange, inte)) {
          Transforms.removeNodes(editor, { at: table[1] });
          utils.removeRangeElement(editor);
          return;
        }
      }
    }

    // 如果全选了列表，那么直接删除列表即可
    const lists = Editor.nodes(editor, {
      at: selection,
      match(n) {
        return ListLogic.isOrderList(n);
      },
    });
    for (const list of lists) {
      if (!!list) {
        const listRange = Editor.range(editor, list[1]);
        const inte = Range.intersection(selection, listRange);
        if (inte && Range.equals(listRange, inte)) {
          Transforms.removeNodes(editor, { at: list[1] });
          utils.removeRangeElement(editor);
          return;
        }
      }
    }

    // 部分删除，此部分最耗费性能，因为考虑到列表和表格可能杂糅在一起，所以需要从textWrapper一个个处理
    for (const [, p] of Editor.nodes(editor, {
      reverse: true,
      universal: true,
      match(n, p) {
        return Text.isText(n) || Editor.isInline(editor, n);
      },
    })) {
      const textWrapper = utils.getParent(editor, p);
      if (textWrapper && utils.isTextWrapper(textWrapper[0])) {
        const tRange = Editor.range(editor, textWrapper[1]);
        const inte = Range.intersection(selection, tRange);
        if (!inte) continue;
        // 如果整个被包含，那么直接删除textWrapper
        if (Range.equals(inte, tRange)) {
          Transforms.removeNodes(editor, {
            at: textWrapper[1],
          });
        } else {
          Transforms.delete(editor, {
            at: inte,
            reverse: true,
            unit: "character",
            hanging: true,
          });
        }
      }
    }

    // 为了在normalize之后运行
    setTimeout(() => {
      Transforms.select(
        editor,
        editor.selection ? Range.start(editor.selection) : []
      );
    }, 0);
  },
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
