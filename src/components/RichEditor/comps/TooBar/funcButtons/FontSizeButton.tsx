import { Transforms, Editor, Element } from "slate";
import { useSlateStatic } from "slate-react";
import { CypressFlagValues, EditorType, Marks } from "../../../common/Defines";
import { TableLogic } from "../../Table";
import { ValueSelector } from "../common/ValueSelector";

const getMarkValue = (editor: EditorType, mark: Marks) => {
  try {
    const td = TableLogic.getFirstSelectedTd(editor);
    if (td && Element.isElement(td[0])) {
      return td[0][mark];
    }
    if (!editor.selection) return null;
    const marks = Editor.marks(editor);
    return marks?.[mark];
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const FontSizeButton = () => {
  const editor = useSlateStatic();
  return (
    <ValueSelector
      getValue={(editor) => {
        return String(getMarkValue(editor, Marks.FontSize) || 14);
      }}
      options={[12, 13, 14, 15, 16, 19, 22, 24, 29, 32, 40, 48]}
      optionLabelRender={(value) => {
        return `${value}px`;
      }}
      title="字体大小"
      cypressId={CypressFlagValues.SET_FONT_SIZE}
      afterSelect={(value) => {
        const tds = TableLogic.getSelectedTds(editor);
        if (tds.length > 0) {
          for (const td of tds) {
            Transforms.setNodes(
              editor,
              {
                [Marks.FontSize]: Number(value),
              },
              {
                at: td[1],
              }
            );
          }
          return;
        }
        if (!editor.selection) return;
        Editor.addMark(editor, Marks.FontSize, Number(value));
      }}
    ></ValueSelector>
  );
};
