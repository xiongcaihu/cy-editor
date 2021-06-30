/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createEditor,
  Transforms,
  Range,
  Text,
  Element,
  Editor,
  NodeEntry,
  Operation,
  Node,
  Path,
} from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";

import _ from "lodash";
import {
  EditorType,
  CustomElement,
  CustomText,
  CET,
  EditableProps,
  InLineTypes,
  EditorCompShape,
  StateShape,
  Marks,
  TextWrappers,
} from "./common/Defines";
import { ListLogic } from "./comps/ListComp";
import { TableLogic } from "./comps/Table";
import { utils } from "./common/utils";
import { ToolBar } from "./comps/ToolBar";
import { TD, TdLogic } from "./comps/Td";
import { Table } from "./comps/Table";
import { ImgComp } from "./comps/ImgComp";
import { LinkComp } from "./comps/LinkComp";

import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import "./RichEditor.css";

declare module "slate" {
  interface CustomTypes {
    Editor: EditorType;
    Element: CustomElement;
    Text: CustomText;
  }
}

const withCyWrap = (editor: EditorType) => {
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
      // array.push(e);
      // window.localStorage.setItem("history", JSON.stringify(array));
      // console.log(JSON.stringify(e));
    } catch (error) {
      console.warn(error);
    }
  };

  // 在本编辑器复制的时候触发
  // dataTransfer 说明：https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer
  editor.getFragment = () => {
    // console.log("getFragment", getFragment());
    return [
      {
        type: CET.DIV,
        children: [{ text: "chenyu paste text" }],
      },
    ];
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
      if (li && Editor.string(editor, li[1], { voids: true }) == "") {
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

      const textWrapper = utils.getParent(editor, editor.selection.anchor.path);
      if (!textWrapper[0]) return;
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

      if (Editor.string(editor, textWrapper[1], { voids: true }) == "") {
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

      const textWrapper = utils.getParent(editor, editor.selection.anchor.path);
      if (!utils.isTextWrapper(textWrapper[0])) return;
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

      if (Editor.string(editor, textWrapper[1], { voids: true }) == "") {
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

  // 在粘贴的时候触发
  editor.insertFragment = (fragment) => {
    // console.log("insertFragment", fragment);
    utils.removeRangeElement(editor);
    insertFragment(fragment);
  };

  // 粘贴的时候首先触发的方法，在这里可以将传入的内容进行个性化处理，然后生成新的dataTransfer传递给slate
  editor.insertData = (e) => {
    // console.log("insertdata");
    // 解码application/x-slate-fragment内容
    // console.log(
    //   utils.decodeContentToSlateData(e.getData("application/x-slate-fragment"))
    // );
    const newTransfer = new DataTransfer();
    newTransfer.setData(
      "application/x-slate-fragment",
      // 编码内容
      utils.encodeSlateContent([
        {
          type: CET.DIV,
          children: [{ text: "chenyu paste text123" }],
        },
      ])
    );
    // newTransfer.setData("text/plain", "plan text");
    return insertData(newTransfer);
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
    if ([CET.IMG, CET.LINK].includes(node.type)) {
      return true;
    }
    return isVoid(node);
  };

  const normalizeEditor = (nodeEntry: NodeEntry) => {
    const [node, path] = nodeEntry;

    // 如果没有子元素，那么强行添加一个
    if (editor.children.length == 0) {
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

    if (TableLogic.normalizeTable(editor, nodeEntry)) return;
    if (ListLogic.normalizeList(editor, nodeEntry)) return;

    normalizeNode(nodeEntry);
  };

  editor.normalizeNode = normalizeEditor;

  return editor;
};

const MyElements: EditableProps["renderElement"] = (props) => {
  const { attributes, children, element } = props;
  const style: any = {};
  if (TextWrappers.includes(element.type) && element.textAlign)
    style.textAlign = element.textAlign;

  switch (element.type) {
    case CET.NUMBER_LIST:
      return <ol {...attributes}>{children}</ol>;
    case CET.NORMAL_LIST:
      return <ul {...attributes}>{children}</ul>;
    case CET.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    case CET.DIV:
      return (
        <div {...attributes} style={style}>
          {children}
        </div>
      );
    case CET.H1:
      return (
        <h1 {...attributes} style={style}>
          {children}
        </h1>
      );
    case CET.H2:
      return (
        <h2 {...attributes} style={style}>
          {children}
        </h2>
      );
    case CET.H3:
      return (
        <h3 {...attributes} style={style}>
          {children}
        </h3>
      );
    case CET.H4:
      return (
        <h4 {...attributes} style={style}>
          {children}
        </h4>
      );
    case CET.IMG:
      return <ImgComp {...props}>{children}</ImgComp>;
    case CET.LINK:
      return <LinkComp {...props}></LinkComp>;
    case CET.TABLE:
      return <Table {...props}></Table>;
    case CET.TBODY:
      return <tbody {...attributes}>{children}</tbody>;
    case CET.TR:
      const otherAttr: any = {};
      if (element.shouldEmpty) {
        otherAttr.contentEditable = false;
      }
      return (
        <tr {...attributes} {...otherAttr}>
          {element.shouldEmpty ? null : children}
        </tr>
      );
    case CET.TD:
      return <TD {...props}></TD>;
    default:
      return <div {...attributes}>{children}</div>;
  }
};

const EditorComp: EditorCompShape = () => {
  /**
   * 解决live refresh问题的链接
   * https://github.com/ianstormtaylor/slate/issues/4081
   */
  const [editor] = useState(withCyWrap(withHistory(withReact(createEditor()))));
  // const [editor] = useState(withCyWrap(withReact(createEditor())));
  const [value, setValue] = useState<StateShape>(TableLogic.testModel);
  const ref = useRef<{
    preUndos: Operation[][];
  }>({
    preUndos: [],
  });

  useEffect(() => {
    window.localStorage.removeItem("history");

    // setTimeout(() => {
    //   unitTest(editor);
    // }, 100);
  }, []);

  // useEffect(() => {
  //   // console.log(ref.current.preUndos);
  //   // console.log(editor.history.undos);
  //   ref.current.preUndos = _.clone(editor.history.undos);
  // }, [editor.history.undos.length]);

  const renderElement: EditableProps["renderElement"] = useCallback(
    (props) => <MyElements {...props}></MyElements>,
    []
  );

  const renderLeaf: EditableProps["renderLeaf"] = useCallback(
    ({ attributes, children, leaf }) => {
      const style: any = {};
      if (leaf[Marks.BOLD]) style.fontWeight = "bold";
      if (leaf[Marks.ITALIC]) style.fontStyle = "italic";
      if (leaf[Marks.FontSize]) style.fontSize = leaf.fontSize;
      if (leaf[Marks.Underline] || leaf[Marks.LineThrough])
        style.textDecoration = `${leaf[Marks.Underline] ? "underline" : ""} ${
          leaf[Marks.LineThrough] ? "line-through" : ""
        }`;
      if (leaf[Marks.Color]) style.color = leaf[Marks.Color];
      if (leaf[Marks.BGColor]) style.backgroundColor = leaf[Marks.BGColor];

      return (
        <span {...attributes} style={style}>
          {children}
        </span>
      );
    },
    []
  );

  const MyToolBar = useMemo(() => {
    return <ToolBar></ToolBar>;
  }, []);

  const bindKeyDownEvent: EditableProps["onKeyDown"] = (e) => {
    const { selection } = editor;
    if (!selection) {
      // 当没有选区的时候，查看是否已经选中表格
      const [td, isNotOnlyOneTd] = Editor.nodes(editor, {
        at: [],
        match(n) {
          return TableLogic.isSelectedTd(n);
        },
      });
      if (!td) return;
      switch (e.key) {
        case "Delete":
        case "Backspace":
          TdLogic.clearTd(editor);
          return;
        case "Tab":
          e.preventDefault();
          if (isNotOnlyOneTd) return;
          TdLogic.findTargetTd(editor, td, e.shiftKey ? "left" : "right");
          return;
        case "Escape":
          e.preventDefault();
          TdLogic.deselectAllTd(editor);
          return;
        // 直接全选选中的td的内容，进入编辑状态
        case " ":
        case "Enter":
          e.preventDefault();
          if (isNotOnlyOneTd) return;
          TdLogic.editTd(editor, td);
          return;
        case "ArrowUp":
          e.preventDefault();
          if (isNotOnlyOneTd) return;
          TdLogic.findTargetTd(editor, td, "up");
          return;
        case "ArrowDown":
          e.preventDefault();
          if (isNotOnlyOneTd) return;
          TdLogic.findTargetTd(editor, td, "down");
          return;
        case "ArrowLeft":
          e.preventDefault();
          if (isNotOnlyOneTd) return;
          TdLogic.findTargetTd(editor, td, "left");
          return;
        case "ArrowRight":
          e.preventDefault();
          if (isNotOnlyOneTd) return;
          TdLogic.findTargetTd(editor, td, "right");
          return;
      }
      if (!e.ctrlKey && (e.key.length == 1 || e.key == "Process")) {
        if (isNotOnlyOneTd) return;
        TdLogic.clearTd(editor);
        TdLogic.editTd(editor, td);
      }
      return;
    }

    if (Range.isExpanded(selection)) {
      switch (e.key) {
        case "Escape": {
          const [td, isNotOnlyOne] = Editor.nodes(editor, {
            at: selection,
            match(n) {
              return TableLogic.isTd(n) && n.canTdEdit == true;
            },
          });
          if (!td || isNotOnlyOne) break;
          TdLogic.chooseTd(editor, td);
          break;
        }
        case "Tab": {
          e.preventDefault();

          for (const [n, p] of Editor.nodes(editor, {
            at: selection,
            reverse: true,
            universal: true,
            match(n) {
              return utils.isTextWrapper(n);
            },
          })) {
            const [parent, pp] = utils.getParent(editor, p);
            if (!parent) continue;
            if (ListLogic.isListItem(parent)) {
              !e.shiftKey
                ? ListLogic.indentLi(editor, [parent, pp])
                : ListLogic.liftLi(editor, [parent, pp]);
            }
          }
          break;
        }
      }
      return;
    }

    if (Range.isCollapsed(selection)) {
      // 以下是没有选区的情况下的事件
      const elementType = utils.getFirstAboveElementType(editor);

      // 如果默认事件没有被组件拦截掉，那么在这里重新定义拦截逻辑
      switch (e.key) {
        case "Tab": {
          e.preventDefault();
          if (CET.LIST_ITEM == elementType) {
            e.shiftKey
              ? ListLogic.shiftTabEvent(editor)
              : ListLogic.tabEvent(editor);
            break;
          }
          if (CET.TD == elementType) {
            e.shiftKey
              ? TableLogic.shiftTabEvent(editor)
              : TableLogic.tabEvent(editor);
            break;
          }
          // 如果是在其他元素上
          !e.shiftKey && Transforms.insertText(editor, "    ");
          break;
        }
        case "Escape": {
          const [td] = Editor.nodes(editor, {
            at: selection,
            match(n) {
              return TableLogic.isTd(n) && n.canTdEdit == true;
            },
          });
          if (!td) break;
          TdLogic.chooseTd(editor, td);
          break;
        }
        case "ArrowUp": {
          const [td] = Editor.nodes(editor, {
            at: [],
            mode: "lowest",
            match(n) {
              return Element.isElement(n) && n.canTdEdit == true;
            },
          });
          if (td) {
            const first = Node.child(td[0], 0);
            const cursor = Editor.parent(editor, selection.anchor);
            if (first == cursor[0]) {
              TdLogic.findTargetTd(editor, td, "up");
              Transforms.deselect(editor);
              e.preventDefault();
              return;
            }
            return;
          }
          e.preventDefault();
          return;
        }
        case "ArrowDown": {
          const [td] = Editor.nodes(editor, {
            at: [],
            match(n) {
              return Element.isElement(n) && n.canTdEdit == true;
            },
          });
          if (td) {
            const last = Node.child(td[0], td[0].children.length - 1);
            const cursor = Editor.parent(editor, selection.anchor);
            if (last == cursor[0]) {
              TdLogic.findTargetTd(editor, td, "down");
              Transforms.deselect(editor);
              e.preventDefault();
              return;
            }
            return;
          }
          e.preventDefault();
          return;
        }
        case "ArrowLeft": {
          const [td] = Editor.nodes(editor, {
            at: [],
            match(n) {
              return Element.isElement(n) && n.canTdEdit == true;
            },
          });
          if (td) {
            if (Editor.isStart(editor, selection.anchor, td[1])) {
              TdLogic.findTargetTd(editor, td, "left");
              Transforms.deselect(editor);
              e.preventDefault();
              return;
            }
            return;
          }
          e.preventDefault();
          return;
        }
        case "ArrowRight": {
          const [td] = Editor.nodes(editor, {
            at: [],
            match(n) {
              return Element.isElement(n) && n.canTdEdit == true;
            },
          });
          if (td) {
            if (Editor.isEnd(editor, selection.anchor, td[1])) {
              TdLogic.findTargetTd(editor, td, "right");
              Transforms.deselect(editor);
              e.preventDefault();
              return;
            }
            return;
          }
          e.preventDefault();
          return;
        }
      }
      return;
    }
  };

  return (
    <div className="cyEditor" style={{ position: "relative" }}>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
      >
        {MyToolBar}
        <div
          style={{
            overflow: "auto",
            height: window.screen.availHeight - 200,
            border: "1px solid",
            padding: 12,
          }}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            autoFocus
            onCompositionStart={() => {
              utils.removeRangeElement(editor);
            }}
            onKeyDown={(e) => {
              try {
                bindKeyDownEvent(e);
              } catch (error) {
                console.error(error);
              }
            }}
            onMouseDown={(e) => {
              if (!e.nativeEvent.target) return;
              // 取消所有表格的选中状态，因为表格部分已经阻止了自己的mousedown事件传递到父组件，所以只要能在这里触发的，都肯定不是在表格里
              TdLogic.deselectAllTd(editor);
            }}
            onDragStart={(e) => {
              e.preventDefault();
            }}
          />
        </div>
      </Slate>
    </div>
  );
};

export default EditorComp;
