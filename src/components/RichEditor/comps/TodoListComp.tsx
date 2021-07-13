/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import { Checkbox } from "antd";
import { Transforms } from "slate";
import {
  RenderElementProps,
  ReactEditor,
  useSlateStatic,
  useReadOnly,
} from "slate-react";

export const TodoListComp: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();

  return (
    <div {...attributes}>
      <span contentEditable={false} style={{ marginRight: 12, }}>
        <Checkbox
          checked={element.checked}
          onChange={(e) => {
            Transforms.setNodes(
              editor,
              {
                checked: e.target.checked,
              },
              {
                at: ReactEditor.findPath(editor, element),
              }
            );
          }}
          disabled={readOnly}
        ></Checkbox>
      </span>
      <span>{children}</span>
    </div>
  );
};
