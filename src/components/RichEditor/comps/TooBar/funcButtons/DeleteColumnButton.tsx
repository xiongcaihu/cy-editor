import { DeleteColumnOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const DeleteColumnButton = () => {
  const editor = useSlateStatic();

  const deleteColumn = () => {
    TableLogic.deleteColumn(editor);
  };

  return (
    <ReactButton
      title="删除列"
      mousedownFunc={() => {
        deleteColumn();
      }}
      disabledCondition={utils.isSelectTd}
    >
      <DeleteColumnOutlined />
    </ReactButton>
  );
};
