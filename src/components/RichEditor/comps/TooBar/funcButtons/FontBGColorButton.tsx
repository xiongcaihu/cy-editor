import { BgColorsOutlined } from "@ant-design/icons";
import { Transforms, Editor } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import { Marks } from "../../../common/Defines";
import { TableLogic } from "../../Table";
import { ColorPicker } from "../common/ColorPicker";

export const FontBGColorButton = () => {
  const editor = useSlateStatic();
  return (
    <ColorPicker
      title="背景色"
      onChange={(color) => {
        ReactEditor.focus(editor);
        const tds = TableLogic.getSelectedTds(editor);
        if (tds.length > 0) {
          for (const td of tds) {
            Transforms.setNodes(
              editor,
              {
                [Marks.BGColor]: color,
              },
              {
                at: td[1],
              }
            );
          }
          return;
        }
        if (!editor.selection) return;
        Editor.addMark(editor, Marks.BGColor, color);
      }}
      mark={Marks.BGColor}
      icon={<BgColorsOutlined />}
    ></ColorPicker>
  );
};
