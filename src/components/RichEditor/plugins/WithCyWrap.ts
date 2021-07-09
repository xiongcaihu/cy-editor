/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from "lodash";
import {
  Editor,
  Range,
  Element,
  Text,
  Transforms,
  NodeEntry,
  Path,
  Descendant,
} from "slate";
import { CET, CustomElement, EditorType, InLineTypes } from "../common/Defines";
import { utils } from "../common/utils";
import { ListLogic } from "../comps/ListComp";
import { TableLogic } from "../comps/Table";
import {
  getCopyedCells,
  getEditingTdsPath,
  getStrPathSetOfSelectedTds,
  setCopyedCells,
  setCopyedContent,
  setCopyedMaxRowAndCol,
} from "../common/globalStore";
import { htmlToSlate } from "../common/htmlToSlate";
import { jsx } from "slate-hyperscript";

export const withCyWrap = (editor: EditorType) => {
  const {
    deleteForward,
    deleteBackward,
    deleteFragment,
    getFragment,
    insertFragment,
    insertText,
    insertData,
    insertBreak,
    isInline,
    isVoid,
    normalizeNode,
    setFragmentData,
    apply,
    redo,
    undo,
  } = editor;

  // editor.undo = () => {
  //   undo();
  // };

  editor.apply = (e) => {
    // const array = JSON.parse(window.localStorage.getItem("history") || "[]");
    try {
      apply(e);
      // window.localStorage.setItem("history", JSON.stringify(array));
    } catch (error) {
      console.warn(error);
    }
  };

  editor.insertBreak = () => {
    if (!editor.selection) return;
    if (Range.isExpanded(editor.selection)) {
      utils.removeRangeElement(editor);
    } else {
      const textWrapper = utils.getParent(editor, editor.selection.anchor.path);
      if (!textWrapper[0]) return;
      const twParent = Editor.parent(editor, textWrapper[1]);

      const li = ListLogic.isListItem(twParent[0]) && twParent;
      if (li && Editor.string(editor, li[1], { voids: true }) === "") {
        Transforms.liftNodes(editor, { at: li[1] });
        return;
      }
    }
    insertBreak();
  };

  editor.deleteFragment = (direction) => {
    utils.removeRangeElement(editor);
    deleteFragment(direction);
  };

  editor.deleteForward = (unit) => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      normalizeList();

      const textWrapper = Editor.above(editor, {
        mode: "lowest",
        match(n) {
          return utils.isTextWrapper(n);
        },
      });
      if (!textWrapper) return;
      const twParent = Editor.parent(editor, textWrapper[1]);

      const td = TableLogic.isTd(twParent[0]) && twParent;

      // 如果在td的最后一个文本域的最后一个位置，那么阻止默认行为
      if (td && Editor.isEnd(editor, editor.selection.anchor, td[1])) return;

      // 如果光标的下一个位置是表格的第一个位置
      const after = Editor.after(editor, editor.selection.anchor);
      const nextTable = Editor.above(editor, {
        at: after,
        match(n) {
          return TableLogic.isTable(n);
        },
      });
      if (nextTable && after && Editor.isStart(editor, after, nextTable[1])) {
        return;
      }

      if (Editor.string(editor, textWrapper[1], { voids: true }) === "") {
        Transforms.removeNodes(editor, {
          at: textWrapper[1],
        });
        return;
      }

      deleteForward(unit);
    }
  };

  editor.deleteBackward = (unit) => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      normalizeList();

      const textWrapper = Editor.above(editor, {
        mode: "lowest",
        match(n) {
          return utils.isTextWrapper(n);
        },
      });
      if (!textWrapper) return;

      const twParent = Editor.parent(editor, textWrapper[1]);

      const td = TableLogic.isTd(twParent[0]) && twParent;
      const li = ListLogic.isListItem(twParent[0]) && twParent;

      // 如果在td的第一个文本域的第一个位置，那么阻止默认行为
      if (td && Editor.isStart(editor, editor.selection.anchor, td[1])) return;

      // 如果光标处于列表里
      if (li && Editor.isStart(editor, editor.selection.anchor, li[1])) {
        Transforms.liftNodes(editor, { at: li[1] });
        return;
      }

      // 如果光标的前一个位置刚好进入表格，那么阻止执行
      const before = Editor.before(editor, editor.selection.anchor);
      const preTable = Editor.above(editor, {
        at: before,
        match(n) {
          return TableLogic.isTable(n);
        },
      });
      if (preTable && before && Editor.isEnd(editor, before, preTable[1])) {
        return;
      }

      if (Editor.string(editor, textWrapper[1], { voids: true }) === "") {
        Transforms.removeNodes(editor, {
          at: textWrapper[1],
        });
        return;
      }

      deleteBackward(unit);
    }
  };

  editor.insertText = (e) => {
    if (editor.selection && Range.isExpanded(editor.selection)) {
      utils.removeRangeElement(editor);
    }
    insertText(e);
  };

  // 在本编辑器复制的时候触发
  // dataTransfer 说明：https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer
  editor.getFragment = () => {
    setCopyedCells(null);
    setCopyedMaxRowAndCol({ copyedAreaHeight: 0, copyedAreaWidth: 0 });
    setCopyedContent(getFragment());
    // console.log("getFragment", getFragment());
    // return [
    //   {
    //     type: CET.DIV,
    //     children: [{ text: "chenyu paste text" }],
    //   },
    // ];
    return getFragment();
  };

  // 在粘贴的时候触发
  editor.insertFragment = (fragment) => {
    utils.removeRangeElement(editor);
    Transforms.insertNodes(editor, fragment);
  };

  // 粘贴的时候首先触发的方法，在这里可以将传入的内容进行个性化处理，然后生成新的dataTransfer传递给slate
  editor.insertData = (e) => {
    // console.log("insertdata");
    // 解码application/x-slate-fragment内容
    // console.log(
    //   utils.decodeContentToSlateData(e.getData("application/x-slate-fragment"))
    // );
    // newTransfer.setData("text/plain", "plan text");
    const tds = getCopyedCells();
    if (tds) {
      const [table] = Editor.nodes(editor, {
        at: tds[0][1],
        mode: "lowest",
        match(n) {
          return TableLogic.isTable(n);
        },
      });
      if (table) {
        const newTransfer = new DataTransfer();
        newTransfer.setData(
          "application/x-slate-fragment",
          // 编码内容
          utils.encodeSlateContent([table[0] as Descendant])
        );
        insertData(newTransfer);
        return;
      }
    } else if (e.types.includes("application/x-slate-fragment")) {
      insertData(e);
    } else if (e.types.includes("text/plain")) {
      const newTransfer = new DataTransfer();
      const content = htmlToSlate(e.getData("text/plain"));
      console.log(content);
      newTransfer.setData(
        "application/x-slate-fragment",
        // 编码内容
        utils.encodeSlateContent(content)
      );
      insertData(newTransfer);
    }
  };

  const normalizeList = _.debounce(() => {
    const afterList = Editor.next(editor, {
      match(n) {
        return ListLogic.isOrderList(n);
      },
    });
    if (afterList) editor.normalizeNode(afterList);
    const beforeList = Editor.previous(editor, {
      match(n) {
        return ListLogic.isOrderList(n);
      },
    });
    if (beforeList) editor.normalizeNode(beforeList);
  }, 0);

  editor.isInline = (node) => {
    if ([CET.IMG, CET.LINK].includes(node.type)) {
      return true;
    }
    return isInline(node);
  };
  editor.isVoid = (node) => {
    if ([CET.IMG].includes(node.type)) {
      return true;
    }
    return isVoid(node);
  };

  const normalizeEditor = (nodeEntry: NodeEntry) => {
    const [node, path] = nodeEntry;

    // 如果没有子元素，那么强行添加一个
    if (editor.children.length === 0) {
      Transforms.insertNodes(editor, {
        type: CET.DIV,
        children: [{ text: "" }],
      });
      return;
    }

    // 如果一个块级元素出现在textWrapper里，那么直接删除
    if (Element.isElement(node) && Editor.isBlock(editor, node)) {
      const [parent] = utils.getParent(editor, path);
      if (utils.isTextWrapper(parent)) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }
    }

    // inline元素和void元素的前后都必须有文本节点
    if (Element.isElement(node) && InLineTypes.includes(node.type)) {
      const prePath = utils.getPath(path, "pre");
      const [preNode] = utils.getNodeByPath(editor, prePath);
      if (!Text.isText(preNode)) {
        Transforms.insertNodes(editor, { text: "" }, { at: prePath });
        return;
      }

      const nextPath = utils.getPath(path, "next");
      const [nextNode] = utils.getNodeByPath(editor, nextPath);
      if (!Text.isText(nextNode)) {
        Transforms.insertNodes(editor, { text: "" }, { at: nextPath });
        return;
      }
    }

    if (Element.isElement(node) && node.type === CET.LINK) {
      if (Editor.string(editor, path, { voids: true }) === "") {
        Transforms.removeNodes(editor, { at: path });
        return;
      }
    }

    if (TableLogic.normalizeTable(editor, nodeEntry)) return;
    if (ListLogic.normalizeList(editor, nodeEntry)) return;

    normalizeNode(nodeEntry);
  };

  editor.normalizeNode = normalizeEditor;

  return editor;
};
