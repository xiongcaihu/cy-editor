import { FolderOpenOutlined } from "@ant-design/icons";
import { ReactButton } from "../common/ReactButton";

export const InsertFileButton = () => {
  return (
    <ReactButton
      title="插入资源文件"
      mousedownFunc={() => {}}
      disabledCondition={(editor) => {
        return editor.selection == null;
      }}
    >
      <FolderOpenOutlined />
    </ReactButton>
  );
};
