import { PictureOutlined } from "@ant-design/icons";
import { Range, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET } from "../../../common/Defines";
import { ReactButton } from "../common/ReactButton";

export const SetImgButton = () => {
  const editor = useSlateStatic();

  const insertImg = () => {
    if (editor.selection && Range.isExpanded(editor.selection)) {
      Transforms.collapse(editor, { edge: "end" });
    }
    Transforms.insertNodes(editor, {
      type: CET.IMG,
      children: [
        {
          text: "",
        },
      ],
    });
    Transforms.move(editor);
  };

  return (
    <ReactButton
      title="插入图片"
      mousedownFunc={() => {
        insertImg();
      }}
      disabledCondition={(editor) => {
        return editor.selection == null;
      }}
    >
      <PictureOutlined />
    </ReactButton>
  );
};
