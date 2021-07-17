import { InsertRowAboveOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const InsertRowBeforeButton = () => {
  const editor = useSlateStatic();

  const insertRowBefore = () => {
    TableLogic.insertRow(editor, "before");
  };

  return (
    <ReactButton
      title="上插入行"
      mousedownFunc={() => {
        insertRowBefore();
      }}
      disabledCondition={utils.isSelectTd}
    >
      <InsertRowAboveOutlined />
    </ReactButton>
  );
};
