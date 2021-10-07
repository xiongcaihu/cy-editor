import { FormatPainterOutlined } from "@ant-design/icons";
import _ from "lodash";
import { useContext, useState, useRef, useEffect, useMemo } from "react";
import { Editor, Element, Path, Range, Transforms } from "slate";
import { useSlate } from "slate-react";
import { utils } from "../../../common/utils";
import { EditorContext } from "../../../RichEditor";
import { TableLogic } from "../../Table";
import { ToolBarConfig } from "../common/config";
import { StaticButton } from "../common/StaticButton";

export const CopyFormatButton: React.FC<{}> = (props) => {
  const editor = useSlate();
  const { setSavedMarks } = useContext(EditorContext);
  const [disabled, setDisabled] = useState(false);
  const ref = useRef<any>({
    isDisabled: _.debounce(() => {
      // const isNotOnlyOne = TableLogic.getSelectedTdsSize(editor) > 1;
      // const hasSelectTd = TableLogic.getSelectedTdsSize(editor) === 1;
      // setDisabled(!(editor.selection != null || (td && !isNotOnlyOne)));
      const isSelectionExpanded =
        editor.selection != null && Range.isExpanded(editor.selection);
      setDisabled(!isSelectionExpanded);
    }, ToolBarConfig.calcStatusDelay),
  });

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
          return utils.isTextWrapper(n);
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
      >
        <FormatPainterOutlined />
      </StaticButton>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);
};
