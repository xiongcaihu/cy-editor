import { BaseEditor } from "slate";
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
}

export type CustomElement = {
  type: CET;
  [key: string]: any;
  url?: string; // 图片，Link组件的参数
  content?: string; // Link组件的参数
  colSpan?: number; // td属性
  children: (CustomText | CustomElement)[];
};
export type CustomText = { text: string; bold?: boolean; [key: string]: any };
export type EditorType = BaseEditor & ReactEditor;

export type StateShape = Parameters<typeof Slate>[0]["value"];
export type EditorCompPropShape = {};
export type EditorCompShape = (
  props: EditorCompPropShape
) => React.ReactElement;
export type EditableProps = Parameters<typeof Editable>[0];
