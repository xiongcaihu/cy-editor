import { CopyOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const CopyTableButton = () => {
  const editor = useSlateStatic();

  return (
    <ReactButton
      title="复制表格"
      mousedownFunc={() => {
        TableLogic.copyTable(editor);
      }}
      disabledCondition={utils.hasNotSelectedAnyTd}
    >
      <CopyOutlined />
    </ReactButton>
  );
};
