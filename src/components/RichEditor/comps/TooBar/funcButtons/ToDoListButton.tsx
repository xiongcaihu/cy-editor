import { CheckSquareOutlined } from "@ant-design/icons";
import { Editor, Text, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET, CypressFlagValues } from "../../../common/Defines";
import { utils } from "../../../common/utils";
import { ListLogic } from "../../ListComp";
import { ToDoListLogic } from "../../TodoListComp";
import { ReactButton } from "../common/ReactButton";

export const ToDoListButton = () => {
  const editor = useSlateStatic();

  const insertToDoList = () => {
    const todos = Array.from(
      Editor.nodes(editor, {
        match: (n) => ToDoListLogic.isTodoList(n),
        reverse: true,
      })
    );
    // 如果当前选取里有todo组件，那么取消所有的todo
    if (todos.length > 0) {
      todos.forEach((todo) => {
        Editor.withoutNormalizing(editor, () => {
          Transforms.unwrapNodes(editor, {
            at: todo[1],
          });
          Transforms.wrapNodes(
            editor,
            { type: CET.DIV, children: [] },
            {
              at: todo[1],
              mode: "lowest",
              match(n) {
                return Text.isText(n);
              },
            }
          );
        });
      });
    } else {
      // 将所有选区的内容变成todo
      Editor.withoutNormalizing(editor, () => {
        const textWrappers = Array.from(
          Editor.nodes(editor, {
            mode: "lowest",
            match: (n) => utils.isTextWrapper(n),
            reverse: true,
          })
        );
        if (textWrappers.length > 0) {
          textWrappers.forEach((textWrapper) => {
            Transforms.wrapNodes(
              editor,
              {
                type: CET.TODOLIST,
                childrenWrapper: "div",
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
          });
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
