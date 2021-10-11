/* eslint-disable eqeqeq */
import { Transforms, Editor, Path, Element } from "slate";
import { CET, EditorType } from "../../common/Defines";
import { utils } from "../../common/utils";
import { ListLogic } from "../../comps/ListComp";
import { TableLogic } from "../../comps/Table";
import { TdLogic } from "../../comps/Td";

export const handleRangeCollapsed = (e: any, editor: EditorType): void => {
  const { selection } = editor;
  if (!selection) return;

  // 以下是没有选区的情况下的事件
  const elementType = utils.getFirstAboveElementType(editor);

  const getEditingTd = () => {
    return TableLogic.getEditingTd(editor);
  };

  // 如果默认事件没有被组件拦截掉，那么在这里重新定义拦截逻辑
  switch (e.key) {
    case "Tab": {
      e.preventDefault();
      if (CET.LIST_ITEM === elementType) {
        e.shiftKey
          ? ListLogic.shiftTabEvent(editor)
          : ListLogic.tabEvent(editor);
        break;
      }
      if (CET.TD === elementType) {
        e.shiftKey
          ? TableLogic.shiftTabEvent(editor)
          : TableLogic.tabEvent(editor);
        break;
      }
      // 如果是在其他元素上
      !e.shiftKey && Transforms.insertText(editor, "    ");
      break;
    }
    case "ArrowUp": {
      const td = getEditingTd();
      if (td) {
        const [text] = Editor.nodes(editor, {
          at: td[1],
          mode: "lowest",
          match(n) {
            return Editor.isBlock(editor, n);
          },
        });
        // 判断是否是第一行的td
        const isInFirstRow = td[1][td[1].length - 2] === 0;
        const isInFirstText = Path.isDescendant(selection.anchor.path, text[1]);
        if (isInFirstText) {
          if (isInFirstRow) {
            const [table] = Editor.nodes(editor, {
              at: td[1],
              match(n) {
                return TableLogic.isTable(n);
              },
            });
            if (table) {
              const prePos = Editor.before(editor, table[1]);
              prePos && Transforms.select(editor, prePos);
            }
            return;
          }
          TdLogic.findTargetTd(editor, td, "up");
          e.preventDefault();
          return;
        }
        return;
      }
      return;
    }
    case "ArrowDown": {
      const td = getEditingTd();
      if (td) {
        const [text] = Editor.nodes(editor, {
          at: td[1],
          mode: "lowest",
          reverse: true,
          match(n) {
            return Editor.isBlock(editor, n);
          },
        });
        const [tbody] = Editor.nodes(editor, {
          at: td[1],
          match(n) {
            return Element.isElement(n) && n.type === CET.TBODY;
          },
        });
        if (!tbody) return;
        const isInLastText = Path.isDescendant(selection.anchor.path, text[1]);
        const isInLastRow =
          td[1][td[1].length - 2] === tbody[0].children.length - 1;
        if (isInLastText) {
          if (isInLastRow) {
            const [table] = Editor.nodes(editor, {
              at: td[1],
              match(n) {
                return TableLogic.isTable(n);
              },
            });
            if (table) {
              const nextPos = Editor.after(editor, table[1]);
              nextPos && Transforms.select(editor, nextPos);
            }
            return;
          }
          TdLogic.findTargetTd(editor, td, "down");
          e.preventDefault();
          return;
        }
        return;
      }
      return;
    }
    case "ArrowLeft": {
      const td = getEditingTd();
      if (td && Editor.isStart(editor, selection.anchor, td[1])) {
        TdLogic.findTargetTd(editor, td, "left");
        e.preventDefault();
        return;
      }
      return;
    }
    case "ArrowRight": {
      const td = getEditingTd();
      if (td && Editor.isEnd(editor, selection.anchor, td[1])) {
        TdLogic.findTargetTd(editor, td, "right");
        e.preventDefault();
        return;
      }
      return;
    }
  }
  return;
};
