import { CodeOutlined } from "@ant-design/icons";
import { Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET } from "../../../common/Defines";
import { ReactButton } from "../common/ReactButton";

export const AddCodeBoxButton = () => {
  const editor = useSlateStatic();
  return (
    <ReactButton
      title="插入代码块"
      mousedownFunc={() => {
        Transforms.insertNodes(editor, {
          type: CET.CODE,
          children: [{ text: "" }],
        });
      }}
      disabledCondition={(editor) => {
        return editor.selection == null;
      }}
    >
      <CodeOutlined />
    </ReactButton>
  );
};
