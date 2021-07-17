import { SplitCellsOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const SplitCellButton = () => {
  const editor = useSlateStatic();

  const splitTd = () => {
    TableLogic.splitTd(editor);
  };

  return (
    <ReactButton
      title="拆分单元格"
      mousedownFunc={() => {
        splitTd();
      }}
      disabledCondition={utils.isSelectTd}
    >
      <SplitCellsOutlined />
    </ReactButton>
  );
};
