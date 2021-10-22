import { UnorderedListOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { CET, CypressFlagValues } from "../../../common/Defines";
import { ListLogic } from "../../ListComp";
import { ToDoListLogic } from "../../TodoListComp";
import { ReactButton } from "../common/ReactButton";

export const NormalListButton = () => {
  const editor = useSlateStatic();

  const setNormalList = () => {
    ListLogic.toggleList(editor, CET.NORMAL_LIST);
  };

  return (
    <ReactButton
      title="无序列表"
      mousedownFunc={() => {
        setNormalList();
      }}
      disabledCondition={(editor) => {
        return editor.selection == null || ToDoListLogic.isInToDoList(editor);
      }}
      cypressId={CypressFlagValues.NORMALIZE_LIST}
    >
      <UnorderedListOutlined />
    </ReactButton>
  );
};
