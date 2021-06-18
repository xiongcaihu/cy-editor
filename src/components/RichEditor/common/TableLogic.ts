/* eslint-disable eqeqeq */
import {
  Transforms,
  Range,
  Point,
  Element,
  Editor,
  Path,
  Node,
  NodeEntry,
} from "slate";
import _ from "lodash";
import { CET, EditorType } from "./Defines";
import { utils } from "./utils";

export const TableLogic = {
  model: [
    {
      type: CET.TABLE,
      children: [
        {
          type: CET.TBODY,
          children: new Array(100).fill(0).map((item, index) => {
            return {
              type: CET.TR,
              children: [
                {
                  type: CET.TD,
                  children: [
                    {
                      type: CET.DIV,
                      children: [{ text: "string".repeat(1) + String(index) }],
                    },
                  ],
                },
                {
                  type: CET.TD,
                  children: [
                    {
                      type: CET.DIV,
                      children: [{ text: "string" + String(index) }],
                    },
                  ],
                },
                {
                  type: CET.TD,
                  children: [
                    {
                      type: CET.DIV,
                      children: [{ text: "string" + String(index) }],
                    },
                  ],
                },
              ],
            };
          }),
        },
      ],
    },
    {
      type: CET.DIV,
      children: [{ text: "1" }],
    },
  ],
  isTable(node: Node): node is Element {
    return Element.isElement(node) && CET.TABLE == node.type;
  },
  isTd(node: Node): node is Element {
    return Element.isElement(node) && [CET.TD].includes(node.type);
  },
  normalizeTable(editor: EditorType, nodeEntry: NodeEntry) {
    const [node, path] = nodeEntry;

    // tbody校验规则
    if (Element.isElement(node) && [CET.TBODY].includes(node.type)) {
      // 如果tbody的父元素不是table，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && parent.type == CET.TABLE)) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
    }

    // tr校验规则
    if (Element.isElement(node) && CET.TR == node.type) {
      // 如果父元素不为tbody，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && [CET.TBODY].includes(parent.type))) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
    }

    // td校验
    if (Element.isElement(node) && CET.TD == node.type) {
      // 如果父元素不是tr，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && [CET.TR].includes(parent.type))) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
      // 如果没有子元素，那么默认添加一个
      if (node.children.length == 0) {
        Transforms.insertNodes(
          editor,
          {
            type: CET.DIV,
            children: [{ text: "" }],
          },
          {
            at: [...path, 0],
          }
        );
        return true;
      }
    }
  },
  arrowKeyEvent(editor: EditorType, key: "ArrowUp" | "ArrowDown") {
    if (editor.selection && !Range.isCollapsed(editor.selection)) return false;
    const [td] = Editor.nodes(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    const table = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTable(n);
      },
    });
    const { selection } = editor;
    if (!td || !selection || !table) return false;
    const tr = utils.getParent(editor, td[1]);
    if (!tr) return false;
    const trParent = utils.getParent(editor, tr[1]);
    if (!trParent) return false;

    switch (key) {
      case "ArrowUp": {
        // 如果当前光标在第一行，使用原生行为
        if (_.last(tr[1]) == 0) return false;

        // 如果光标不在当前td的第一个文本域里，那么使用原生的行为
        const [, firstChildPath] = Editor.first(editor, td[1]);
        if (!Path.equals(firstChildPath, selection.anchor.path)) return false;

        // 找到上一行
        const preTr = Editor.previous(editor, { at: tr[1] });
        if (!preTr) return false;
        // 找到上一行对应的td
        const [, preTdPath] = utils.getNodeByPath(editor, [
          ...preTr[1],
          _.last(td[1]) || 0,
        ]);

        // 将光标移动到目标td的结尾
        const preTdLastText = Editor.last(editor, preTdPath);
        Transforms.select(editor, Editor.end(editor, preTdLastText[1]));
        return true;
      }
      case "ArrowDown": {
        // 如果当前光标在最后一行，使用原生行为
        if (_.last(tr[1]) == trParent[0].children.length - 1) return false;

        // 如果光标不在当前td的最后一个文本域里，那么使用原生的行为
        const [, lastChildPath] = Editor.last(editor, td[1]);
        if (!Path.equals(lastChildPath, selection.anchor.path)) return false;

        // 找到下一行
        const nextTr = Editor.next(editor, { at: tr[1] });
        if (!nextTr) return false;
        // 找到下一行对应的td
        const [, nextTdPath] = utils.getNodeByPath(editor, [
          ...nextTr[1],
          _.last(td[1]) || 0,
        ]);

        // 将光标移动到目标td的开头
        const nextTdFirstText = Editor.first(editor, nextTdPath);
        Transforms.select(editor, Editor.start(editor, nextTdFirstText[1]));
        return true;
      }
    }
  },
  backspaceEvent(editor: EditorType) {
    const { selection } = editor;
    if (!selection || (selection && Range.isExpanded(selection))) return;

    const td = Editor.above(editor, {
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (!td) return;

    // 如果在td的第一个文本域的第一个位置，那么阻止默认行为
    if (Point.equals(selection.anchor, Editor.start(editor, td[1]))) return;
    Editor.deleteBackward(editor);
  },
  deleteEvent(editor: EditorType) {
    const { selection } = editor;
    if (!selection || (selection && Range.isExpanded(selection))) return;

    const td = Editor.above(editor, {
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (!td) return;

    // 如果在td的最后一个文本域的最后一个位置，那么阻止默认行为
    if (Point.equals(selection.anchor, Editor.end(editor, td[1]))) return;
    Editor.deleteForward(editor);
  },
  enterEvent(editor: EditorType) {
    Editor.insertBreak(editor);
  },
  tabEvent(editor: EditorType) {
    // 找到text文本对应的第一层td
    const td = Editor.above(editor, {
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (!td) return;
    const [, nextPath] = Editor.next(editor, { at: td[1] }) || [];
    if (!nextPath) return;
    Transforms.select(editor, Editor.start(editor, nextPath));
  },
  shiftTabEvent(editor: EditorType) {
    const td = Editor.above(editor, {
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (!td) return;
    const [, prePath] = Editor.previous(editor, { at: td[1] }) || [];
    if (!prePath) return;
    Transforms.select(editor, Editor.end(editor, prePath));
  },
};
