import { VerticalAlignTopOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const InsertTextBeforeTable = () => {
  const editor = useSlateStatic();

  const insertDivBeforeTable = () => {
    TableLogic.insertDivBeforeTable(editor);
  };

  return (
    <ReactButton
      title="表格前插入文本"
      mousedownFunc={() => {
        insertDivBeforeTable();
      }}
      disabledCondition={utils.hasNotSelectedAnyTd}
    >
      <VerticalAlignTopOutlined />
    </ReactButton>
  );
};
