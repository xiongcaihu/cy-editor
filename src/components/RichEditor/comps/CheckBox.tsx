import React from "react";
import { Checkbox } from "antd";
import { Transforms } from "slate";
import {
  RenderElementProps,
  ReactEditor,
  useSlateStatic,
  useReadOnly,
} from "slate-react";

export const CheckBoxComp: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  return (
    <div {...attributes}>
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
    </div>
  );
};
