/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import { Checkbox } from "antd";
import { Editor, Element, Node, NodeEntry, Text, Transforms } from "slate";
import {
  RenderElementProps,
  ReactEditor,
  useSlateStatic,
  useReadOnly,
} from "slate-react";
import { CET, EditorType } from "../common/Defines";

export const TodoListComp: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();

  const renderFather = () => {
    const attrs = {
      ...attributes,
      style: { textAlign: element.textAlign },
    };
    switch (element.childrenWrapper || "div") {
      case "div":
        return <div {...attrs}>{renderChild()}</div>;
      case "h1":
        return <h1 {...attrs}>{renderChild()}</h1>;
      case "h2":
        return <h2 {...attrs}>{renderChild()}</h2>;
      case "h3":
        return <h3 {...attrs}>{renderChild()}</h3>;
      case "h4":
        return <h4 {...attrs}>{renderChild()}</h4>;
    }
  };

  const renderChild = () => {
    return (
      <>
        <span contentEditable={false} style={{ marginRight: 4 }}>
          <Checkbox
            checked={element.checked}
            onChange={(e) => {
              Transforms.setNodes(
                editor,
                {
                  checked: e.target.checked,
                },
                {
                  at: ReactEditor.findPath(editor, element),
                }
              );
            }}
            disabled={readOnly}
          ></Checkbox>
        </span>
        <span>{children}</span>
      </>
    );
  };

  return renderFather();
};

export const ToDoListLogic = {
  isTodoList(node: Node) {
    return Element.isElement(node) && node.type === CET.TODOLIST;
  },
  isInToDoList(editor: EditorType) {
    return ToDoListLogic.getToDoList(editor) != null;
  },
  getToDoList(editor: EditorType) {
    return Editor.above(editor, {
      match(n) {
        return Element.isElement(n) && n.type === CET.TODOLIST;
      },
    });
  },
  normalizeToDoList(editor: EditorType, nodeEntry: NodeEntry): boolean {
    if (Element.isElement(nodeEntry[0]) && nodeEntry[0].type === CET.TODOLIST) {
      for (const [child, childP] of Node.descendants(nodeEntry[0], {
        reverse: true,
      })) {
        if (!(Text.isText(child) || Editor.isInline(editor, child))) {
          Editor.withoutNormalizing(editor, () => {
            const texts = Array.from(
              Editor.nodes(editor, {
                at: Editor.range(editor, childP),
                match(n) {
                  return Text.isText(n) || Editor.isInline(editor, n);
                },
              })
            );
            Transforms.removeNodes(editor, {
              at: [...nodeEntry[1], ...childP],
            });
            Transforms.insertNodes(
              editor,
              texts.map((t) => t[0]),
              {
                at: Editor.end(editor, nodeEntry[1]),
              }
            );
          });
          return true;
        }
      }
    }
    return false;
  },
  /**
   * 避免在todoList里按home键时，光标消失的问题
   * @param e
   * @param editor
   */
  handleKeyDown(e: KeyboardEvent, editor: EditorType) {
    const isInToDoList = ToDoListLogic.getToDoList(editor);
    if (isInToDoList && e.key === "Home" && e.shiftKey == false) {
      e.preventDefault();
      Transforms.select(editor, Editor.start(editor, isInToDoList[1]));
    }
  },
};
