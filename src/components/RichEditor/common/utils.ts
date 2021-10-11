/* eslint-disable eqeqeq */
import {
  Element,
  Editor,
  Path,
  Text,
  Node,
  Transforms,
  Range,
  Descendant,
  NodeEntry,
} from "slate";
import { TextWrappers, EditorType, CET } from "./Defines";
import { TableLogic } from "../comps/Table";
import { jsx } from "slate-hyperscript";
import { ListLogic } from "../comps/ListComp";

const deserialize: any = (el: any) => {
  // text node
  if (el.nodeType === 3) {
    return el.textContent;
    // not element node
  } else if (el.nodeType !== 1) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let children = Array.from(el.childNodes).map(deserialize);

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  switch (el.nodeName) {
    case "BODY":
      return jsx("fragment", {}, children);
    case "BR":
      return "\n";
    case "BLOCKQUOTE":
      return jsx("element", { type: "quote" }, children);
    case "P":
    case "DIV":
      return jsx("element", { type: CET.DIV }, children);
    case "A":
      return jsx(
        "element",
        {
          type: CET.LINK,
          url: el.getAttribute("href"),
          content: el.innserHTML,
        },
        children
      );
    case "IMG":
      return jsx(
        "element",
        {
          type: CET.IMG,
          url: el.getAttribute("src"),
        },
        children
      );
    case "TABLE":
      return jsx(
        "element",
        {
          type: CET.TABLE,
        },
        children
      );
    case "TBODY":
      return jsx(
        "element",
        {
          type: CET.TBODY,
        },
        children
      );
    case "TR":
      return jsx(
        "element",
        {
          type: CET.TR,
        },
        children
      );
    case "TD":
      return jsx(
        "element",
        {
          type: CET.TD,
          colSpan: el.getAttribute("colSpan"),
        },
        children
      );
    default:
      return el.textContent;
  }
};

export const utils = {
  /**
   * 判断包含了void,inline,text元素后，父元素是否依然为空
   * @param editor
   * @param el
   * @returns
   */
  isElementEmpty(editor: EditorType, el: NodeEntry) {
    const isThereHasNoEmptyChild = Array.from(Node.descendants(el[0])).some(
      (childEntry) => {
        const node = childEntry[0];
        return (
          (Text.isText(node) && node.text.length > 0) ||
          Editor.isVoid(editor, node) ||
          Editor.isInline(editor, node)
        );
      }
    );
    return !isThereHasNoEmptyChild;
  },
  removeAllRange() {
    window.getSelection()?.removeAllRanges();
  },
  encodeSlateContent(data: Descendant[]) {
    return window?.btoa(encodeURIComponent(JSON.stringify(data)));
  },
  decodeContentToSlateData(data: string) {
    return JSON.parse(decodeURIComponent(window.atob(data)));
  },
  removeRangeElement(editor: EditorType) {
    const { selection } = editor;
    if (!selection) return;
    if (Range.isCollapsed(selection)) return;

    // 如果全选了代码块，那么删除
    const codes = Editor.nodes(editor, {
      at: selection,
      match(n) {
        return Element.isElement(n) && n.type === CET.CODE;
      },
    });
    for (const code of codes) {
      if (code) {
        const codeRange = Editor.range(editor, code[1]);
        const inte = Range.intersection(selection, codeRange);
        if (inte && Range.equals(codeRange, inte)) {
          Transforms.removeNodes(editor, { at: code[1] });
          utils.removeRangeElement(editor);
          return;
        }
      }
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
    const texts = Array.from(
      Editor.nodes(editor, {
        reverse: true,
        match(n, p) {
          return Text.isText(n) || Editor.isInline(editor, n);
        },
      })
    );
    for (const [, p] of texts) {
      const textWrapper = utils.getParent(editor, p);
      if (
        Element.isElement(textWrapper[0]) &&
        textWrapper[0].type === CET.TODOLIST
      ) {
        const todoList = textWrapper;
        const tRange = Editor.range(editor, todoList[1]);
        const inte =
          editor.selection && Range.intersection(editor.selection, tRange);
        if (!inte) continue;
        if (Range.equals(inte, tRange)) {
          Transforms.removeNodes(editor, {
            at: todoList[1],
          });
        } else {
          Transforms.delete(editor, {
            at: inte,
            reverse: true,
            unit: "character",
            hanging: true,
          });
        }
        continue;
      }
      if (textWrapper.length > 0 && utils.isTextWrapper(textWrapper[0])) {
        const tRange = Editor.range(editor, textWrapper[1]);
        const inte =
          editor.selection && Range.intersection(editor.selection, tRange);
        if (!inte) continue;
        const [twParent] = utils.getParent(editor, textWrapper[1]);
        const isInTd = TableLogic.isTd(twParent);
        // 如果整个被包含，那么直接删除textWrapper
        if (
          Range.equals(inte, tRange) &&
          !(isInTd && twParent.children.length == 1) &&
          !Path.equals(texts[0][1], p)
        ) {
          Transforms.removeNodes(editor, {
            at: textWrapper[1],
          });
        } else {
          if (Range.isCollapsed(inte)) continue;
          Transforms.delete(editor, {
            at: inte,
            reverse: true,
            unit: "character",
            hanging: true,
          });
        }
      }
    }

    Transforms.collapse(editor, { edge: "start" });

    // Transforms.delete(editor);
  },
  isTextWrapper(node: Node) {
    return Element.isElement(node) && TextWrappers.includes(node.type);
  },
  // 获取包裹光标文本位置的li或者td
  getFirstAboveElementType(editor: EditorType) {
    if (editor.selection) {
      const textWrapper = utils.getParent(editor, editor.selection.anchor.path);
      if (!textWrapper[0]) return null;
      const element = utils.getParent(editor, textWrapper[1]);
      if (!element[0]) return null;

      return (
        (Element.isElement(element[0]) && element[0].type) ||
        (Editor.isEditor(element[0]) && CET.EDITOR)
      );
    }
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
  hasNotSelectedAnyTd(editor: EditorType) {
    const hasSelectedTd = TableLogic.getFirstSelectedTd(editor);
    return hasSelectedTd == null && !TableLogic.isInTable(editor);
  },
};
