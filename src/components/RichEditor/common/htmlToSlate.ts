import { jsx } from "slate-hyperscript";
import { CET, Marks } from "./Defines";

const deserialize = (el: any): any => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  }

  const nodeStyle: Partial<
    {
      [key in Marks]: any;
    } & {
      width: number;
      height: number;
    }
  > = {};
  el.style?.cssText
    ?.split(";")
    // eslint-disable-next-line array-callback-return
    .forEach((style: string) => {
      const [key, value] = style.split(":");
      if (!key) return null;
      const changeKey = key
        .trim()
        .replace(/^([a-z]+)-([a-z])([a-z]+)$/gi, ($0, $1, $2, $3) => {
          return $1 + $2.toUpperCase() + $3;
        });
      const changeValue = value.trim();
      if (changeKey === "textDecoration") {
        if (changeValue.includes("underline")) {
          nodeStyle[Marks.Underline] = true;
        }
        if (changeValue.includes("line-through")) {
          nodeStyle[Marks.LineThrough] = true;
        }
      } else if (changeValue === "bold") {
        nodeStyle[Marks.BOLD] = true;
      } else if (changeValue === "italic") {
        nodeStyle[Marks.ITALIC] = true;
      } else if (Object.values(Marks).includes(changeKey as Marks)) {
        nodeStyle[changeKey as Marks] = changeValue;
      }

      if (changeKey === "width") {
        nodeStyle.width = parseInt(changeValue);
      }
      if (changeKey === "height") {
        nodeStyle.height = parseInt(changeValue);
      }
    });

  let children = Array.from(el.childNodes).map(deserialize);

  if (children.length === 0) {
    children = [{ text: "" }];
  }
  switch (el.nodeName) {
    case "BR":
      return "\n";
    case "BODY":
      return jsx("fragment", {}, children);
    case "P":
    case "DIV": {
      const isTextWrapper = (Array.from(el?.childNodes) || []).every(
        (node: any) => node.nodeType === 3
      );
      return jsx(
        "element",
        { type: isTextWrapper ? CET.DIV : CET.Block, ...nodeStyle },
        children
      );
    }
    case "H1":
      return jsx("element", { type: CET.H1, ...nodeStyle }, children);
    case "H2":
      return jsx("element", { type: CET.H2, ...nodeStyle }, children);
    case "H3":
      return jsx("element", { type: CET.H3, ...nodeStyle }, children);
    case "H4":
      return jsx("element", { type: CET.H4, ...nodeStyle }, children);
    case "A":
      return jsx(
        "element",
        { type: CET.LINK, url: el.getAttribute("href"), ...nodeStyle },
        children
      );
    case "IMG":
      return jsx(
        "element",
        { type: CET.IMG, url: el.getAttribute("src"), ...nodeStyle },
        children
      );
    case "UL":
      return jsx("element", { type: CET.NORMAL_LIST, ...nodeStyle }, children);
    case "OL":
      return jsx("element", { type: CET.NUMBER_LIST, ...nodeStyle }, children);
    case "LI":
      return jsx("element", { type: CET.LIST_ITEM, ...nodeStyle }, children);
    case "TABLE":
      return jsx("element", { type: CET.TABLE, ...nodeStyle }, children);
    case "TBODY":
      return jsx("element", { type: CET.TBODY, ...nodeStyle }, children);
    case "TR":
      return jsx("element", { type: CET.TR, ...nodeStyle }, children);
    case "TD":
      return jsx(
        "element",
        {
          type: CET.TD,
          ...nodeStyle,
          rowSpan: el.getAttribute("rowspan") || 1,
          colSpan: el.getAttribute("colspan") || 1,
        },
        children
      );
    default:
      return el.textContent;
  }
};

export const htmlToSlate = (html: string): any => {
  // 去掉标签之间的空格和回车等其他符号
  const document = new DOMParser().parseFromString(html, "text/html");
  return deserialize(document.body);
};
