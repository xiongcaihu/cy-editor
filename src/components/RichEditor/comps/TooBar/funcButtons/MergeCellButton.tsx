import { MergeCellsOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const MergeCellButton = () => {
  const editor = useSlateStatic();

  const mergeTd = () => {
    TableLogic.mergeTd(editor);
  };

  return (
    <ReactButton
      title="合并单元格"
      mousedownFunc={() => {
        mergeTd();
      }}
      disabledCondition={utils.hasNotSelectedAnyTd}
    >
      <MergeCellsOutlined />
    </ReactButton>
  );
};
