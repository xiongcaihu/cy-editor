import { CodeOutlined } from "@ant-design/icons";
import { Editor, Path, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET } from "../../../common/Defines";
import { ReactButton } from "../common/ReactButton";

export const AddCodeBoxButton = () => {
  const editor = useSlateStatic();
  return (
    <ReactButton
      title="插入代码块"
      mousedownFunc={() => {
        if (!editor.selection) return;
        const [topBlock] = Editor.nodes(editor, {
          mode: "highest",
          match(n) {
            return !Editor.isEditor(n);
          },
        });
        if (topBlock) {
          Transforms.insertNodes(
            editor,
            {
              type: CET.CODE,
              defaultMode: "javascript",
              children: [{ text: "" }],
            },
            { at: Path.next(topBlock[1]) }
          );
        }
      }}
      disabledCondition={(editor) => {
        return editor.selection == null;
      }}
    >
      <CodeOutlined />
    </ReactButton>
  );
};
