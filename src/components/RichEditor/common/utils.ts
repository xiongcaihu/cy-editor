/* eslint-disable eqeqeq */
import {
  Element,
  Editor,
  Path,
  Text,
  Node,
  Transforms,
  Range,
  NodeEntry,
  Point,
} from "slate";
import {
  TextWrappers,
  EditorType,
  CET,
  CypressTestFlag,
  TextAlignEnum,
} from "./Defines";
import { TableLogic } from "../comps/Table";
import { jsx } from "slate-hyperscript";
import { ReactEditor } from "slate-react";
import { CSSProperties } from "react";

const deserialize: any = (el: any) => {
  // text node
  if (el.nodeType === 3) {
    return el.textContent;
    // not element node
  } else if (el.nodeType !== 1) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let children = Array.from(el.childNodes).map(deserialize);

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  switch (el.nodeName) {
    case "BODY":
      return jsx("fragment", {}, children);
    case "BR":
      return "\n";
    case "BLOCKQUOTE":
      return jsx("element", { type: "quote" }, children);
    case "P":
    case "DIV":
      return jsx("element", { type: CET.DIV }, children);
    case "A":
      return jsx(
        "element",
        {
          type: CET.LINK,
          url: el.getAttribute("href"),
          content: el.innserHTML,
        },
        children
      );
    case "IMG":
      return jsx(
        "element",
        {
          type: CET.IMG,
          url: el.getAttribute("src"),
        },
        children
      );
    case "TABLE":
      return jsx(
        "element",
        {
          type: CET.TABLE,
        },
        children
      );
    case "TBODY":
      return jsx(
        "element",
        {
          type: CET.TBODY,
        },
        children
      );
    case "TR":
      return jsx(
        "element",
        {
          type: CET.TR,
        },
        children
      );
    case "TD":
      return jsx(
        "element",
        {
          type: CET.TD,
          colSpan: el.getAttribute("colSpan"),
        },
        children
      );
    default:
      return el.textContent;
  }
};

export const utils = {
  getTextAlignStyle(
    textAlign: TextAlignEnum | null | undefined
  ): CSSProperties {
    if (!textAlign) return {};
    switch (textAlign) {
      case TextAlignEnum.LEFT:
        return {
          textAlign: "left",
        };
      case TextAlignEnum.RIGHT:
        return {
          textAlign: "right",
        };
      case TextAlignEnum.X_CENTER:
        return {
          textAlign: "center",
        };
      case TextAlignEnum.Y_CENTER:
        return {
          verticalAlign: "middle",
        };
      case TextAlignEnum.XY_CENTER:
        return {
          verticalAlign: "middle",
          textAlign: "center",
        };
      default:
        return {};
    }
  },
  getDataTransfer(nodes: Node[]) {
    const newTransfer = new DataTransfer();
    newTransfer.setData(
      "application/x-slate-fragment",
      // 编码内容
      utils.encodeSlateContent([])
    );
    return newTransfer;
  },
  /**
   * 获得光标相对文档区域原点的相对位置
   * @param editor
   * @returns
   */
  getCursorPos(editor: EditorType) {
    if (!editor.selection || Range.isExpanded(editor.selection))
      return [-1, -1];

    const { startContainer, startOffset } = ReactEditor.toDOMRange(
      editor,
      editor.selection
    );
    const cursorOffsetX = utils.calcTextWidth(
      startContainer.textContent?.slice(0, startOffset)
    );
    const parentOffset = utils.calcOffsetDistanceFromAToB(
      startContainer.parentNode as HTMLElement,
      ReactEditor.toDOMNode(editor, editor).parentElement as HTMLElement
    );
    const modalX = parentOffset.offsetLeft + cursorOffsetX,
      modalY = parentOffset.offsetTop;

    return [modalX, modalY];
  },
  /**
   * 为组件注入cypress flag，用于cypress测试
   * @param props
   * @param key
   * @returns
   */
  insertCypressId<T extends object>(props: T, key: keyof T) {
    return props[key] != null
      ? {
          [CypressTestFlag]: props[key],
        }
      : {};
  },
  calcTextWidth(text: any) {
    if (typeof text !== "string") return 0;
    const span = document.createElement("span");
    span.innerHTML = text.replace(/ /gi, "&nbsp;");
    span.style.opacity = "0.01";
    document.body.appendChild(span);
    const width = span.offsetWidth;
    span.remove();
    return width;
  },
  /**
   * 计算从A往上直到B的offsetLeft和offsetTop距离，
   * 其中A是B的子元素
   * @param A
   * @param B
   */
  calcOffsetDistanceFromAToB(A: HTMLElement, B: HTMLElement) {
    if (!B?.contains?.(A))
      return {
        offsetLeft: -999999,
        offsetTop: -999999,
      };

    let nowNode: any = A;
    let leftDistance = 0,
      topDistance = 0;
    do {
      leftDistance += nowNode.offsetLeft - (nowNode.scrollLeft || 0);
      topDistance += nowNode.offsetTop;
      nowNode = nowNode.offsetParent;
    } while (nowNode != B);
    return {
      offsetLeft: leftDistance,
      offsetTop: topDistance,
    };
  },
  /**
   * 从startDom开始往上找到与targetDom相同的dom元素，如果没找到，则返回null
   * @param startDom
   * @param targetDom
   * @returns
   */
  findParent(
    startDom: HTMLElement,
    targetDom: HTMLElement
  ): HTMLElement | null {
    let parent = startDom;
    while (parent != null && parent != targetDom) {
      parent = parent.offsetParent as HTMLElement;
    }
    return parent;
  },
  findParentByClassName(
    startDom: HTMLElement,
    className: string
  ): HTMLElement | null {
    let parent = startDom;
    while (parent != null && parent.className != className) {
      parent = parent.parentNode as HTMLElement;
    }
    return parent;
  },
  /**
   * 判断包含了void,inline,text元素后，父元素是否依然为空
   * @param editor
   * @param el
   * @returns
   */
  isElementEmpty(editor: EditorType, el: NodeEntry) {
    const isThereHasNoEmptyChild = Array.from(Node.descendants(el[0])).some(
      (childEntry) => {
        const [node, path] = childEntry;
        return (
          (Text.isText(node) && node.text.length > 0) ||
          Editor.isVoid(editor, node) ||
          Editor.isInline(
            editor,
            node || Editor.string(editor, path, { voids: true }) !== ""
          )
        );
      }
    );
    return !isThereHasNoEmptyChild;
  },
  removeAllRange() {
    window.getSelection()?.removeAllRanges();
  },
  encodeSlateContent(data: Node[]) {
    return window?.btoa(encodeURIComponent(JSON.stringify(data)));
  },
  decodeContentToSlateData(data: string) {
    return JSON.parse(decodeURIComponent(window.atob(data)));
  },
  /**
   * 对复制的区域进行转换，主要是防止在表格内复制了表格的内容再粘贴到表格
   * @param content
   * @returns
   */
  filterCopyedContent(content: Node[]) {
    const array: Node[] = [];
    content.forEach((c) => {
      if (TableLogic.isTable(c)) {
        Array.from(Node.descendants(c)).forEach((node) => {
          if (TableLogic.isTd(node[0])) {
            array.push(...node[0].children);
          }
        });
      } else if (TableLogic.isTd(c)) {
        array.push(...c.children);
      } else {
        array.push(c);
      }
    });
    return array;
  },
  /**
   * 思路：将选中区域按照表格来分开，非表格区域的可以直接用Transforms.delete进行删除，
   * 而表格区域，需要分情况讨论：
   *  如果选中区域全覆盖表格，那么直接删除表格
   *  如果选中区域部分覆盖表格，那么需要按照单元格来删除，（因为多个单元格连在一起删会破坏表格结构）
   * @param editor
   * @returns
   */
  removeRangeElement(editor: EditorType) {
    if (!editor.selection || Range.isCollapsed(editor.selection)) return;
    const originSelection = editor.selection;

    // 判断文档是否全部被选中
    const editorRange = Editor.range(editor, []);
    const inte = Range.intersection(editorRange, originSelection);
    if (inte && Range.equals(inte, editorRange)) {
      Editor.withoutNormalizing(editor, () => {
        for (const [, childP] of Node.children(editor, [], {
          reverse: true,
        })) {
          Transforms.removeNodes(editor, {
            at: childP,
            hanging: true,
            voids: true,
            mode: "highest",
          });
        }
      });
      return;
    }

    // 根据table的位置来分离Range
    const splitRange = () => {
      if (!editor.selection) return;
      let s1 = Range.start(editor.selection);
      let s2 = Range.end(editor.selection);

      const tables = Array.from(
        Editor.nodes(editor, {
          match(n) {
            return TableLogic.isTable(n);
          },
        })
      );

      const isBefore = (a: Point, b: Point) => {
        return Point.compare(a, b) == -1;
      };
      const isEqual = (a: Point, b: Point) => {
        return Point.compare(a, b) == 0;
      };

      const array = [];
      for (const table of tables) {
        const t1 = Editor.start(editor, table[1]);
        const t2 = Editor.end(editor, table[1]);
        const beforeT1 = Editor.before(editor, t1) || t1;
        const afterT2 = Editor.after(editor, t2) || t2;

        if (isBefore(s1, t1)) {
          if (isBefore(s2, t2)) {
            array.push([s1, beforeT1], [t1, s2]);
            s1 = null as any;
          } else if (isEqual(s2, t2)) {
            array.push([s1, beforeT1], [t1, t2]);
            s1 = null as any;
          } else {
            // s2>t2
            array.push([s1, beforeT1], [t1, t2]);
            s1 = afterT2;
          }
        } else if (isEqual(s1, t1)) {
          if (isBefore(s2, t2)) {
            array.push([t1, s2]);
            s1 = null as any;
          } else if (isEqual(s2, t2)) {
            array.push([t1, t2]);
            s1 = null as any;
          } else {
            // s2>t2
            array.push([t1, t2]);
            s1 = afterT2;
          }
        } else {
          // s1>t1
          if (isBefore(s2, t2)) {
            array.push([s1, s2]);
            s1 = null as any;
          } else if (isEqual(s2, t2)) {
            array.push([s1, t2]);
            s1 = null as any;
          } else {
            // s2>t2
            array.push([s1, t2]);
            s1 = afterT2;
          }
        }
        if (s1 == null) break;
      }
      // 处理完表格后还剩下的区域，如果符合条件，那么直接加入range数组
      if (s1 != null && isBefore(s1, s2)) {
        array.push([s1, s2]);
      }
      return array;
    };

    const ranges = splitRange() || [];
    for (const r of ranges.reverse()) {
      const range = {
        anchor: r[0],
        focus: r[1],
      };
      if (Range.isCollapsed(range)) continue;
      const isTable = Editor.above(editor, {
        at: range,
        match(n) {
          return TableLogic.isTable(n);
        },
      });
      if (isTable) {
        // 如果表格被全选，那么直接删除
        const tableRange = Editor.range(editor, isTable[1]);
        const tInte = Range.intersection(range, tableRange);
        if (tInte && Range.equals(tInte, tableRange)) {
          Transforms.removeNodes(editor, { at: isTable[1] });
          continue;
        }
        const tds = Array.from(
          Editor.nodes(editor, {
            at: range,
            match(n) {
              return TableLogic.isTd(n);
            },
          })
        );
        for (const td of tds) {
          const tdRange = Editor.range(editor, td[1]);
          const inte = Range.intersection(tdRange, range);
          if (inte && Range.isExpanded(inte)) {
            // 对于被全选的td，用下面的方法删除不会造成内存泄漏
            if (Range.equals(inte, tdRange)) {
              for (const [, childP] of Node.children(editor, td[1], {
                reverse: true,
              })) {
                Transforms.removeNodes(editor, { at: childP });
              }
            } else {
              // 对于非全选的单元格，只好用这种方式删
              Transforms.setSelection(editor, inte);
              Transforms.delete(editor, {
                hanging: true,
                voids: true,
              });
            }
          }
        }
      } else {
        Transforms.setSelection(editor, range);
        Transforms.delete(editor, {
          hanging: true,
          voids: true,
        });
      }
    }

    Transforms.select(editor, Range.start(originSelection));
  },
  isTextWrapper(node: Node) {
    return Element.isElement(node) && TextWrappers.includes(node.type);
  },
  // 获取包裹光标文本位置的li或者td
  getFirstAboveElementType(editor: EditorType) {
    if (editor.selection) {
      const textWrapper = utils.getParent(editor, editor.selection.anchor.path);
      if (!textWrapper[0]) return null;
      const element = utils.getParent(editor, textWrapper[1]);
      if (!element[0]) return null;

      return (
        (Element.isElement(element[0]) && element[0].type) ||
        (Editor.isEditor(element[0]) && CET.EDITOR)
      );
    }
  },
  getPath(path: Path, type: "pre" | "next" | "parent") {
    const basePath = path.slice(0, path.length - 1);
    const t = path[path.length - 1];
    return type == "parent"
      ? basePath
      : [...basePath, type == "pre" ? t - 1 : t + 1];
  },
  getNodeByPath(editor: EditorType, path: Path) {
    try {
      return Editor.node(editor, path);
    } catch (error) {
      return [];
    }
  },
  getParent(editor: EditorType, path: Path) {
    return this.getNodeByPath(editor, this.getPath(path, "parent"));
  },
  hasNotSelectedAnyTd(editor: EditorType) {
    const hasSelectedTd = TableLogic.getFirstSelectedTd(editor);
    return hasSelectedTd == null && !TableLogic.isInTable(editor);
  },
};
