import { DeleteRowOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const DeleteRowButton = () => {
  const editor = useSlateStatic();

  const deleteRow = () => {
    TableLogic.deleteRow(editor);
  };

  return (
    <ReactButton
      title="删除行"
      mousedownFunc={() => {
        deleteRow();
      }}
      disabledCondition={utils.hasNotSelectedAnyTd}
    >
      <DeleteRowOutlined />
    </ReactButton>
  );
};
