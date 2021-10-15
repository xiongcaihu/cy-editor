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
import { insertImg } from "../comps/TooBar/funcButtons/InsertImgButton";
import { insertFile } from "../comps/TooBar/funcButtons/InsertFileButton";

export const withCyWrap = (editor: EditorType) => {
  const {
    deleteForward,
    deleteBackward,
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
        const isImg =
          node && Element.isElement(node[0]) && node[0].type === CET.IMG;
        const isFile =
          node && Element.isElement(node[0]) && node[0].type === CET.FILE;
        const isTd = node && TableLogic.isTd(node[0]);
        const isTable = node && TableLogic.isTable(node[0]);
        const properties = e.newProperties as Partial<CustomElement>;
        const oldProperties = e.properties as Partial<CustomElement>;
        if (
          (isTd &&
            (properties.selected ||
              properties.width ||
              properties.start ||
              properties.tdIsEditing ||
              oldProperties.start ||
              oldProperties.selected ||
              oldProperties.width ||
              oldProperties.tdIsEditing)) ||
          (isTable &&
            (properties.wrapperWidthWhenCreated ||
              oldProperties.wrapperWidthWhenCreated)) ||
          isImg ||
          isFile
        ) {
          HistoryEditor.withoutSaving(editor, () => {
            apply(e);
          });
          return;
        }
      }
      apply(e);
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
    // deleteFragment(direction);
  };

  editor.deleteForward = (unit) => {
    if (!editor.selection) return;

    const afterPos = Editor.after(editor, editor.selection.anchor);

    const nextTd = Editor.above(editor, {
      at: afterPos,
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });

    const nowTd = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });

    // 退格后是否即将进入其他td，包括从一个td到另一个td，以及非td元素进入td
    const isGoingToOtherTd =
      (nextTd != null && nowTd != null && !Path.equals(nowTd[1], nextTd[1])) ||
      (nextTd != null && nowTd == null);

    const dealList = (editor: EditorType) => {
      if (!editor.selection) return;

      normalizeList();

      const isInList = ListLogic.isInList(editor);

      if (isInList && isGoingToOtherTd) return true;
    };
    const dealTextWrapper = (editor: EditorType) => {
      if (!editor.selection) return;

      const isInTextWrapper = Editor.above(editor, {
        mode: "lowest",
        match(n) {
          return utils.isTextWrapper(n);
        },
      });

      if (isInTextWrapper && utils.isElementEmpty(editor, isInTextWrapper)) {
        Transforms.delete(editor, {
          at: isInTextWrapper[1],
          reverse: false,
        });
        return true;
      }

      if (isGoingToOtherTd) return true;
    };
    const dealToDoList = (editor: EditorType) => {
      if (!editor.selection) return;
      const isInTodoList = getTodoList();
      if (isInTodoList) {
        if (isGoingToOtherTd) return true;
        deleteForward(unit);
        return true;
      }
    };
    const dealCode = (editor: EditorType) => {
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
          return true;
        }
      }
    };
    const dealTable = (editor: EditorType) => {
      if (!editor.selection) return;
      const isInTable = TableLogic.isInTable(editor);

      if (isInTable && nowTd != null) {
        return Editor.isEnd(editor, editor.selection.anchor, nowTd[1]);
      }
    };

    // 函数如果不需要默认的退格行为，则返回true
    const rel = [
      dealList,
      dealCode,
      dealToDoList,
      dealTable,
      dealTextWrapper,
    ].some((func) => {
      return func(editor);
    });

    if (rel) return;

    deleteForward(unit);
  };

  editor.deleteBackward = (unit) => {
    if (!editor.selection) return;

    const isInTable = TableLogic.isInTable(editor);

    const beforePos = Editor.before(editor, editor.selection.anchor);

    const preTd = Editor.above(editor, {
      at: beforePos,
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });

    const nowTd = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });

    // 退格后是否即将进入其他td，包括从一个td到另一个td，以及非td元素进入td
    const isGoingToOtherTd =
      (preTd != null && nowTd != null && !Path.equals(nowTd[1], preTd[1])) ||
      (preTd != null && nowTd == null);

    const dealList = (editor: EditorType) => {
      if (!editor.selection) return;

      normalizeList();

      const li = Editor.above(editor, {
        mode: "lowest",
        match(n) {
          return ListLogic.isListItem(n);
        },
      });

      const isInList = ListLogic.isInList(editor);
      if (!li || !isInList) return;

      const isLiEmpty = utils.isElementEmpty(editor, li);

      const list = Editor.parent(editor, li[1]);
      const isOnlyChild = list[0].children.length === 1; // list是否只有一个li
      const isInLiFirstPos = Editor.isStart(
        editor,
        editor.selection.anchor,
        li[1]
      ); // 光标是否在li的起始位置

      if (isInLiFirstPos) {
        if (isLiEmpty && isOnlyChild) {
          Transforms.removeNodes(editor, {
            at: li[1],
          });
          // 当list中只有一个空的li元素时，如果此时在表格中，那么删除li会导致光标移动到上一个pos，此时通过.move方法，将光标再移回来
          isGoingToOtherTd && Transforms.move(editor);
          return true;
        }

        if (isLiEmpty && !isOnlyChild) {
          Transforms.removeNodes(editor, {
            at: li[1],
          });
          return true;
        }

        if (!isLiEmpty && isOnlyChild) {
          !isGoingToOtherTd && deleteBackward(unit);
          return true;
        }

        if (!isLiEmpty && !isOnlyChild) {
          !isGoingToOtherTd && deleteBackward(unit);
          return true;
        }
        return true;
      }
    };
    const dealCode = (editor: EditorType) => {
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
    };
    const dealTable = (editor: EditorType) => {
      if (!editor.selection) return;
      if (isInTable && nowTd != null) {
        return Editor.isStart(editor, editor.selection.anchor, nowTd[1]);
      }
    };
    const dealTextWrapper = (editor: EditorType) => {
      if (!editor.selection) return;

      const isInTextWrapper = Editor.above(editor, {
        mode: "lowest",
        match(n) {
          return utils.isTextWrapper(n);
        },
      });

      if (isInTextWrapper && utils.isElementEmpty(editor, isInTextWrapper)) {
        Transforms.delete(editor, {
          at: isInTextWrapper[1],
          reverse: true,
        });
        return true;
      }

      if (isGoingToOtherTd) return true;
    };
    const dealToDoList = (editor: EditorType) => {
      if (!editor.selection) return;
      const isInTodoList = getTodoList();
      if (isInTodoList) {
        const isInFirstPos = Editor.isStart(
          editor,
          editor.selection.anchor,
          isInTodoList[1]
        );
        if (isInFirstPos) {
          if (isGoingToOtherTd) {
            Transforms.removeNodes(editor, { at: isInTodoList[1] });
            Transforms.move(editor);
          } else {
            deleteBackward(unit);
          }
          return true;
        }
      }
    };

    // 函数如果不需要默认的退格行为，则返回true
    const rel = [
      dealList,
      dealCode,
      dealToDoList,
      dealTable,
      dealTextWrapper,
    ].some((func) => {
      return func(editor);
    });

    if (rel) return;

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
    return getFragment();
  };

  // 在粘贴的时候触发
  editor.insertFragment = (fragment) => {
    utils.removeRangeElement(editor);
    // Transforms.insertNodes(editor, fragment);
    utils.pasteContent(editor, fragment);
    // insertFragment(fragment);
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
    } else if (e.types.includes("Files")) {
      const files = e.files;
      insertImg(editor, files);
      insertFile(editor, files);
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
    if ([CET.IMG, CET.FILE, CET.LINK].includes(node.type)) {
      return true;
    }
    return isInline(node);
  };
  editor.isVoid = (node) => {
    if ([CET.IMG, CET.FILE, CET.CODE].includes(node.type)) {
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
