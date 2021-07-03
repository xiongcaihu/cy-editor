/* eslint-disable eqeqeq */
import { Range } from "slate";
import { EditorType } from "../../common/Defines";
import { handleSelectedTd } from "./handleSelectedTd";
import { handleRangeCollapsed } from "./handleRangeCollapsed";
import { handleRangeExpand } from "./handleRangeExpand";
import { getStrPathSetOfSelectedTds } from "../../common/globalStore";

export const HandleKeyDownEvent = (e: any, editor: EditorType) => {
  const selectedTds = getStrPathSetOfSelectedTds();

  if (selectedTds.size > 0) {
    handleSelectedTd(e, editor);
    return;
  }

  const { selection } = editor;
  if (!selection) return;

  if (Range.isExpanded(selection)) {
    return handleRangeExpand(e, editor);
  }

  if (Range.isCollapsed(selection)) {
    return handleRangeCollapsed(e, editor);
  }
};
