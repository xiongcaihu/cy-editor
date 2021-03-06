import React, { ReactElement } from "react";
import { BaseEditor } from "slate";
import { HistoryEditor } from "slate-history";
import { Editable, ReactEditor, RenderElementProps, Slate } from "slate-react";

declare module "slate" {
  interface CustomTypes {
    Editor: EditorType;
    Element: CustomElement;
    Text: CustomText;
    Node: CustomElement | EditorType | CustomText;
  }
}

export enum CET {
  EDITOR = "editor",
  NUMBER_LIST = "ol",
  NORMAL_LIST = "ul",
  LIST_ITEM = "li",
  DIV = "div",
  Block = "block",
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
  TODOLIST = "todo",
  CHECKBOX = "checkbox",
  CODE = "code",
  FILE = "file",
}

export const TextWrappers = [CET.DIV, CET.H1, CET.H2, CET.H3, CET.H4, CET.P];
export const InLineTypes = [CET.IMG, CET.LINK, CET.CHECKBOX];

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
  url?: string; // 图片，文件，Link组件的参数
  fileName?: string; // 文件名
  id?: number; // 唯一标识，表示图片或者文件正在上传中
  border?: boolean; // img边框
  colSpan?: number; // td属性
  rowSpan?: number; // td 属性
  tdAutoWidth?: boolean; // 是否自动宽度
  width?: number; // td样式属性
  height?: number; // td样式属性
  selected?: boolean; // td是否被选中
  childrenWrapper?: "div" | "h1" | "h2" | "h3" | "h4"; // todo 里包裹文字的容器
  // canTdEdit?: boolean; // td是否可以编辑
  tdIsEditing?: boolean; // 光标是否处于该td上
  checked?: boolean; // todoList属性
  openPopModal?: boolean; // 是否打开弹窗
  wrapperWidthWhenCreated?: number; // table创建时所在的容器宽度，用于动态计算td的宽度
  defaultMode?: string; // code 专属
  defaultCode?: string; // code 专属
  textAlign?: TextAlignEnum; // textWrapper和todoListComp的属性
  tdMap?: any; // 用于计算tdMap
  children: (CustomText | CustomElement)[];
};
export type CustomText = { text: string; [key: string]: any } & Partial<{
  [key in Marks]: any;
}>;
export type EditorType = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    /**
     * 用于传递一些自定义的配置
     */
    customProps?: EditorCompPropShape;
    setFixLayoutBox?(
      attr: {
        visible: boolean;
        left?: number;
        top?: number;
      },
      children?: ReactElement<any>
    ): void; // 设置相对于视口定位的悬浮窗的隐藏和显示内容
  };

export type StateShape = Parameters<typeof Slate>[0]["value"];
export enum ToolBars {
  FontTypeButton = "FontTypeButton",
  FontSizeButton = "FontSizeButton",
  TextAlignButton = "TextAlignButton",
  CopyFormatButton = "CopyFormatButton",
  CleanFormatButton = "CleanFormatButton",
  FontColorButton = "FontColorButton",
  FontBGColorButton = "FontBGColorButton",
  FontWeightButton = "FontWeightButton",
  FontStyleButton = "FontStyleButton",
  UnderLineButton = "UnderLineButton",
  LineThroughButton = "LineThroughButton",
  ToDoListButton = "ToDoListButton",
  OrderListButton = "OrderListButton",
  NormalListButton = "NormalListButton",
  InsertTextAfterVoid = "InsertTextAfterVoid",
  InsertTextBeforeVoid = "InsertTextBeforeVoid",
  SetLinkButton = "SetLinkButton",
  InsertImgButton = "InsertImgButton",
  InsertFileButton = "InsertFileButton",
  InsertTableButton = "InsertTableButton",
  TableAutoWidthButton = "TableAutoWidthButton",
  DeleteTableButton = "DeleteTableButton",
  CopyTableButton = "CopyTableButton",
  SelectCellButton = "SelectCellButton",
  DeleteColumnButton = "DeleteColumnButton",
  DeleteRowButton = "DeleteRowButton",
  InsertColumnBeforeCell = "InsertColumnBeforeCell",
  InsertColumnAfterCell = "InsertColumnAfterCell",
  InsertRowBeforeButton = "InsertRowBeforeButton",
  InsertRowAfterButton = "InsertRowAfterButton",
  MergeCellButton = "MergeCellButton",
  SplitCellButton = "SplitCellButton",
  ClearCellButton = "ClearCellButton",
  ReadOnlyButton = "ReadOnlyButton",
  InsertCodeButton = "InsertCodeButton",
}
export type EditorCompPropShape = {
  /**
   * 初次加载的内容
   */
  content?: string;
  /**
   * 返回editor的实例
   */
  getEditor?: (editor: EditorType) => void;
  /**
   * 内部加载插件用
   */
  plugins?: {
    rule: (editor: EditorType) => EditorType;
    comp: React.FC<RenderElementProps>;
    name: string;
    button?: React.FC; // 工具条上的button
  }[];
  /**
   * 工具条上显示的button
   */
  toolbars?: (ToolBars | "divide")[];
  /**
   * 自定义上传图片函数
   */
  customUploadImg?: {
    /**
     * 验证上传的图片，返回验证通过的图片
     */
    verifyImg: (param: FileList | File[] | null) => File[];
    /**
     * 上传图片逻辑，成功后，返回图片的url，如果失败，返回null
     */
    uploadImg: (file: File) => Promise<string | null>;
  };
  /**
   * 自定义上传文件函数
   */
  customUploadFile?: {
    /**
     * 验证上传的文件，返回验证通过的图片
     */
    verifyFile: (param: FileList | File[] | null) => File[];
    /**
     * 上传文件逻辑，成功后，返回文件的url，如果失败，返回null
     */
    uploadFile: (file: File) => Promise<string | null>;
  };
};
export type EditorCompShape = (
  props: EditorCompPropShape
) => React.ReactElement;
export type EditableProps = Parameters<typeof Editable>[0];

export const CypressTestFlag = "data-cypress-id";
export enum CypressFlagValues {
  ORDER_LIST = "order_list",
  NORMALIZE_LIST = "unorder_list",
  TODO_LIST = "todo_list",
  SELECTE_TD = "select_td",
  AT_PERSON_MODAL = "atPersonModal",
  AT_PERSON_TEXT = "atPersonText",
  WRAP_FONT_COMP = "wrapFontComp",
  SET_FONT_SIZE = "setFontSize",
  SET_FONT_ALIGN = "setFontAlign",
  SET_BOLD = "setBold",
  SET_ITALIC = "setItalic",
  SET_UNDERLINE = "setUnderline",
  SET_LINETHROUGH = "setLinethrough",
  COPY_FORMAT = "copyFormat",
  CLEAN_FORMAT = "cleanFormat",
}

export enum TextAlignEnum {
  LEFT = "left",
  RIGHT = "right",
  X_CENTER = "xCenter",
  Y_CENTER = "yCenter", // 垂直居中
  XY_CENTER = "xyCenter", // 水平垂直居中
}

export const FixlayoutBoxId = "CyEditor_FixlayoutBox";

export const EditorContainerClassName = "cyEditor__content";
