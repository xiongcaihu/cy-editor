import { InsertRowLeftOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const InsertColumnBeforeCell = () => {
  const editor = useSlateStatic();

  const insertColumnBefore = () => {
    TableLogic.insertColumn(editor, "before");
  };

  return (
    <ReactButton
      title="左插入列"
      mousedownFunc={() => {
        insertColumnBefore();
      }}
      disabledCondition={utils.hasNotSelectedAnyTd}
    >
      <InsertRowLeftOutlined />
    </ReactButton>
  );
};
