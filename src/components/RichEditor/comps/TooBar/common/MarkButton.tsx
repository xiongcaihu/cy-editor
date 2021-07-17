import { Button, Tooltip } from "antd";
import _ from "lodash";
import { useState, useRef, useEffect, useMemo } from "react";
import { Transforms, Editor, Element } from "slate";
import { useSlate, ReactEditor } from "slate-react";
import { EditorType, Marks } from "../../../common/Defines";
import { TableLogic } from "../../Table";
import { ToolBarConfig } from "./config";

const isMarkActive = (editor: EditorType, mark: Marks) => {
  try {
    const td = TableLogic.getFirstSelectedTd(editor);
    if (td && Element.isElement(td[0])) {
      return td[0][mark];
    }

    if (!editor.selection) return null;
    const marks = Editor.marks(editor);
    return marks?.[mark] === true ? true : false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const MarkButton: React.FC<{
  title: string;
  mark?: Marks;
}> = (props) => {
  const editor = useSlate();
  const [type, setType] = useState("text");
  const ref = useRef<any>({
    getType: _.debounce(() => {
      setType(props.mark && isMarkActive(editor, props.mark) ? "link" : "text");
    }, ToolBarConfig.calcStatusDelay),
  });

  useEffect(() => {
    ref.current.getType();
  });

  const toggleMark = (mark: Marks) => {
    // 针对选中表格的情况
    const tds = TableLogic.getSelectedTds(editor);

    if (tds.length > 0) {
      ReactEditor.focus(editor);
      tds.forEach((td) => {
        if (!Element.isElement(td[0])) return;
        if (td[0][mark]) {
          Transforms.unsetNodes(editor, [mark], { at: td[1] });
        } else {
          Transforms.setNodes(editor, { [mark]: true }, { at: td[1] });
        }
      });
      return;
    }

    if (!editor.selection) return;

    const marks = Editor.marks(editor);

    if (marks?.[mark]) {
      Editor.removeMark(editor, mark);
    } else {
      Editor.addMark(editor, mark, true);
    }
  };

  return useMemo(() => {
    return (
      <Tooltip title={props.title} mouseEnterDelay={0} mouseLeaveDelay={0}>
        <Button
          className="cyEditor__toolbar__button"
          type={type as any}
          onMouseDown={(e) => {
            e.preventDefault();
            props.mark && toggleMark(props.mark);
          }}
        >
          {props.children}
        </Button>
      </Tooltip>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
};
