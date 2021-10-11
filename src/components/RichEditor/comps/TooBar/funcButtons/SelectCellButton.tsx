import { SelectOutlined } from "@ant-design/icons";
import { Editor, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const SelectCellButton = () => {
  const editor = useSlateStatic();

  return (
    <ReactButton
      title="选中单元格"
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
