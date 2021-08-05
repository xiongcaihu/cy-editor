import _ from "lodash";
import {
  Editor,
  Range,
  Element,
  Text,
  Transforms,
  NodeEntry,
  Descendant,
  Path,
} from "slate";
import { CET, CustomElement, EditorType, InLineTypes } from "../common/Defines";
import { utils } from "../common/utils";
import { ListLogic } from "../comps/ListComp";
import { TableLogic } from "../comps/Table";
import {
  getCopyedCells,
  setCopyedCells,
  setCopyedContent,
  setCopyedMaxRowAndCol,
} from "../common/globalStore";
import { htmlToSlate } from "../common/htmlToSlate";
import { HistoryEditor } from "slate-history";

export const withCyWrap = (editor: EditorType) => {
  const {
    deleteForward,
    deleteBackward,
    deleteFragment,
    getFragment,
    insertText,
    insertData,
    insertBreak,
    isInline,
    isVoid,
    normalizeNode,
    apply,
  } = editor;

  const getTodoList = () => {
    const [todo] = Editor.nodes(editor, {
      match(n) {
        return Element.isElement(n) && n.type === CET.TODOLIST;
      },
    });
    return todo;
  };

  editor.apply = (e) => {
    try {
      if (e.type === "set_node") {
        const node = Editor.node(editor, e.path);
        const isTd = node && TableLogic.isTd(node[0]);
        const isTable = node && TableLogic.isTable(node[0]);
        const properties = e.newProperties as Partial<CustomElement>;
        const oldProperties = e.properties as Partial<CustomElement>;
        if (
          (isTd &&
            (properties.selected ||
              properties.width ||
              properties.start ||
              properties.canTdEdit ||
              oldProperties.start ||
              oldProperties.selected ||
              oldProperties.width ||
              oldProperties.canTdEdit)) ||
          (isTable &&
            (properties.wrapperWidthWhenCreated ||
              oldProperties.wrapperWidthWhenCreated))
        ) {
          HistoryEditor.withoutSaving(editor, () => {
            apply(e);
          });
        } else apply(e);
      } else apply(e);
    } catch (error) {
      console.warn(error);
    }
  };

  editor.insertBreak = () => {
    if (!editor.selection) return;
    const todoList = getTodoList();
    if (todoList) {
      if (
        todoList &&
        Editor.string(editor, todoList[1], { voids: true }) === ""
      ) {
        Transforms.setNodes(editor, { type: CET.DIV }, { at: todoList[1] });
        return;
      }
      insertBreak();
      return;
    }
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
    if (!editor.selection) return;

    normalizeList();

    const li = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return ListLogic.isListItem(n);
      },
    });
    const td = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    const twWrapper = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return utils.isTextWrapper(n);
      },
    });

    const isInLi = li && (!td || li[1].length > td[1].length);

    if (
      twWrapper &&
      Editor.string(editor, twWrapper[1], { voids: true }) === ""
    ) {
      Transforms.removeNodes(editor, { at: twWrapper[1] });
      return;
    }

    // 如果光标处于列表里
    if (isInLi && li && Editor.string(editor, li[1], { voids: true }) === "") {
      Transforms.removeNodes(editor, { at: li[1] });
      return;
    }

    const afterPos = Editor.after(editor, editor.selection.anchor);
    const afterTd =
      afterPos &&
      Editor.above(editor, {
        at: afterPos,
        mode: "lowest",
        match(n) {
          return TableLogic.isTd(n);
        },
      });
    if (td && afterTd && !Path.equals(td[1], afterTd[1])) return;

    deleteForward(unit);
  };

  editor.deleteBackward = (unit) => {
    if (!editor.selection) return;

    const isCode = Editor.above(editor, {
      at: Editor.before(editor, editor.selection),
      match(n) {
        return Element.isElement(n) && n.type === CET.CODE;
      },
    });
    if (isCode) {
      Transforms.removeNodes(editor, {
        at: isCode[1],
      });
      return;
    }

    normalizeList();

    const todoList = getTodoList();
    if (todoList) {
      if (Editor.isStart(editor, editor.selection.anchor, todoList[1])) {
        Transforms.removeNodes(editor, { at: todoList[1] });
        return;
      }
      deleteBackward(unit);
      return;
    }

    const li = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return ListLogic.isListItem(n);
      },
    });
    const td = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });

    const twWrapper = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return utils.isTextWrapper(n);
      },
    });

    const isInLi = li && (!td || li[1].length > td[1].length);

    if (
      twWrapper &&
      Editor.string(editor, twWrapper[1], { voids: true }) === ""
    ) {
      Transforms.removeNodes(editor, { at: twWrapper[1] });
      return;
    }

    const beforePos = Editor.before(editor, editor.selection.anchor);

    // 如果光标处于列表里
    if (isInLi && li && Editor.string(editor, li[1], { voids: true }) === "") {
      Transforms.removeNodes(editor, { at: li[1] });
      return;
    }

    // 如果执行动作时所处的td和即将触及到的td不是同一个td，那么阻止
    const preTd = Editor.above(editor, {
      at: beforePos,
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (preTd && td && !Path.equals(preTd[1], td[1])) return;

    deleteBackward(unit);
  };

  editor.insertText = (e) => {
    if (getTodoList()) {
      insertText(e);
      return;
    }
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
    if ([CET.IMG, CET.CODE].includes(node.type)) {
      return true;
    }
    return isVoid(node);
  };

  const normalizeEditor = (nodeEntry: NodeEntry) => {
    const [node, path] = nodeEntry;

    if (Element.isElement(node) && node.type === CET.CODE) {
      if (Editor.next(editor, { at: path }) == null) {
        Transforms.insertNodes(
          editor,
          {
            type: CET.DIV,
            children: [{ text: "" }],
          },
          {
            at: Path.next(path),
          }
        );
        return;
      }
    }

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
