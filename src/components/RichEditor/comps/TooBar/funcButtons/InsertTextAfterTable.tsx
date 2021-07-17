import { VerticalAlignBottomOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const InsertTextAfterTable = () => {
  const editor = useSlateStatic();

  const insertDivAfterTable = () => {
    TableLogic.insertDivAfterTable(editor);
  };

  return (
    <ReactButton
      title="表格后插入文本"
      mousedownFunc={() => {
        insertDivAfterTable();
      }}
      disabledCondition={utils.isSelectTd}
    >
      <VerticalAlignBottomOutlined />
    </ReactButton>
  );
};
