import { Button, Tooltip } from "antd";
import _ from "lodash";
import { useState, useRef, useEffect, useMemo } from "react";
import { Transforms, Editor, Element } from "slate";
import { useSlate, ReactEditor } from "slate-react";
import { CypressFlagValues, EditorType, Marks } from "../../../common/Defines";
import { utils } from "../../../common/utils";
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

var isMounted = false;

export const MarkButton: React.FC<{
  title: string;
  mark?: Marks;
  cypressId?: CypressFlagValues;
}> = (props) => {
  const editor = useSlate();
  const [type, setType] = useState("text");
  const ref = useRef<any>({
    getType: _.debounce(() => {
      isMounted &&
        setType(
          props.mark && isMarkActive(editor, props.mark) ? "link" : "text"
        );
    }, ToolBarConfig.calcStatusDelay),
  });

  useEffect(() => {
    isMounted = true;
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    ref.current.getType();
  });

  const toggleMark = (mark: Marks) => {
    // 针对选中表格的情况
    const tds = TableLogic.getSelectedTds(editor);

    if (tds.length > 0) {
      ReactEditor.focus(editor);
      const firstTd = tds[0][0];
      if (!Element.isElement(firstTd)) return;
      tds.forEach((td) => {
        if (!Element.isElement(td[0])) return;
        if (firstTd[mark]) {
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
      <Tooltip
        title={props.title}
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
        getPopupContainer={(e) => {
          return utils.findParentByClassName(e, "cyEditor") || document.body;
        }}
      >
        <Button
          className="cyEditor__toolbar__button"
          type={type as any}
          onMouseDown={(e) => {
            e.preventDefault();
            props.mark && toggleMark(props.mark);
          }}
        >
          <span {...utils.insertCypressId(props, "cypressId")}>
            {props.children}
          </span>
        </Button>
      </Tooltip>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
};
