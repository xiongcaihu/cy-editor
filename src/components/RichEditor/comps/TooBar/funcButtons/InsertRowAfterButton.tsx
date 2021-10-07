import { InsertRowBelowOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const InsertRowAfterButton = () => {
  const editor = useSlateStatic();

  const insertRowAfter = () => {
    TableLogic.insertRow(editor, "after");
  };

  return (
    <ReactButton
      title="下插入行"
      mousedownFunc={() => {
        insertRowAfter();
      }}
      disabledCondition={utils.hasNotSelectedAnyTd}
    >
      <InsertRowBelowOutlined />
    </ReactButton>
  );
};
