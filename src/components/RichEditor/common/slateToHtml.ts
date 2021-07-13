import escapeHtml from "escape-html";
import _ from "lodash";
import { Element, Text, Node, Editor } from "slate";
import {
  CET,
  EditorType,
  Marks,
  CustomElement,
  CustomText,
} from "../common/Defines";

declare module "slate" {
  interface CustomTypes {
    Editor: EditorType;
    Element: CustomElement;
    Text: CustomText;
  }
}

const getStyle = (node: Node) => {
  const style: any = {};
  if (Text.isText(node) || Element.isElement(node)) {
    for (const key of Object.values(Marks)) {
      if (
        [Marks.LineThrough, Marks.Underline].includes(key) &&
        node[key] === true
      ) {
        style.textDecoration = (style.textDecoration || "") + `${key} `;
        continue;
      }
      if (key === Marks.BOLD && node[key] === true) {
        style.fontWeight = key;
        continue;
      }
      if (key === Marks.ITALIC && node[key] === true) {
        style.fontStyle = key;
        continue;
      }
      if (
        [Marks.FontSize, Marks.BGColor, Marks.Color, Marks.TextAlign].includes(
          key
        ) &&
        node[key] != null
      ) {
        style[key] = node[key];
        continue;
      }
    }
    // li
    if (node.type === CET.LIST_ITEM && node.liColor != null) {
      style.color = node.liColor;
    }
    // td
    if (node.type === CET.TD) {
      if (node.width != null) {
        style.maxWidth = style.minWidth = style.width = node.width + "px";
      }
      if (node.height != null) {
        style.height = node.height + "px";
      }
      style.padding = "4px";
    }
    // table
    if (node.type === CET.TABLE) {
      style.borderCollapse = "collapse";
    }
  }
  return _.map(style, (value, key) => {
    return (
      key.replace(/^([a-z]+)([A-Z])([a-z]+)$/g, "$1-$2$3").toLocaleLowerCase() +
      ":" +
      value
    );
  }).join(";");
};

const getAttributes = (node: Node) => {
  let attrs = ``;
  if (Element.isElement(node)) {
    if (node.colSpan) {
      attrs = attrs + `colspan=${node.colSpan} `;
    }
    if (node.rowSpan) {
      attrs = attrs + `rowspan=${node.rowSpan} `;
    }
    if (node.url) {
      attrs = attrs + `${node.type === CET.LINK ? "href" : "src"}=${node.url} `;
    }
    if (node.width) {
      attrs = attrs + `width="${node.width}px" `;
    }
    if (node.height) {
      attrs = attrs + `height="${node.height}px" `;
    }
  }
  return attrs.trim();
};

export const slateToHtml = (node: Node): string => {
  if (Editor.isEditor(node)) {
    const children = node.children.map((n) => slateToHtml(n)).join("");
    return `<html>
      <style>
      body{
        font-family: "Chinese Quote", "Segoe UI", Roboto, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial,
    sans-serif;
    font-size:14px;
    line-height: 1.5715;
    }
    *, *::before, *::after{
      box-sizing:border-box;
    }
    table{
      border-collapse: collapse;
    }
    h1,h2,h3,h4{
      margin-bottom:0;
    }
    ul,ol{
      margin-bottom:0;
    }
    td{
      overflow:hidden;
    }
      </style>
      <body>${children}</body>
    </html>`;
  }

  let style = getStyle(node);
  style = style === "" ? "" : `style="${style}"`;

  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    string = `<span ${style}>${string}</span>`;
    return string;
  }

  if (!Element.isElement(node)) return "";

  const children = node.children.map((n) => slateToHtml(n)).join("");

  const attrs = getAttributes(node);

  switch (node.type) {
    case CET.NUMBER_LIST:
      return `<ol ${attrs} ${style}>${children}</ol>`;
    case CET.NORMAL_LIST:
      return `<ul ${attrs} ${style}>${children}</ul>`;
    case CET.LIST_ITEM:
      return `<li ${attrs} ${style}>${children}</li>`;
    case CET.DIV:
      return `<div ${attrs} ${style}>${children}</div>`;
    case CET.H1:
      return `<h1 ${attrs} ${style}>${children}</h1>`;
    case CET.H2:
      return `<h2 ${attrs} ${style}>${children}</h2>`;
    case CET.H3:
      return `<h3 ${attrs} ${style}>${children}</h3>`;
    case CET.H4:
      return `<h4 ${attrs} ${style}>${children}</h4>`;
    case CET.IMG:
      return `<img ${attrs} src="${node.url}" />`;
    case CET.LINK:
      return `<a ${attrs} href="${node.url}">${children}</a>`;
    case CET.TABLE:
      return `<table border="1" ${attrs} ${style}>${children}</table>`;
    case CET.TBODY:
      return `<tbody ${attrs} ${style}>${children}</tbody>`;
    case CET.TR:
      return `<tr ${attrs} ${style}>${children}</tr>`;
    case CET.TD:
      return `<td ${attrs} ${style}>${children}</td>`;
    default:
      return children;
  }
};
