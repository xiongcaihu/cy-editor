import escapeHtml from "escape-html";
import { Element, Text, Node, Editor } from "slate";
import { CET, EditorType, CustomElement, CustomText } from "../common/Defines";

declare module "slate" {
  interface CustomTypes {
    Editor: EditorType;
    Element: CustomElement;
    Text: CustomText;
  }
}

export const slateToHtml = (node: Node): string => {
  if (Editor.isEditor(node)) {
    return node.children.map((n) => slateToHtml(n)).join("");
  }

  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }
    return string;
  }

  if (!Element.isElement(node)) return "";

  const children = node.children.map((n) => slateToHtml(n)).join("");

  switch (node.type) {
    case CET.NUMBER_LIST:
      return `<ol>${children}</ol>`;
    case CET.NORMAL_LIST:
      return `<ul>${children}</ul>`;
    case CET.LIST_ITEM:
      return `<li>${children}</li>`;
    case CET.DIV:
      return `<div>${children}</div>`;
    case CET.H1:
      return `<h1>${children}</h1>`;
    case CET.H2:
      return `<h2>${children}</h2>`;
    case CET.H3:
      return `<h3>${children}</h3>`;
    case CET.H4:
      return `<h4>${children}</h4>`;
    case CET.IMG:
      return `<img src="${node.url}" />`;
    case CET.LINK:
      return `<a href="${node.url}">${children}</a>`;
    case CET.TABLE:
      return `<table>${children}</table>`;
    case CET.TBODY:
      return `<tbody>${children}</tbody>`;
    case CET.TR:
      return `<tr>${children}</tr>`;
    case CET.TD:
      return `<td>${children}</td>`;
    default:
      return children;
  }
};
