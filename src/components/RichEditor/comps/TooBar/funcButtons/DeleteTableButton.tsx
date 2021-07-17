import { DeleteOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const DeleteTableButton = () => {
  const editor = useSlateStatic();

  const deleteTable = () => {
    TableLogic.deleteTable(editor);
  };

  return (
    <ReactButton
      title="删除表格"
      mousedownFunc={() => {
        deleteTable();
      }}
      disabledCondition={utils.isSelectTd}
    >
      <DeleteOutlined />
    </ReactButton>
  );
};
