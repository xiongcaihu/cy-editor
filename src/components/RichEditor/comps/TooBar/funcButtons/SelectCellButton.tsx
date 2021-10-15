import { SelectOutlined } from "@ant-design/icons";
import { Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const SelectCellButton = () => {
  const editor = useSlateStatic();

  return (
    <ReactButton
      title="选中单元格（鼠标移动到单元格的边缘出现十字标双击）"
      mousedownFunc={() => {
        const td = TableLogic.getEditingTd(editor);
        if (!td) return;
        Transforms.setNodes(
          editor,
          {
            start: true,
            selected: true,
          },
          {
            at: td[1],
          }
        );
        Transforms.deselect(editor);
      }}
      disabledCondition={utils.hasNotSelectedAnyTd}
    >
      <SelectOutlined />
    </ReactButton>
  );
};
