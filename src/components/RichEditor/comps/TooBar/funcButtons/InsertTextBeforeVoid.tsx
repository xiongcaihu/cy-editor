import { VerticalAlignTopOutlined } from "@ant-design/icons";
import { Editor, Element, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET } from "../../../common/Defines";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const InsertTextBeforeVoid = () => {
  const editor = useSlateStatic();

  const insertDivBeforeTable = () => {
    if (editor.selection) {
      const [topBlock] = Editor.nodes(editor, {
        mode: "highest",
        match(n) {
          return (
            !Editor.isEditor(n) &&
            (Editor.isBlock(editor, n) || Editor.isVoid(editor, n))
          );
        },
      });
      if (topBlock) {
        Transforms.insertNodes(
          editor,
          {
            type: CET.DIV,
            children: [{ text: "" }],
          },
          { at: topBlock[1] }
        );
      }
    }
  };

  return (
    <ReactButton
      title="前插入文本"
      mousedownFunc={() => {
        insertDivBeforeTable();
      }}
      disabledCondition={(editor) => {
        const isInTable = TableLogic.isInTable(editor);
        const [isInCode] = Editor.nodes(editor, {
          mode: "highest",
          match(n) {
            return Element.isElement(n) && CET.CODE === n.type;
          },
        });
        return !(isInCode || isInTable);
      }}
    >
      <VerticalAlignTopOutlined />
    </ReactButton>
  );
};
