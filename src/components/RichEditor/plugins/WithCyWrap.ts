import _ from "lodash";
import {
  Editor,
  Range,
  Element,
  Text,
  Transforms,
  NodeEntry,
  Path,
} from "slate";
import { CET, CustomElement, EditorType, InLineTypes } from "../common/Defines";
import { utils } from "../common/utils";
import { ListLogic } from "../comps/ListComp";
import { TableLogic } from "../comps/Table";
import { htmlToSlate } from "../common/htmlToSlate";
import { HistoryEditor } from "slate-history";
import { insertImg } from "../comps/TooBar/funcButtons/InsertImgButton";
import { insertFile } from "../comps/TooBar/funcButtons/InsertFileButton";
import {
  setCopyedCells,
  setCopyedMaxRowAndCol,
  setCopyedContent,
  getCopyedCells,
} from "../common/globalStore";
import { ToDoListLogic } from "../comps/TodoListComp";
import { TdLogic } from "../comps/Td";

export const withCyWrap = (editor: EditorType) => {
  const {
    deleteForward,
    deleteBackward,
    insertText,
    getFragment,
    insertFragment,
    insertData,
    insertBreak,
    isInline,
    isVoid,
    normalizeNode,
    apply,
    deleteFragment,
    undo,
  } = editor;

  editor.undo = () => {
    TdLogic.deselectAllTd(editor); // 为了避免区域选择出问题
    undo();
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
  const myInsertBreak = _.throttle(() => {
    if (!editor.selection) return;
    const todoList = ToDoListLogic.getToDoList(editor);
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
  }, 50);

  editor.insertBreak = () => {
    myInsertBreak();
  };

  editor.deleteFragment = () => {
    const [hasTable] = Editor.nodes(editor, {
      match: (n) => TableLogic.isTable(n),
      mode: "highest",
    });
    if (hasTable) utils.removeRangeElement(editor);
    else deleteFragment();
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
        if (isGoingToOtherTd) {
          Transforms.removeNodes(editor, {
            hanging: true,
          });
          Transforms.move(editor);
          setTimeout(() => {
            Transforms.move(editor, { reverse: true });
          }, 0);
        } else deleteForward(unit);
        return true;
      }

      if (isGoingToOtherTd) return true;
    };
    const dealToDoList = (editor: EditorType) => {
      if (!editor.selection) return;
      const isInTodoList = ToDoListLogic.getToDoList(editor);
      if (isInTodoList) {
        if (isGoingToOtherTd) return true;
        deleteForward(unit);
        return true;
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
    const rel = [dealList, dealToDoList, dealTable, dealTextWrapper].some(
      (func) => {
        return func(editor);
      }
    );

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

      const isInList = ListLogic.isInList(editor);
      if (!isInList) return;

      normalizeList();

      const li = Editor.above(editor, {
        mode: "lowest",
        match(n) {
          return ListLogic.isListItem(n);
        },
      });
      if (!li) return;

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
          // 当list中只有一个空的li元素时，如果此时进行退格，那么就是删掉list元素，此时光标会后移
          // 如果光标后移的位置就是表格，那么出出现bug，也就是光标位于表格的前面的hanging里，如果此时再接着输入文字，可能会出错
          // 解决方案就是先move一下，再move回来，这里两次move必须在不同的任务队列里
          Transforms.move(editor);
          setTimeout(() => {
            Transforms.move(editor, { reverse: true });
            isGoingToOtherTd && Transforms.move(editor);
          }, 10);
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
        if (isGoingToOtherTd) {
          Transforms.removeNodes(editor, {
            hanging: true,
          });
          Transforms.move(editor);
          setTimeout(() => {
            Transforms.move(editor, { reverse: true });
          }, 0);
        } else deleteBackward(unit);
        return true;
      }

      if (isGoingToOtherTd) return true;
    };
    const dealToDoList = (editor: EditorType) => {
      if (!editor.selection) return;
      const isInTodoList = ToDoListLogic.getToDoList(editor);
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
            // 如果光标是文档的第一个位置，那么取消todoList组件的wrap，改为textWrapper
            if (Editor.before(editor, editor.selection) == null) {
              Editor.withoutNormalizing(editor, () => {
                Transforms.wrapNodes(
                  editor,
                  {
                    type: CET.DIV,
                    children: [],
                  },
                  {
                    at: isInTodoList[1],
                  }
                );
                Transforms.unwrapNodes(editor, {
                  at: [...isInTodoList[1], 0],
                });
              });
            } else deleteBackward(unit);
          }
          return true;
        }
      }
    };

    // 函数如果不需要默认的退格行为，则返回true
    const rel = [dealList, dealToDoList, dealTable, dealTextWrapper].some(
      (func) => {
        return func(editor);
      }
    );

    if (rel) return;

    deleteBackward(unit);
  };

  editor.insertText = (e) => {
    if (editor.selection && Range.isExpanded(editor.selection)) {
      utils.removeRangeElement(editor);
    }
    insertText(e);
  };

  // 在本编辑器复制的时候触发
  // dataTransfer 说明：https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer
  /**
   * 当document的range存在时，按ctrl+c复制时触发
   * 逻辑：当有文字选区要复制时，首先将复制的表格单元格给取消掉。
   * @returns
   */
  editor.getFragment = () => {
    setCopyedCells(null);
    setCopyedMaxRowAndCol({ copyedAreaHeight: 0, copyedAreaWidth: 0 });
    setCopyedContent(getFragment());
    return getFragment();
  };

  /**
   * 在粘贴的时候触发，只可能发生在editor被focus的时，也就是不可能会有单元格被选中的时候
   * 两种情况，
   * 一种是刚复制了单元格，然后粘贴到document的range里。如果刚复制单元格，在RichEditor.tsx中的onDOMBeforeInput中做了特殊处理
   * 一种是没复制单元格，粘贴上一次复制的range。
   * 此方法的上游触发方式为：ReactEditor.insertData
   * @param fragment
   */
  editor.insertFragment = (fragment) => {
    utils.removeRangeElement(editor);

    const copyedCells = getCopyedCells() || [];
    const copyedCellsContent = utils.filterCopyedContent(
      copyedCells.map((cell) => cell[0])
    );
    const isCopyedSelectTdContent = copyedCells.length > 0;
    const isGoingToPastInTable = TableLogic.isInTable(editor);
    const copyedContent =
      copyedCells.length > 0 ? copyedCellsContent : fragment; // 如果有选中的单元格被复制，那么优先复制该内容

    if (isGoingToPastInTable) {
      copyedContent &&
        insertFragment(_.cloneDeep(utils.filterCopyedContent(copyedContent)));
    } else {
      // 粘贴多个单元格内容到表格外
      if (isCopyedSelectTdContent) {
        // 还要考虑是否全选了表格 【进行中》。。】
        insertFragment(_.cloneDeep(copyedContent));
      } else {
        copyedContent &&
          insertFragment(_.cloneDeep(utils.filterCopyedContent(copyedContent)));
      }
    }
  };

  // 粘贴的时候首先触发的方法，在这里可以将传入的内容进行个性化处理，然后生成新的dataTransfer传递给slate
  editor.insertData = (e) => {
    // console.log("insertdata");
    // 解码application/x-slate-fragment内容
    // console.log(
    //   utils.decodeContentToSlateData(e.getData("application/x-slate-fragment"))
    // );
    // newTransfer.setData("text/plain", "plan text");
    // const tds = getCopyedCells();
    // if (tds) {
    //   const [table] = Editor.nodes(editor, {
    //     at: tds[0][1],
    //     mode: "lowest",
    //     match(n) {
    //       return TableLogic.isTable(n);
    //     },
    //   });
    //   if (table) {
    //     const newTransfer = new DataTransfer();
    //     newTransfer.setData(
    //       "application/x-slate-fragment",
    //       // 编码内容
    //       utils.encodeSlateContent([table[0] as Descendant])
    //     );
    //     insertData(newTransfer);
    //     return;
    //   }
    // } else
    if (e.types.includes("application/x-slate-fragment")) {
      insertData(e);
    } else if (e.types.includes("text/html")) {
      const newTransfer = new DataTransfer();
      const content = htmlToSlate(e.getData("text/html"));
      newTransfer.setData(
        "application/x-slate-fragment",
        // 编码内容
        utils.encodeSlateContent(content)
      );
      insertData(newTransfer);
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
      const imgs: File[] = [],
        files: File[] = [];
      Array.from(e.files).forEach((file) => {
        if (file.type.includes("image")) {
          imgs.push(file);
        } else {
          files.push(file);
        }
      });
      insertImg(editor, imgs, editor.customProps?.customUploadImg);
      insertFile(editor, files, editor.customProps?.customUploadFile);
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
    if ([CET.IMG, CET.FILE, CET.LINK, CET.CHECKBOX].includes(node.type)) {
      return true;
    }
    return isInline(node);
  };
  editor.isVoid = (node) => {
    if ([CET.IMG, CET.FILE, CET.CHECKBOX].includes(node.type)) {
      return true;
    }
    return isVoid(node);
  };

  const normalizeEditor = (nodeEntry: NodeEntry) => {
    const [node, path] = nodeEntry;

    // 文档的最后一个元素总是一个空的textWrapper
    const editorLastNode = utils.getNodeByPath(editor, [
      editor.children.length - 1,
    ]);
    const preLastNode = utils.getNodeByPath(editor, [
      editor.children.length - 2,
    ]);
    const isLastNodeNotEmpty = !(
      utils.isTextWrapper(editorLastNode[0]) &&
      utils.isElementEmpty(editor, editorLastNode as NodeEntry)
    );
    if (isLastNodeNotEmpty) {
      Transforms.insertNodes(
        editor,
        {
          type: CET.DIV,
          children: [{ text: "" }],
        },
        {
          at: [editor.children.length],
        }
      );
      return true;
    }
    const isPreLastNodeEmpty =
      utils.isTextWrapper(preLastNode[0]) &&
      utils.isElementEmpty(editor, preLastNode as NodeEntry);
    // 如果文档的倒数第二个元素也是空的，那么删除
    if (isPreLastNodeEmpty) {
      Transforms.removeNodes(editor, { at: preLastNode[1] });
      return true;
    }

    if (editor.children.length === 0) {
      // 如果没有子元素，那么强行添加一个
      Transforms.insertNodes(editor, {
        type: CET.DIV,
        children: [{ text: "" }],
      });
      return;
    }

    // 如果一个块级元素出现在textWrapper里，那么直接删除
    // if (Element.isElement(node) && Editor.isBlock(editor, node)) {
    //   const [parent] = utils.getParent(editor, path);
    //   if (utils.isTextWrapper(parent)) {
    //     Transforms.removeNodes(editor, { at: path });
    //     return;
    //   }
    // }

    // inline元素和void元素的前后都必须有文本节点
    if (Element.isElement(node) && InLineTypes.includes(node.type)) {
      const prePath = utils.getPath(path, "pre");
      const [preNode] = utils.getNodeByPath(editor, prePath);
      if (preNode && !Text.isText(preNode)) {
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
    if (ToDoListLogic.normalizeToDoList(editor, nodeEntry)) return;

    normalizeNode(nodeEntry);
  };

  editor.normalizeNode = normalizeEditor;

  return editor;
};
