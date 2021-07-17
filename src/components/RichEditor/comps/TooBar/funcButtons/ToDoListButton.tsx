import { CheckSquareOutlined } from "@ant-design/icons";
import { Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET } from "../../../common/Defines";
import { ReactButton } from "../common/ReactButton";

export const ToDoListButton = () => {
  const editor = useSlateStatic();

  const insertToDoList = () => {
    Transforms.insertNodes(editor, {
      type: CET.TODOLIST,
      children: [{ text: "" }],
    });
  };

  return (
    <ReactButton
      title="待办列表"
      mousedownFunc={() => {
        insertToDoList();
      }}
      disabledCondition={(editor) => {
        return editor.selection == null;
      }}
    >
      <CheckSquareOutlined />
    </ReactButton>
  );
};
