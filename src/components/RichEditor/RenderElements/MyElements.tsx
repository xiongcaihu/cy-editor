import { TextWrappers, CET } from "../common/Defines";
import { TD } from "../comps/Td";
import { Table } from "../comps/Table";
import { ImgComp } from "../comps/ImgComp";
import { FileComp as File } from "../comps/FileComp";
import { LinkComp } from "../comps/LinkComp";
import { TodoListComp as TODO } from "../comps/TodoListComp";
import { CheckBoxComp } from "../comps/CheckBox";
import { RenderElementProps } from "slate-react";

export type externalCompShape = {
  comp: React.FC<RenderElementProps>;
  name: string;
};

export const MyElements: (
  props: RenderElementProps & {
    comps?: externalCompShape[];
  }
) => JSX.Element = (props) => {
  const { attributes, children, element } = props;
  const style: any = {};
  if (TextWrappers.includes(element.type) && element.textAlign)
    style.textAlign = element.textAlign;

  // 加载外部的组件
  const ExternalComp = (props.comps || []).find((comp) => {
    return element.type === comp.name;
  });

  if (ExternalComp) {
    const Comp = ExternalComp.comp;
    return <Comp {...props}></Comp>;
  }

  switch (element.type) {
    case CET.CHECKBOX:
      return <CheckBoxComp {...props} />;
    case CET.TODOLIST:
      return <TODO {...props}></TODO>;
    case CET.NUMBER_LIST:
      return <ol {...attributes}>{children}</ol>;
    case CET.NORMAL_LIST:
      return <ul {...attributes}>{children}</ul>;
    case CET.LIST_ITEM:
      return (
        <li {...attributes} style={{ color: element.liColor || "unset" }}>
          {children}
        </li>
      );
    case CET.DIV:
      return (
        <div {...attributes} style={style}>
          {children}
        </div>
      );
    case CET.H1:
      return (
        <h1 {...attributes} style={{ ...style }}>
          {children}
        </h1>
      );
    case CET.H2:
      return (
        <h2 {...attributes} style={{ ...style }}>
          {children}
        </h2>
      );
    case CET.H3:
      return (
        <h3 {...attributes} style={{ ...style }}>
          {children}
        </h3>
      );
    case CET.H4:
      return (
        <h4 {...attributes} style={{ ...style }}>
          {children}
        </h4>
      );
    case CET.IMG:
      return <ImgComp {...props}>{children}</ImgComp>;
    case CET.LINK:
      return <LinkComp {...props}></LinkComp>;
    case CET.TABLE:
      return <Table {...props}></Table>;
    case CET.TBODY:
      return <tbody {...attributes}>{children}</tbody>;
    case CET.TR:
      const otherAttr: any = {};
      if (element.shouldEmpty) {
        otherAttr.contentEditable = false;
      }
      return (
        <tr {...attributes} {...otherAttr}>
          {element.shouldEmpty ? null : children}
        </tr>
      );
    case CET.TD:
      return <TD {...props}></TD>;
    case CET.FILE:
      return <File {...props}></File>;
    default:
      return <div {...attributes}>{children}</div>;
  }
};
