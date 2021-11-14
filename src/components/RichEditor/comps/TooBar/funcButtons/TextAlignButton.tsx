import { Editor, Element, Transforms } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import {
  CypressFlagValues,
  Marks,
  TextAlignEnum,
} from "../../../common/Defines";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ToDoListLogic } from "../../TodoListComp";
import { ValueSelector } from "../common/ValueSelector";

export const TextAlignButton = () => {
  const editor = useSlateStatic();
  return (
    <ValueSelector
      getValue={(editor) => {
        const td = TableLogic.getFirstSelectedTd(editor);
        if (td && Element.isElement(td[0])) {
          return td[0][Marks.TextAlign] || "左对齐";
        }

        const [node] = Editor.nodes(editor, {
          match(n) {
            return utils.isTextWrapper(n) || ToDoListLogic.isTodoList(n);
          },
        });
        if (!node) return "左对齐";
        const textAlign = Element.isElement(node[0]) && node[0].textAlign;
        return textAlign === false || textAlign == null
          ? TextAlignEnum.LEFT
          : textAlign;
      }}
      options={[
        TextAlignEnum.LEFT,
        TextAlignEnum.RIGHT,
        TextAlignEnum.X_CENTER,
      ]}
      optionLabelRender={(value) => {
        if (value === TextAlignEnum.LEFT) return "左对齐";
        if (value === TextAlignEnum.RIGHT) return "右对齐";
        if (value === TextAlignEnum.X_CENTER) return "水平居中";
        if (value === TextAlignEnum.Y_CENTER) return "垂直居中";
        if (value === TextAlignEnum.XY_CENTER) return "水平垂直居中";
        return `${value}`;
      }}
      title="对齐方式"
      cypressId={CypressFlagValues.SET_FONT_ALIGN}
      afterSelect={(value) => {
        ReactEditor.focus(editor);
        const tds = TableLogic.getSelectedTds(editor);
        if (tds.length > 0) {
          for (const td of tds) {
            Transforms.setNodes(
              editor,
              { textAlign: value },
              {
                at: td[1],
              }
            );
          }
          return;
        }
        if (!editor.selection) return;
        Transforms.setNodes(
          editor,
          { textAlign: value },
          {
            mode: "lowest",
            match(n) {
              return utils.isTextWrapper(n) || ToDoListLogic.isTodoList(n);
            },
          }
        );
      }}
    ></ValueSelector>
  );
};
