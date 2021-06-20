/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { useCallback, useEffect, useState } from "react";
import {
  createEditor,
  Transforms,
  Range,
  Text,
  Point,
  Element,
  Editor,
  Node,
  NodeEntry,
} from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import "./RichEditor.css";

import _ from "lodash";
import {
  EditorType,
  CustomElement,
  CustomText,
  CET,
  EditableProps,
  TextWrappers,
  InLineTypes,
  EditorCompShape,
  StateShape,
} from "./common/Defines";
import { ListLogic } from "./comps/ListComp";
import { TableLogic } from "./comps/Table";
import { utils } from "./common/utils";
import { ToolBar } from "./comps/ToolBar";
import { TD } from "./comps/Td";
import { Table } from "./comps/Table";
import { ImgComp } from "./comps/ImgComp";
import { LinkComp } from "./comps/LinkComp";
import { Path } from "slate";

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
    getFragment,
    insertFragment,
    deleteBackward,
    isInline,
    isVoid,
    insertText,
    insertData,
    normalizeNode,
    setFragmentData,
  } = editor;

  // 在本编辑器复制的时候触发
  // dataTransfer 说明：https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer
  editor.getFragment = () => {
    console.log("getFragment", getFragment());
    return [
      {
        type: CET.DIV,
        children: [{ text: "chenyu paste text" }],
      },
    ];
  };

  editor.insertText = (e) => {
    console.log("insert text", e);
    utils.removeRangeElement(editor);
    insertText(e);
  };

  // 在粘贴的时候触发
  editor.insertFragment = (fragment) => {
    console.log("insertFragment", fragment);
    utils.removeRangeElement(editor);
    insertFragment(fragment);
  };

  // 粘贴的时候首先触发的方法，在这里可以将传入的内容进行个性化处理，然后生成新的dataTransfer传递给slate
  editor.insertData = (e) => {
    console.log("insertdata");
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

  editor.deleteForward = (unit) => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const textWrapper = utils.getParent(editor, editor.selection.anchor.path);
      if (!textWrapper) return;
      const td = Editor.above(editor, {
        match(n) {
          return TableLogic.isTd(n);
        },
      });

      // 如果在td的最后一个文本域的最后一个位置，那么阻止默认行为
      if (
        td &&
        Point.equals(editor.selection.anchor, Editor.end(editor, td[1]))
      )
        return;

      if (Editor.string(editor, textWrapper[1], { voids: true }) == "") {
        Transforms.removeNodes(editor, {
          at: textWrapper[1],
        });
        return;
      }

      // 如果光标的下一个位置就是表格，那么阻止执行
      const after = Editor.after(editor, editor.selection.anchor);
      const isBeforeTable = Editor.above(editor, {
        at: after,
        match(n, p) {
          return (
            TableLogic.isTable(n) &&
            editor.selection != null &&
            Path.isAfter(p, editor.selection?.anchor.path)
          );
        },
      });

      if (isBeforeTable) {
        return;
      }
      deleteForward(unit);
    }
  };

  editor.deleteBackward = (unit) => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const textWrapper = utils.getParent(editor, editor.selection.anchor.path);
      if (!textWrapper) return;
      const td = Editor.above(editor, {
        match(n) {
          return TableLogic.isTd(n);
        },
      });

      // 如果在td的第一个文本域的第一个位置，那么阻止默认行为
      if (
        td &&
        Point.equals(editor.selection.anchor, Editor.start(editor, td[1]))
      )
        return;

      if (Editor.string(editor, textWrapper[1], { voids: true }) == "") {
        Transforms.removeNodes(editor, {
          at: textWrapper[1],
        });
        return;
      }

      // 如果光标的上一个位置就是表格，那么阻止执行
      const before = Editor.before(editor, editor.selection.anchor);
      const isAfterTable = Editor.above(editor, {
        at: before,
        match(n, p) {
          return (
            TableLogic.isTable(n) &&
            editor.selection != null &&
            Path.isBefore(p, editor.selection?.anchor.path)
          );
        },
      });

      // 如果在表格内部
      if (isAfterTable) {
        return;
      }
      deleteBackward(unit);
    }
  };

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

    if (Element.isElement(node) && TextWrappers.includes(node.type)) {
      // 如果有相邻的两个空的文字，那么删除下一个
      // const [preTextWrapper, preP] = utils.getNodeByPath(
      //   editor,
      //   utils.getPath(path, "pre")
      // );
      // if (
      //   Element.isElement(preTextWrapper) &&
      //   TextWrappers.includes(preTextWrapper.type) &&
      //   Editor.string(editor, preP).length == 0 &&
      //   Editor.string(editor, path).length == 0
      // ) {
      //   Transforms.removeNodes(editor, { at: path });
      //   return;
      // }

      // const [nextTextWrapper, nextP] = utils.getNodeByPath(
      //   editor,
      //   utils.getPath(path, "next")
      // );
      // if (
      //   Element.isElement(nextTextWrapper) &&
      //   TextWrappers.includes(nextTextWrapper.type) &&
      //   Editor.string(editor, nextP).length == 0 &&
      //   Editor.string(editor, path).length == 0
      // ) {
      //   Transforms.removeNodes(editor, { at: nextP });
      //   return;
      // }

      // 如果textWrapper里又有block元素，则删除
      for (const [child, childP] of Node.children(editor, path, {
        reverse: true,
      })) {
        if (Editor.isBlock(editor, child)) {
          Transforms.removeNodes(editor, { at: childP });
          return;
        }
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

const EditorComp: EditorCompShape = () => {
  /**
   * 解决live refresh问题的链接
   * https://github.com/ianstormtaylor/slate/issues/4081
   */
  const [editor] = useState(withCyWrap(withHistory(withReact(createEditor()))));
  const [value, setValue] = useState<StateShape>(ListLogic.model);

  const renderElement: EditableProps["renderElement"] = useCallback((props) => {
    const { attributes, children, element } = props;
    switch (element.type) {
      case CET.NUMBER_LIST:
        return <ol {...attributes}>{children}</ol>;
      case CET.NORMAL_LIST:
        return <ul {...attributes}>{children}</ul>;
      case CET.LIST_ITEM:
        return <li {...attributes}>{children}</li>;
      case CET.DIV:
        return <div {...attributes}>{children}</div>;
      case CET.H1:
        return <h1 {...attributes}>{children}</h1>;
      case CET.IMG:
        return <ImgComp {...props}>{children}</ImgComp>;
      case CET.LINK:
        return <LinkComp {...props}></LinkComp>;
      case CET.TABLE:
        return <Table {...props}></Table>;
      case CET.TBODY:
        return <tbody {...attributes}>{children}</tbody>;
      case CET.TR:
        return <tr {...attributes}>{children}</tr>;
      case CET.TD:
        return <TD {...props}></TD>;
      default:
        return <div {...attributes}>{children}</div>;
    }
  }, []);

  const renderLeaf: EditableProps["renderLeaf"] = useCallback(
    ({ attributes, children, leaf }) => {
      return (
        <span
          {...attributes}
          style={{
            fontWeight: leaf.bold ? "bold" : "normal",
            fontStyle: leaf.italic ? "italic" : "normal",
          }}
        >
          {children}
        </span>
      );
    },
    []
  );

  const bindKeyDownEvent: EditableProps["onKeyDown"] = (e) => {
    let { selection } = editor;
    if (!selection) return;

    if (Range.isExpanded(selection)) {
      switch (e.key) {
        case "Backspace":
        case "Delete": {
          e.preventDefault();
          utils.removeRangeElement(editor);
          break;
        }
        // 如果在选区里按回车，只删除内容
        case "Enter": {
          e.preventDefault();
          utils.removeRangeElement(editor);
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

      if (!e.ctrlKey && (e.key.length == 1 || e.key == "Process")) {
        utils.removeRangeElement(editor);
        Transforms.collapse(editor, { edge: "start" });
        return;
      }
      return;
    }

    if (Range.isCollapsed(selection)) {
      // 以下是没有选区的情况下的事件
      const elementType = utils.getFirstAboveElementType(editor);

      // 如果默认事件没有被组件拦截掉，那么在这里重新定义拦截逻辑
      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown": {
          if (CET.TD == elementType && !e.shiftKey) {
            if (TableLogic.arrowKeyEvent(editor, e.key)) e.preventDefault();
            break;
          }
          break;
        }
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
        case "Enter": {
          e.preventDefault();
          if (CET.LIST_ITEM == elementType) {
            ListLogic.enterEvent(editor);
            break;
          }
          if (CET.TD == elementType) {
            TableLogic.enterEvent(editor);
            break;
          }
          Editor.insertBreak(editor);
          break;
        }
        case "Delete": {
          e.preventDefault();
          if (CET.TD == elementType) {
            TableLogic.deleteEvent(editor);
            break;
          }
          Editor.deleteForward(editor);
          break;
        }
        case "Backspace": {
          e.preventDefault();
          if (CET.TD == elementType) {
            TableLogic.backspaceEvent(editor);
            break;
          }
          Editor.deleteBackward(editor);
          break;
        }
      }
      return;
    }
  };

  return (
    <div className="RichEditor">
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
      >
        <ToolBar></ToolBar>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          autoFocus
          spellCheck
          onKeyDown={bindKeyDownEvent}
          onDragStart={(e) => {
            e.preventDefault();
          }}
          style={{
            marginTop: 4,
            padding: 12,
            border: "1px solid",
            overflow: "auto",
          }}
        />
      </Slate>
    </div>
  );
};

export default EditorComp;
