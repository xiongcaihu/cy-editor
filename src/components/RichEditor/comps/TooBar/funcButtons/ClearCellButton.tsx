import { ClearOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TdLogic } from "../../Td";
import { ReactButton } from "../common/ReactButton";

export const ClearCellButton = () => {
  const editor = useSlateStatic();

  const clearTd = () => {
    TdLogic.clearTd(editor);
  };

  return (
    <ReactButton
      title="清空单元格"
      mousedownFunc={() => {
        clearTd();
      }}
      disabledCondition={utils.isSelectTd}
    >
      <ClearOutlined />
    </ReactButton>
  );
};
