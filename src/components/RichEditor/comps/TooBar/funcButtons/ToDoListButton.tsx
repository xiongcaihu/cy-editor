import { CheckSquareOutlined } from "@ant-design/icons";
import { Editor, Element, Text, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET, CypressFlagValues } from "../../../common/Defines";
import { utils } from "../../../common/utils";
import { ListLogic } from "../../ListComp";
import { ToDoListLogic } from "../../TodoListComp";
import { ReactButton } from "../common/ReactButton";

export const ToDoListButton = () => {
  const editor = useSlateStatic();

  const insertToDoList = () => {
    const isInToDoList = ToDoListLogic.getToDoList(editor);
    // 取消待办列表模式
    if (isInToDoList) {
      Editor.withoutNormalizing(editor, () => {
        Transforms.unwrapNodes(editor, {
          mode: "lowest",
          match(n) {
            return Element.isElement(n) && n.type === CET.TODOLIST;
          },
        });
        Transforms.wrapNodes(
          editor,
          { type: CET.DIV, children: [] },
          {
            mode: "lowest",
            match(n) {
              return Text.isText(n);
            },
          }
        );
      });
    } else {
      Editor.withoutNormalizing(editor, () => {
        const [textWrapper] = Editor.nodes(editor, {
          mode: "lowest",
          match(n) {
            return utils.isTextWrapper(n);
          },
        });
        if (textWrapper) {
          Transforms.wrapNodes(
            editor,
            {
              type: CET.TODOLIST,
              children: [],
            },
            {
              at: textWrapper[1],
            }
          );
          Transforms.unwrapNodes(editor, {
            at: [...textWrapper[1], 0],
          });
          if (utils.isElementEmpty(editor, textWrapper)) {
            Transforms.insertText(editor, "todo...", {
              at: Editor.end(editor, [...textWrapper[1]]),
            });
          }
        }
      });
    }
  };

  return (
    <ReactButton
      title="待办列表"
      mousedownFunc={() => {
        insertToDoList();
      }}
      disabledCondition={(editor) => {
        return editor.selection == null || ListLogic.isInLi(editor);
      }}
      cypressId={CypressFlagValues.TODO_LIST}
    >
      <CheckSquareOutlined />
    </ReactButton>
  );
};
