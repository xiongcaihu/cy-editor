import { FormatPainterOutlined } from "@ant-design/icons";
import _ from "lodash";
import { useContext, useState, useRef, useEffect, useMemo } from "react";
import { Editor, Element, Range } from "slate";
import { useSlate } from "slate-react";
import { CypressFlagValues } from "../../../common/Defines";
import { utils } from "../../../common/utils";
import { EditorContext } from "../../../RichEditor";
import { TableLogic } from "../../Table";
import { ToDoListLogic } from "../../TodoListComp";
import { ToolBarConfig } from "../common/config";
import { StaticButton } from "../common/StaticButton";

var isMounted = false;

export const CopyFormatButton: React.FC<{}> = (props) => {
  const editor = useSlate();
  const { setSavedMarks } = useContext(EditorContext);
  const [disabled, setDisabled] = useState(false);
  const ref = useRef<any>({
    isDisabled: _.debounce(() => {
      const hasSelectSingleTd = TableLogic.getSelectedTdsSize(editor) === 1;
      const isSelectionExpanded =
        editor.selection != null && Range.isExpanded(editor.selection);
      // 允许格式刷的条件：只选择了单个单元格或者有文字选择区域
      isMounted && setDisabled(!(hasSelectSingleTd || isSelectionExpanded));
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
    ref.current.isDisabled();
  });

  const copyMark = () => {
    try {
      const isNotOnlyOne = TableLogic.getSelectedTdsSize(editor) > 1;
      const td = TableLogic.getFirstSelectedTd(editor);
      if (td && !isNotOnlyOne && Element.isElement(td[0])) {
        setSavedMarks(td[0] || null);
        return;
      }
      if (!editor.selection) return null;
      const marks = Editor.marks(editor);
      const textWrapper = Editor.above(editor, {
        mode: "lowest",
        match(n) {
          return utils.isTextWrapper(n) || ToDoListLogic.isTodoList(n);
        },
      });
      if (textWrapper) setSavedMarks({ ...marks, ...textWrapper[0] } || null);
      else setSavedMarks(marks || null);
    } catch (error) {
      console.warn(error);
    }
  };
  return useMemo(() => {
    return (
      <StaticButton
        title="格式刷"
        disabled={disabled}
        mousedownFunc={() => {
          copyMark();
        }}
        cypressId={CypressFlagValues.COPY_FORMAT}
      >
        <FormatPainterOutlined />
      </StaticButton>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);
};
