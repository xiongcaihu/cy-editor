import { FontColorsOutlined } from "@ant-design/icons";
import { Transforms, Editor } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import { Marks } from "../../../common/Defines";
import { TableLogic } from "../../Table";
import { ColorPicker } from "../common/ColorPicker";

export const FontColorButton = () => {
  const editor = useSlateStatic();
  return (
    <ColorPicker
      title="字体颜色"
      onChange={(color) => {
        ReactEditor.focus(editor);
        const tds = TableLogic.getSelectedTds(editor);
        if (tds.length > 0) {
          for (const td of tds) {
            Transforms.setNodes(
              editor,
              {
                [Marks.Color]: color,
              },
              {
                at: td[1],
              }
            );
          }
          return;
        }
        if (!editor.selection) return;
        Editor.addMark(editor, Marks.Color, color);
      }}
      mark={Marks.Color}
      icon={<FontColorsOutlined />}
    ></ColorPicker>
  );
};
