import { VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Editor, Element, Path, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET } from "../../../common/Defines";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const InsertTextAfterVoid = () => {
  const editor = useSlateStatic();

  const insertDivAfterTable = () => {
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
            children: [{ text: "some text..." }],
          },
          { at: Path.next(topBlock[1]) }
        );
      }
    }
  };

  return (
    <ReactButton
      title="后插入文本"
      mousedownFunc={() => {
        insertDivAfterTable();
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
      <VerticalAlignBottomOutlined />
    </ReactButton>
  );
};
