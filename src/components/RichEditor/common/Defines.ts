import { BaseEditor } from "slate";
import { HistoryEditor } from "slate-history";
import { Editable, ReactEditor, Slate } from "slate-react";

export enum CET {
  EDITOR = "editor",
  NUMBER_LIST = "ol",
  NORMAL_LIST = "ul",
  LIST_ITEM = "li",
  DIV = "div",
  P = "p",
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  H4 = "h4",
  IMG = "img",
  LINK = "link",
  TABLE = "table",
  TBODY = "tbody",
  TR = "tr",
  TD = "td",
}

export const TextWrappers = [CET.DIV, CET.H1, CET.H2, CET.H3, CET.H4, CET.P];
export const InLineTypes = [CET.IMG, CET.LINK];

export enum Marks {
  BOLD = "bold",
  ITALIC = "italic",
  FontSize = "fontSize",
  Underline = "underline",
  LineThrough = "line-through",
  Color = "color",
  BGColor = "backgroundColor",
  TextAlign = "textAlign",
}

export type CustomElement = {
  type: CET;
  [key: string]: any;
  url?: string; // 图片，Link组件的参数
  content?: string; // Link组件的参数
  colSpan?: number; // td属性
  rowSpan?: number; // td 属性
  width?: number; // td样式属性
  height?: number; // td样式属性
  selected?: boolean; // td是否被选中
  canTdEdit?: boolean; // td是否可以编辑
  liColor?: string; // li color
  textAlign?: "left" | "right" | "center"; // textWrapper的属性
  tdMap?: any; // 用于计算tdMap
  children: (CustomText | CustomElement)[];
};
export type CustomText = { text: string; [key: string]: any };
export type EditorType = BaseEditor & ReactEditor & HistoryEditor;

export type StateShape = Parameters<typeof Slate>[0]["value"];
export type EditorCompPropShape = {};
export type EditorCompShape = (
  props: EditorCompPropShape
) => React.ReactElement;
export type EditableProps = Parameters<typeof Editable>[0];
