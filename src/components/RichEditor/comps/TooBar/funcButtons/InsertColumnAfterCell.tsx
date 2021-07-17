import { InsertRowRightOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const InsertColumnAfterCell = () => {
  const editor = useSlateStatic();

  const insertColumnAfter = () => {
    TableLogic.insertColumn(editor, "after");
  };

  return (
    <ReactButton
      title="右插入列"
      mousedownFunc={() => {
        insertColumnAfter();
      }}
      disabledCondition={utils.isSelectTd}
    >
      <InsertRowRightOutlined />
    </ReactButton>
  );
};
