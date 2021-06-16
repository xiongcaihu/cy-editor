/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createEditor,
  Transforms,
  BaseEditor,
  Range,
  Text,
  Point,
  Element,
  Editor,
  Location,
  Path,
  Node,
  Descendant,
  NodeEntry,
} from "slate";
import {
  Slate,
  Editable,
  ReactEditor,
  withReact,
  useSelected,
  useFocused,
  useSlate,
} from "slate-react";
import { withHistory } from "slate-history";
import { Button, Table } from "antd";
import "./RichEditor.css";
import { Resizable } from "re-resizable";
import testImg from "./c.jpg";
import _ from "lodash";

// CustomElementTypes Enum
enum CET {
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
  THEAD = "thead",
  TBODY = "tbody",
  TR = "tr",
  TD = "td",
}

const TextWrappers = [CET.DIV, CET.H1, CET.H2, CET.H3, CET.H4, CET.P];
const InLineTypes = [CET.IMG, CET.LINK];

enum Marks {
  BOLD = "bold",
  ITALIC = "italic",
}

type CustomElement = {
  type: CET;
  [key: string]: any;
  url?: string; // 图片，Link组件的参数
  content?: string; // Link组件的参数
  colSpan?: number; // td属性
  children: (CustomText | CustomElement)[];
};
type CustomText = { text: string; bold?: boolean; [key: string]: any };
type EditorType = BaseEditor & ReactEditor;

declare module "slate" {
  interface CustomTypes {
    Editor: EditorType;
    Element: CustomElement;
    Text: CustomText;
  }
}

type StateShape = Parameters<typeof Slate>[0]["value"];

type EditorCompPropShape = {};
type EditorCompShape = (props: EditorCompPropShape) => React.ReactElement;
type EditableProps = Parameters<typeof Editable>[0];
type KeyDownEventParam = Parameters<NonNullable<EditableProps["onKeyDown"]>>[0];

const utils = {
  isTextWrapper(node: Node) {
    return Element.isElement(node) && TextWrappers.includes(node.type);
  },
  getElementType(editor: EditorType) {
    const ele = Editor.above(editor, {
      match(n) {
        return (
          ListLogic.isListItem(n) || TableLogic.isTd(n) || Editor.isEditor(n)
        );
      },
    });
    if (!ele) return null;

    return (
      (Element.isElement(ele[0]) && ele[0].type) ||
      (Editor.isEditor(ele[0]) && CET.EDITOR)
    );
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
};

const ListLogic = {
  model: JSON.parse(
    `[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"1"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"2"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"2.1"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"2.2"},{"type":"img","children":[{"text":""}]},{"text":""}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"2.3"}]}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"4"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":""}]}]}]}]`
  ),
  arrayModel: [
    ...new Array(10).fill(0).map((o, index) => {
      return {
        type: CET.DIV,
        children: [{ text: String(index) }],
      };
    }),
  ],
  toggleList(editor: EditorType, type: CET.NORMAL_LIST | CET.NUMBER_LIST) {
    // 判断当前是不是列表形态
    const [root] = Editor.nodes(editor, {
      match(n) {
        return ListLogic.isListItem(n);
      },
    });
    const isTurnOffList = !!root;
    const parent = root && utils.getParent(editor, root[1]);
    const isSameTypeToggle =
      isTurnOffList &&
      parent &&
      Element.isElement(parent[0]) &&
      parent[0].type == type;
    // 是否改变列表类型
    const isChangeListType = isTurnOffList && !isSameTypeToggle;
    // 是否删除列表
    const isCancelList = isTurnOffList && isSameTypeToggle;
    // 是否设置为列表
    const isSetToList = !isTurnOffList;

    const cancelList = () => {
      Transforms.unwrapNodes(editor, {
        match(n) {
          return ListLogic.isListItem(n);
        },
      });
    };

    const changeListType = () => {
      Editor.withoutNormalizing(editor, () => {
        const parents = new Set<string>();
        const selectedListItems = Editor.nodes(editor, {
          match(n) {
            return ListLogic.isListItem(n);
          },
        });
        for (const [node, path] of selectedListItems) {
          const parent = utils.getParent(editor, path);
          parent && parents.add(parent[1].join("-"));
        }
        parents.forEach((value) => {
          const p = value.split("-").map((o) => +o);
          Transforms.setNodes(
            editor,
            {
              type,
            },
            {
              at: p,
              hanging: true,
            }
          );
        });
      });
    };

    const setList = () => {
      Editor.withoutNormalizing(editor, () => {
        const elementsInRange = Editor.nodes(editor, {
          universal: true,
          reverse: true,
          match(n) {
            return utils.isTextWrapper(n);
          },
        });

        for (const [node, path] of elementsInRange) {
          if (path.length == 0) continue;
          const [parent] = utils.getParent(editor, path);
          if (ListLogic.isListItem(parent)) continue;
          Transforms.wrapNodes(
            editor,
            {
              type: CET.LIST_ITEM,
              children: [],
            },
            { at: path }
          );
          if (!ListLogic.isOrderList(parent)) {
            Transforms.wrapNodes(
              editor,
              {
                type,
                children: [],
              },
              { at: path }
            );
          }
        }
      });
    };

    if (isCancelList) {
      cancelList();
    } else if (isChangeListType) {
      changeListType();
    } else if (isSetToList) {
      setList();
    }
  },
  getKeyDownEvent(key: string, e: KeyDownEventParam) {
    switch (key) {
      case "Tab":
        return !e.shiftKey ? ListLogic.tabEvent : ListLogic.shiftTabEvent;
      case "Enter":
        return ListLogic.enterEvent;
      case "Backspace":
        return ListLogic.backspaceEvent;
      case "Delete":
        return ListLogic.deleteEvent;
    }
    return null;
  },
  isListItem(node: Node): node is Element {
    return Element.isElement(node) && [CET.LIST_ITEM].includes(node.type);
  },
  isOrderList(node: Node | null | undefined): node is Element {
    return (
      Element.isElement(node) &&
      [CET.NUMBER_LIST, CET.NORMAL_LIST].includes(node.type)
    );
  },
  normalizeList(editor: EditorType, nodeEntry: NodeEntry) {
    const [node, path] = nodeEntry;

    if (ListLogic.isListItem(node)) {
      const parent = utils.getParent(editor, path);
      // 如果父节点为空或者不为列表元素
      if (parent == null || !ListLogic.isOrderList(parent[0])) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
    }

    if (ListLogic.isOrderList(node)) {
      // 如果自己跟前一个节点都是列表节点，那么将前一个改成和自己一样
      const prePath = utils.getPath(path, "pre");
      const [preNode] = utils.getNodeByPath(editor, prePath);

      if (ListLogic.isOrderList(preNode) && preNode.type != node.type) {
        Transforms.setNodes(editor, { type: node.type }, { at: prePath });
        return true;
      }

      // 合并前一个相同的列表元素
      if (ListLogic.isOrderList(preNode) && preNode.type == node.type) {
        Transforms.mergeNodes(editor, { at: path });
        return true;
      }

      const nextPath = utils.getPath(path, "next");
      const [nextNode] = utils.getNodeByPath(editor, nextPath);

      // 如果自己跟后一个节点都是列表节点，那么将自己的类型改成和它一样
      if (ListLogic.isOrderList(nextNode) && nextNode.type != node.type) {
        Transforms.setNodes(editor, { type: nextNode.type }, { at: nextPath });
        return true;
      }

      // 合并后一个相同的列表元素
      if (ListLogic.isOrderList(nextNode) && nextNode.type == node.type) {
        Transforms.mergeNodes(editor, { at: nextPath });
        return true;
      }

      // 如果只有一个列表子节点，那么将自己变成和子节点一样的类型
      if (node.children.length == 1) {
        const [onlyChild, childPath] = Node.first(node, [0]);
        if (ListLogic.isOrderList(onlyChild) && onlyChild.type != node.type) {
          Transforms.setNodes(editor, { type: onlyChild.type }, { at: path });
          return true;
        }
      }

      for (const [child, childP] of Node.children(editor, path, {
        reverse: true,
      })) {
        // 如果不为li元素，则提升
        if (!ListLogic.isListItem(child) && !ListLogic.isOrderList(child)) {
          Transforms.liftNodes(editor, { at: childP });
          return;
        }
      }

      // 如果没有符合条件的子元素，那么删除此列表元素
      let childCount = 0; // li,ul,ol数量
      for (const [child, childP] of Node.children(editor, path, {
        reverse: true,
      })) {
        if (ListLogic.isOrderList(child) || ListLogic.isListItem(child)) {
          childCount++;
        }
      }
      if (childCount == 0) {
        Transforms.unwrapNodes(editor, { at: path });
        return true;
      }
    }
    return false;
  },
  /**
   * 对应键盘Delete事件
   */
  deleteEvent(editor: EditorType) {
    Editor.withoutNormalizing(editor, () => {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        Editor.deleteForward(editor, { unit: "character" });
        return;
      }
    });
  },
  /**
   * 对应键盘Backspace事件
   * 屏蔽了默认的退格事件，只针对没有选区的退格事件
   */
  backspaceEvent(editor: EditorType) {
    Editor.withoutNormalizing(editor, () => {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        const [li] = Editor.nodes(editor, {
          match(n) {
            return ListLogic.isListItem(n);
          },
        });
        if (!li) return false;
        const liParent = utils.getParent(editor, li[1]);
        const firstTextNodeInList = Node.first(editor, liParent[1]);
        const lastTextNodeInList = Node.last(editor, liParent[1]);
        const liGrandFather = utils.getParent(editor, liParent[1]);

        if (
          Path.equals(firstTextNodeInList[1], lastTextNodeInList[1]) &&
          Text.isText(firstTextNodeInList[0]) &&
          firstTextNodeInList[0].text == ""
        ) {
          if (liGrandFather && ListLogic.isOrderList(liGrandFather[0])) {
            Transforms.liftNodes(editor, { at: liParent[1] });
          } else {
            Transforms.setNodes(
              editor,
              { type: CET.DIV, children: [{ text: "" }] },
              { at: li[1] }
            );
            Transforms.unwrapNodes(editor, { at: liParent[1] });
          }
        } else {
          Editor.deleteBackward(editor);
        }
      }
    });
  },
  /**
   * 删除选区里的li策略：
   * 如果整个li的所有元素都被包含，那么直接删除li即可
   * 如果li被部分包围，那么挨个遍历子元素，分别对，选取开始点，结束点，包含点的子元素进行处理
   */
  removeRangeLi(editor: EditorType, selection: Range, liEntry: NodeEntry) {
    const [li, liPath] = liEntry;
    const [start, end] = Range.edges(selection);
    const [first, fp] = Node.first(editor, liPath);
    const [last, lp] = Node.last(editor, liPath);
    const liRange = Editor.range(editor, fp, lp);
    const rangeWithLi = Range.intersection(selection, liRange);

    if (rangeWithLi && Range.equals(rangeWithLi, liRange)) {
      const [parent, pp] = utils.getParent(editor, liPath);
      if (parent && parent?.children?.length == 1) {
        Transforms.removeNodes(editor, { at: pp });
      } else Transforms.removeNodes(editor, { at: liPath });
      return;
    }

    for (const [textWrapper, textWrapperPath] of Node.children(editor, liPath, {
      reverse: true,
    })) {
      const twRange = Editor.range(editor, textWrapperPath);
      const inte = Range.intersection(twRange, selection);
      if (inte && Range.equals(inte, twRange)) {
        Transforms.removeNodes(editor, { at: textWrapperPath });
        continue;
      }
      for (const [textNode, textNodePath] of Node.children(
        editor,
        textWrapperPath,
        {
          reverse: true,
        }
      )) {
        if (
          Path.equals(start.path, end.path) &&
          Path.equals(start.path, textNodePath)
        ) {
          // 如果selection刚好落在一个子元素上
          if (Text.isText(textNode)) {
            Transforms.delete(editor, {
              at: selection,
              reverse: true,
            });
          } else {
            Transforms.removeNodes(editor, {
              at: textNodePath,
            });
          }
        } else if (Path.equals(start.path, textNodePath)) {
          // 如果子元素在start上
          if (Text.isText(textNode)) {
            // 确保有东西可删
            if (textNode.text.length > start.offset) {
              Transforms.delete(editor, {
                at: {
                  anchor: start,
                  focus: {
                    path: textNodePath,
                    offset:
                      (Text.isText(textNode) && textNode.text.length) ||
                      start.offset,
                  },
                },
                reverse: true,
              });
            }
          } else {
            Transforms.removeNodes(editor, {
              at: textNodePath,
            });
          }
        } else if (Path.equals(end.path, textNodePath)) {
          // 如果子元素在end上
          if (Text.isText(textNode)) {
            // 确保有东西可删
            if (end.offset > 0) {
              Transforms.delete(editor, {
                at: {
                  anchor: {
                    path: textNodePath,
                    offset: 0,
                  },
                  focus: end,
                },
                reverse: true,
              });
            }
          } else {
            Transforms.removeNodes(editor, {
              at: textNodePath,
            });
          }
        } else if (Range.includes(selection, textNodePath)) {
          // 选区包含整个子元素
          Transforms.removeNodes(editor, {
            at: textNodePath,
          });
        }
      }
    }
  },
  /**
   * 拦截回车事件，
   * 如果当前的li的子元素只有一个，且子元素的文本为空，那么往上抬一个层级
   * 只有父节点的父节点是列表元素的时候才能抬，否则，就是unwrap li
   * 如果当前li的子元素大于1，那么在下方插入一个新的li
   */
  enterEvent(editor: EditorType) {
    Editor.withoutNormalizing(editor, () => {
      if (editor.selection && !Range.isCollapsed(editor.selection)) return;
      const [listItem] = Editor.nodes(editor, {
        match(n) {
          return ListLogic.isListItem(n);
        },
      });

      const [li, liPath] = listItem;
      const [parent, pp] = utils.getParent(editor, liPath);
      const [parentParent, ppp] = utils.getParent(editor, pp);

      if (li.children.length == 1) {
        const divChild = Node.child(li, 0);
        if (divChild.children.length == 1) {
          const textNode = Node.child(divChild, 0);
          if (Text.isText(textNode) && textNode.text.length == 0) {
            if (ListLogic.isOrderList(parentParent)) {
              Transforms.liftNodes(editor, {
                at: liPath,
              });
              return;
            } else {
              Transforms.unwrapNodes(editor, { at: liPath });
              Transforms.liftNodes(editor, {
                at: liPath,
              });
              return;
            }
          }
        }
      }

      Editor.insertBreak(editor);

      Transforms.wrapNodes(editor, {
        type: CET.LIST_ITEM,
        children: [],
      });

      Transforms.liftNodes(editor, {
        match(n) {
          return ListLogic.isListItem(n);
        },
      });
    });
  },
  tabEvent(editor: EditorType) {
    Editor.withoutNormalizing(editor, () => {
      const selectedListItems = Editor.nodes(editor, {
        universal: true,
        match(n) {
          return ListLogic.isListItem(n);
        },
      });

      for (const [n, p] of selectedListItems) {
        ListLogic.indentLi(editor, [n, p]);
      }
    });
  },
  indentLi(editor: EditorType, liEntry: NodeEntry) {
    Editor.withoutNormalizing(editor, () => {
      const [li, liPath] = liEntry;
      const p = ReactEditor.findPath(editor, li);

      const nextNode = utils.getNodeByPath(editor, utils.getPath(p, "next"));
      const parent = utils.getParent(editor, p);
      if (nextNode && ListLogic.isOrderList(nextNode?.[0])) {
        Transforms.wrapNodes(
          editor,
          {
            type: nextNode[0].type,
            children: [],
          },
          { at: p }
        );
      } else if (parent && ListLogic.isOrderList(parent?.[0])) {
        Transforms.wrapNodes(
          editor,
          {
            type: parent[0].type,
            children: [],
          },
          { at: p }
        );
      }
    });
  },
  shiftTabEvent(editor: EditorType) {
    Editor.withoutNormalizing(editor, () => {
      const selectedListItems = Editor.nodes(editor, {
        universal: true,
        reverse: true,
        match(n) {
          return ListLogic.isListItem(n);
        },
      });

      for (const [n, p] of selectedListItems) {
        ListLogic.liftLi(editor, [n, p]);
      }
    });
  },
  liftLi(editor: EditorType, liEntry: NodeEntry) {
    const [li, liPath] = liEntry;
    const [parent, pp] = utils.getParent(editor, liPath);
    const [parentParent, ppp] = parent && utils.getParent(editor, pp);

    if (ListLogic.isOrderList(parentParent)) {
      Transforms.liftNodes(editor, {
        at: liPath,
      });
    }
  },
};

const TableLogic = {
  model: [
    {
      type: CET.TABLE,
      children: [
        {
          type: CET.THEAD,
          children: [
            {
              type: CET.TR,
              children: [
                {
                  type: CET.TD,
                  children: [{ text: "" }],
                },
                {
                  type: CET.TD,
                  children: [{ text: "" }],
                },
              ],
            },
          ],
        },
        {
          type: CET.TBODY,
          children: new Array(10).fill(0).map((item) => {
            return {
              type: CET.TR,
              children: [
                {
                  type: CET.TD,
                  children: [{ text: "123" }],
                },
                {
                  type: CET.TD,
                  children: [{ text: "321" }],
                },
              ],
            };
          }),
        },
      ],
    },
    ..._.cloneDeep(ListLogic.model),
  ],
  normalizeTable(editor: EditorType, nodeEntry: NodeEntry) {
    const [node, path] = nodeEntry;

    if (Element.isElement(node) && CET.TABLE == node.type) {
      // const nextPath = utils.getPath(path, "next");
      // const [nextNode] = utils.getNodeByPath(editor, nextPath);
      // if (!nextNode) {
      //   Transforms.insertNodes(
      //     editor,
      //     {
      //       type: CET.DIV,
      //       children: [{ text: "" }],
      //     },
      //     { at: nextPath }
      //   );
      //   return;
      // }
    }

    if (Element.isElement(node) && [CET.THEAD, CET.TBODY].includes(node.type)) {
      const [parent, pp] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && parent.type == CET.TABLE)) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }
    }

    if (Element.isElement(node) && CET.TR == node.type) {
      // 如果父元素不为tbody,thead，则删除
      const [parent, pp] = utils.getParent(editor, path);
      if (
        !(
          Element.isElement(parent) &&
          [CET.TBODY, CET.THEAD].includes(parent.type)
        )
      ) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type != CET.TD) {
          Transforms.setNodes(
            editor,
            {
              type: CET.TD,
            },
            { at: childPath }
          );
          return;
        }
        if (Text.isText(child)) {
          Transforms.wrapNodes(
            editor,
            {
              type: CET.TD,
              children: [],
            },
            { at: childPath }
          );
          return;
        }
      }
    }

    if (Element.isElement(node) && CET.TD == node.type) {
      const [parent, pp] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && [CET.TR].includes(parent.type))) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }
      for (const [child, childPath] of Node.children(editor, path)) {
        if (
          Text.isText(child) ||
          Editor.isInline(editor, child) ||
          Editor.isVoid(editor, child)
        ) {
          Transforms.wrapNodes(
            editor,
            { type: CET.DIV, children: [] },
            { at: childPath }
          );
          return true;
        }
      }
    }
  },
  arrowKeyEvent(editor: EditorType, key: "ArrowUp" | "ArrowDown") {
    if (editor.selection && !Range.isCollapsed(editor.selection)) return false;
    const [td] = Editor.nodes(editor, {
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    const { selection } = editor;
    if (!td || !selection) return false;
    const nowTdDom: any = ReactEditor.toDOMNode(editor, td[0]);
    const nowTrDom = nowTdDom.parentNode;
    const tableDom = nowTrDom?.parentNode?.parentNode;
    if (!tableDom) return;

    switch (key) {
      case "ArrowUp": {
        if (nowTrDom.rowIndex == 0) {
          const table = Editor.above(editor, {
            match(n) {
              return TableLogic.isTable(n);
            },
          });
          if (!table) return false;
          const beforeTable = Editor.before(editor, table[1]);
          // 如果table已经是第一个元素，那么在它前面插入一个空文本
          if (!beforeTable) {
            Transforms.insertNodes(
              editor,
              {
                type: CET.DIV,
                children: [{ text: "" }],
              },
              { at: table[1] }
            );
            Transforms.select(editor, table[1]);
          } else {
            Transforms.select(editor, beforeTable);
          }
          return true;
        }
        const [firstChild, fcp] = Editor.first(editor, td[1]);
        if (!Path.equals(fcp, selection.anchor.path)) return false;
        if (
          Text.isText(firstChild) &&
          firstChild.text.indexOf("\n") != -1 &&
          selection.anchor.offset > firstChild.text.indexOf("\n")
        )
          return false;
        const targetTrDom: any = Array.from(tableDom.querySelectorAll("tr"))?.[
          nowTrDom.rowIndex - 1
        ];
        if (!targetTrDom) return false;
        const targetTdDom: any = Array.from(
          targetTrDom.querySelectorAll("td")
        )?.[nowTdDom.cellIndex];
        if (!targetTdDom) return false;
        const targetTd = ReactEditor.toSlateNode(editor, targetTdDom);
        const path = ReactEditor.findPath(editor, targetTd);
        const [first, firstP] = Editor.first(editor, path);
        if (Text.isText(first)) {
          Transforms.select(editor, {
            anchor: { path: firstP, offset: 0 },
            focus: { path: firstP, offset: 0 },
          });
        }
        return true;
      }
      case "ArrowDown": {
        const [lastChild, lcp] = Editor.last(editor, td[1]);
        if (!Path.equals(lcp, selection.anchor.path)) return false;
        if (
          Text.isText(lastChild) &&
          lastChild.text.lastIndexOf("\n") != -1 &&
          selection.anchor.offset < lastChild.text.lastIndexOf("\n")
        )
          return false;
        const targetTrDom: any = Array.from(tableDom.querySelectorAll("tr"))?.[
          nowTrDom.rowIndex + 1
        ];
        // 如果下一行tr元素不存在，那么说明已经是在最后一行
        if (!targetTrDom) {
          const table = Editor.above(editor, {
            match(n) {
              return TableLogic.isTable(n);
            },
          });
          if (!table) return false;
          let afterTable = Editor.after(editor, table[1]);
          // 如果table的下一个元素不存在，那么插入一个
          if (!afterTable) {
            Transforms.insertNodes(
              editor,
              {
                type: CET.DIV,
                children: [{ text: "" }],
              },
              { at: utils.getPath(table[1], "next") }
            );
            Transforms.select(editor, utils.getPath(table[1], "next"));
          } else {
            Transforms.select(editor, afterTable);
          }
          return true;
        }
        const targetTdDom: any = Array.from(
          targetTrDom.querySelectorAll("td")
        )?.[nowTdDom.cellIndex];
        if (!targetTdDom) return false;
        const targetTd = ReactEditor.toSlateNode(editor, targetTdDom);
        const path = ReactEditor.findPath(editor, targetTd);
        const [first, firstP] = Editor.first(editor, path);
        if (Text.isText(first)) {
          Transforms.select(editor, {
            anchor: { path: firstP, offset: 0 },
            focus: { path: firstP, offset: 0 },
          });
        }
        return true;
      }
    }
    return false;
  },
  isTable(node: Node): node is Element {
    return Element.isElement(node) && CET.TABLE == node.type;
  },
  removeRangeTd(editor: EditorType, selection: Range, tdEntry: NodeEntry) {
    const [td, tdPath] = tdEntry;
    const inte = Range.intersection(selection, Editor.range(editor, tdPath));

    inte &&
      Transforms.insertText(editor, "", {
        at: inte,
        voids: false,
      });
  },
  backspaceEvent(editor: EditorType) {
    Editor.withoutNormalizing(editor, () => {
      const { selection } = editor;
      // 如果没有选区
      if (selection && Range.isCollapsed(selection)) {
        const [td] = Editor.nodes(editor, {
          match(n) {
            return TableLogic.isTd(n);
          },
        });
        const [, firstNodePath] = Editor.first(editor, td[1]);
        const [textNode, textNodePath] = Editor.node(editor, selection);
        if (
          Text.isText(textNode) &&
          Path.equals(firstNodePath, textNodePath) &&
          selection.anchor.offset == 0
        ) {
          // TableLogic.shiftTabEvent(editor);
        } else {
          Editor.deleteBackward(editor);
        }
        return true;
      }
    });
  },
  deleteEvent(editor: EditorType) {
    Editor.withoutNormalizing(editor, () => {
      const { selection } = editor;
      if (selection && Range.isCollapsed(selection)) {
        const [td] = Editor.nodes(editor, {
          match(n) {
            return TableLogic.isTd(n);
          },
        });
        const [lastNode, lastNodePath] = Editor.last(editor, td[1]);
        const [textNode, textNodePath] = Editor.node(editor, selection);
        if (
          Text.isText(textNode) &&
          Path.equals(lastNodePath, textNodePath) &&
          selection.anchor.offset == textNode.text.length
        ) {
          // TableLogic.tabEvent(editor);
        } else {
          Editor.deleteForward(editor);
        }
        return true;
      }
    });
    return true;
  },
  enterEvent(editor: EditorType) {
    Editor.insertBreak(editor);
  },
  tabEvent(editor: EditorType) {
    const [td] = Editor.nodes(editor, {
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    const [, nextPath] = TableLogic.getNextTd(editor, td[1]);
    if (nextPath) {
      const [, firstTextPath] = Editor.first(editor, nextPath);
      Transforms.select(editor, {
        anchor: {
          path: firstTextPath,
          offset: 0,
        },
        focus: {
          path: firstTextPath,
          offset: 0,
        },
      });
    }
  },
  shiftTabEvent(editor: EditorType) {
    const [td] = Editor.nodes(editor, {
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    const [, prePath] = TableLogic.getPreTd(editor, td[1]);
    if (prePath) {
      const [lastText, lastTextPath] = Node.last(editor, prePath);
      if (Text.isText(lastText)) {
        Transforms.select(editor, {
          anchor: {
            path: lastTextPath,
            offset: lastText.text.length,
          },
          focus: {
            path: lastTextPath,
            offset: lastText.text.length,
          },
        });
      }
    }
  },
  getNextTd(editor: EditorType, path: Path): NodeEntry | [] {
    try {
      const nextPath = Path.next(path);
      // 找同级的下一个
      return [Node.get(editor, nextPath), nextPath];
    } catch (error) {
      return [];
    }
  },
  getPreTd(editor: EditorType, path: Path): NodeEntry | [] {
    // 找同级的下一个
    try {
      const prePath = Path.previous(path);
      return [Node.get(editor, prePath), prePath];
    } catch (error) {
      return [];
    }
  },
  isTd(node: Node): node is Element {
    return Element.isElement(node) && [CET.TD].includes(node.type);
  },
};

const ToolBar = () => {
  const [state, setState] = useState({
    isToolBarFocus: true,
  });
  const editor = useSlate();
  const focus = useFocused();
  const setNumberList = () => {
    ListLogic.toggleList(editor, CET.NUMBER_LIST);
  };

  const setNormalList = () => {
    ListLogic.toggleList(editor, CET.NORMAL_LIST);
  };

  const isMarkActive = (mark: Marks) => {
    try {
      const marks = Editor.marks(editor);
      return marks?.[mark] === true ? true : false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const isBlockActive = (type: CET) => {
    try {
      const [match] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) && Element.isElement(n) && n.type === type,
      });
      return !!match;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const toggleMark = (mark: Marks) => {
    const marks = Editor.marks(editor);

    if (marks?.[mark]) {
      Editor.removeMark(editor, mark);
    } else {
      Editor.addMark(editor, mark, true);
    }
  };

  const toggleBlock = (type: CET) => {
    const [match] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type == type,
    });
    if (match) {
      Transforms.setNodes(editor, { type: CET.DIV }, { hanging: true });
    } else {
      Transforms.setNodes(editor, { type }, { hanging: true });
    }
  };

  const insertLink = () => {
    Transforms.insertNodes(editor, {
      type: CET.LINK,
      url: "http://www.baidu.com",
      content: "百度百度百度百度",
      children: [
        {
          text: "百度百度百度百度",
        },
      ],
    });
    Transforms.move(editor);
  };

  const insertImg = () => {
    Transforms.insertNodes(editor, {
      type: CET.IMG,
      children: [
        {
          text: "",
        },
      ],
    });
    Transforms.move(editor);
  };

  const insertTable = () => {};

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "gray",
          opacity: 0.5,
          display: "none",
          position: "absolute",
          left: 0,
          zIndex: 9,
          cursor: "not-allowed",
        }}
      ></div>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();
          setNumberList();
        }}
      >
        有序列表
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();
          setNormalList();
        }}
      >
        无序列表
      </Button>
      <Button
        type={isMarkActive(Marks.BOLD) ? "primary" : "default"}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(Marks.BOLD);
        }}
      >
        B
      </Button>
      <Button
        type={isMarkActive(Marks.ITALIC) ? "primary" : "default"}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(Marks.ITALIC);
        }}
      >
        ITALIC
      </Button>
      <Button
        type={isBlockActive(CET.H1) ? "primary" : "default"}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleBlock(CET.H1);
        }}
      >
        H1
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();
          insertImg();
        }}
      >
        img
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();
          insertLink();
        }}
      >
        link
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();
          insertTable();
        }}
      >
        Table
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();

          console.log(JSON.stringify(editor.children));
        }}
      >
        output
      </Button>
    </div>
  );
};

const ImgComp: EditableProps["renderElement"] = ({
  attributes,
  children,
  element,
}) => {
  const selected = useSelected();
  const editor = useSlate();
  const [state, setState] = useState({
    size: {
      width: element.width || 100,
      height: element.height || 100,
    },
    showTool: false,
  });

  const enableResize = () => {
    return ReactEditor.isReadOnly(editor)
      ? {
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }
      : {
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        };
  };

  useEffect(() => {
    return () => {
      window.onclick = () => {};
    };
  }, []);

  const onResizeStop: ConstructorParameters<
    typeof Resizable
  >[0]["onResizeStop"] = (e, direction, ref, d) => {
    const newWidth = state.size.width + d.width;
    const newHeight = state.size.height + d.height;
    setState((t) => ({
      ...t,
      size: {
        width: newWidth,
        height: newHeight,
      },
    }));
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      {
        children: [],
        width: newWidth,
        height: newHeight,
      },
      { at: path }
    );
  };

  const toggleShowTool = () => {
    if (state.showTool) return;
    setState((t) => ({ ...t, showTool: true }));

    setTimeout(() => {
      window.onclick = (e: any) => {
        if (e.path.findIndex((o: any) => o?.dataset?.cyimgcomptool == 1) != -1)
          return;
        else {
          window.onclick = () => {};
          setState((t) => ({ ...t, showTool: false }));
        }
      };
    }, 0);
  };

  return (
    <div
      {...attributes}
      contentEditable={false}
      style={{
        position: "relative",
        display: "inline-block",
        marginRight: 5,
        marginLeft: 5,
        verticalAlign: "bottom",
        boxShadow: state.showTool || selected ? "0 0 0 3px #B4D5FF" : "none",
      }}
      onClick={toggleShowTool}
    >
      <Resizable
        enable={enableResize()}
        style={{ display: "inline-block" }}
        size={state.size}
        onResizeStop={onResizeStop}
      >
        <img
          width="100%"
          height="100%"
          alt=""
          src={element.url || testImg}
        ></img>
        {children}
      </Resizable>
      <div
        data-cyimgcomptool="1"
        style={{
          position: "absolute",
          display: state.showTool ? "block" : "none",
          left: 0,
          width: 300,
          top: "100%",
          fontSize: 12,
          border: "1px solid",
          color: "unset",
        }}
        contentEditable={false}
      >
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            window.open(element.url || testImg);
          }}
        >
          查看大图
        </button>
        &nbsp;
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            const path = ReactEditor.findPath(editor, element);
            Transforms.removeNodes(editor, { at: path });
          }}
        >
          删除
        </button>
      </div>
    </div>
  );
};

const LinkComp: EditableProps["renderElement"] = ({
  attributes,
  children,
  element,
}) => {
  const editor = useSlate();
  const [state, setState] = useState<{
    url?: string;
    content?: string;
    showTool?: boolean;
  }>(() => ({
    url: element.url,
    content: element.content,
    showTool: false,
  }));

  useEffect(() => {
    setState((t) => ({
      ...t,
      url: element.url,
      content: element.content,
    }));
    return () => {
      window.onclick = () => {};
    };
  }, []);

  const showTool = () => {
    if (state.showTool) return;
    setState((t) => ({
      ...t,
      showTool: true,
      url: element.url,
      content: element.content,
    }));

    setTimeout(() => {
      window.onclick = (e: any) => {
        if (e.path.findIndex((o: any) => o?.dataset?.cylinkcomptool == 1) != -1)
          return;
        else {
          hideTool();
        }
      };
    }, 0);
  };

  const hideTool = () => {
    setState((t) => ({
      ...t,
      showTool: false,
    }));
    window.onclick = () => {};
  };

  const openUrl = () => {
    element.url && ReactEditor.isReadOnly(editor) && window.open(element.url);
  };

  const submitChange = () => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      {
        children: [],
        content: state.content,
        url: state.url,
      },
      { at: path }
    );
    hideTool();
  };

  return (
    <div
      contentEditable={false}
      {...attributes}
      style={{
        display: "inline-block",
        userSelect: "auto",
        position: "relative",
      }}
      onClick={showTool}
    >
      <span
        style={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "#69c0ff",
        }}
        onClick={openUrl}
      >
        {element.content}
      </span>
      <div
        data-cylinkcomptool="1"
        style={{
          position: "absolute",
          userSelect: "none",
          fontSize: 12,
          backgroundColor: "#fff",
          display:
            !state.showTool || ReactEditor.isReadOnly(editor)
              ? "none"
              : "block",
          left: 0,
          width: 300,
          top: "100%",
          border: "1px solid",
          color: "unset",
        }}
        contentEditable={false}
      >
        设置链接：
        <input
          type="text"
          value={state.url}
          onChange={(e) => setState((t) => ({ ...t, url: e?.target?.value }))}
        />
        <br></br>
        设置文字：
        <input
          type="text"
          value={state.content}
          onChange={(e) =>
            setState((t) => ({ ...t, content: e?.target?.value }))
          }
        />
        <button onClick={submitChange}>确定</button>
      </div>
      {children}
    </div>
  );
};

const withCyWrap = (editor: EditorType) => {
  const { isInline, isVoid, normalizeNode } = editor;
  editor.isInline = (node) => {
    if ([CET.IMG, CET.LINK].includes(node.type)) {
      return true;
    }
    return isInline(node);
  };
  editor.isVoid = (node) => {
    if ([CET.IMG, CET.LINK].includes(node.type)) {
      return true;
    }
    return isVoid(node);
  };

  const normalizeEditor = (nodeEntry: NodeEntry) => {
    const [node, path] = nodeEntry;

    // 如果没有子元素，那么强行添加一个
    if (editor.children.length == 0) {
      Transforms.insertNodes(editor, {
        type: CET.DIV,
        children: [{ text: "" }],
      });
      return;
    }

    // 如果inline节点没有被TextWrapper包围，那么包起来
    if (
      Text.isText(node) ||
      (Element.isElement(node) && InLineTypes.includes(node.type))
    ) {
      const [p] = utils.getParent(editor, path);
      if (Element.isElement(p) && !TextWrappers.includes(p.type)) {
        Transforms.wrapNodes(
          editor,
          { type: CET.DIV, children: [] },
          { at: path }
        );
        return;
      }
    }

    if (Element.isElement(node) && TextWrappers.includes(node.type)) {
      // 如果有相邻的两个空的文字，那么删除下一个
      const [preTextWrapper, preP] = utils.getNodeByPath(
        editor,
        utils.getPath(path, "pre")
      );
      if (
        Element.isElement(preTextWrapper) &&
        TextWrappers.includes(preTextWrapper.type) &&
        Editor.string(editor, preP).length == 0 &&
        Editor.string(editor, path).length == 0
      ) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }

      const [nextTextWrapper, nextP] = utils.getNodeByPath(
        editor,
        utils.getPath(path, "next")
      );
      if (
        Element.isElement(nextTextWrapper) &&
        TextWrappers.includes(nextTextWrapper.type) &&
        Editor.string(editor, nextP).length == 0 &&
        Editor.string(editor, path).length == 0
      ) {
        Transforms.removeNodes(editor, { at: nextP });
        return;
      }

      // 如果textWrapper里又有block元素，则删除
      for (const [child, childP] of Node.children(editor, path, {
        reverse: true,
      })) {
        if (Editor.isBlock(editor, child)) {
          Transforms.removeNodes(editor, { at: childP });
          return;
        }
      }
    }

    // inline元素和void元素的前后都必须有文本节点
    if (Element.isElement(node) && InLineTypes.includes(node.type)) {
      const prePath = utils.getPath(path, "pre");
      const [preNode] = utils.getNodeByPath(editor, prePath);
      if (!Text.isText(preNode)) {
        Transforms.insertNodes(editor, { text: "" }, { at: prePath });
        return;
      }

      const nextPath = utils.getPath(path, "next");
      const [nextNode] = utils.getNodeByPath(editor, nextPath);
      if (!Text.isText(nextNode)) {
        Transforms.insertNodes(editor, { text: "" }, { at: nextPath });
        return;
      }
    }

    if (TableLogic.normalizeTable(editor, nodeEntry)) return;
    if (ListLogic.normalizeList(editor, nodeEntry)) return;

    normalizeNode(nodeEntry);
  };

  editor.normalizeNode = normalizeEditor;

  return editor;
};

const EditorComp: EditorCompShape = () => {
  /**
   * 解决live refresh问题的链接
   * https://github.com/ianstormtaylor/slate/issues/4081
   */
  const [editor] = useState(withCyWrap(withHistory(withReact(createEditor()))));
  const [value, setValue] = useState<StateShape>(TableLogic.model);
  useEffect(() => {
    for (const [node, path] of Node.descendants(editor, {
      from: [],
      reverse: true,
    })) {
      editor.normalizeNode([node, path]);
    }
    return () => {};
  }, []);

  const renderElement: EditableProps["renderElement"] = useCallback((props) => {
    const { attributes, children, element } = props;
    switch (element.type) {
      case CET.NUMBER_LIST:
        return <ol {...attributes}>{children}</ol>;
      case CET.NORMAL_LIST:
        return <ul {...attributes}>{children}</ul>;
      case CET.LIST_ITEM:
        return <li {...attributes}>{children}</li>;
      case CET.DIV:
        return <div {...attributes}>{children}</div>;
      case CET.H1:
        return <h1 {...attributes}>{children}</h1>;
      case CET.IMG:
        return <ImgComp {...props}>{children}</ImgComp>;
      case CET.LINK:
        return <LinkComp {...props}></LinkComp>;
      case CET.TABLE:
        return (
          <table border="1" {...attributes}>
            {children}
          </table>
        );
      case CET.THEAD:
        return <thead {...attributes}>{children}</thead>;
      case CET.TBODY:
        return <tbody {...attributes}>{children}</tbody>;
      case CET.TR:
        return <tr {...attributes}>{children}</tr>;
      case CET.TD:
        return (
          <td
            {...attributes}
            colSpan={element.colSpan}
            style={{
              padding: 4,
              minWidth: 50,
              position: "relative",
            }}
          >
            {children}
            <span
              style={{
                position: "absolute",
                width: 5,
                right: 0,
                top: 0,
                height: "100%",
                cursor: "col-resize",
                userSelect: "none",
              }}
              contentEditable={false}
              onMouseDown={(e: any) => {
                let x = 0;
                let w = 0;
                let cell: any = null,
                  table: any = null;
                x = e.clientX;

                for (
                  let i = 0, paths = e.nativeEvent.path;
                  i < paths.length;
                  i++
                ) {
                  const ele = paths[i];
                  if (ele.tagName == "TD") {
                    cell = ele;
                  }
                  if (ele.tagName == "TABLE") {
                    table = ele;
                    break;
                  }
                }

                if (cell == null || table == null) return;

                const cells: any[] = Array.from(
                  table.querySelectorAll("td")
                ).filter((c: any) => {
                  const start = cell.cellIndex;
                  const end = cell.cellIndex + cell.colSpan - 1;
                  if (c.tagName == "TD" && c.cellIndex == end) {
                    c.initX = parseInt(window.getComputedStyle(c).width, 10);
                    return true;
                  }
                  return false;
                });

                const styles = window.getComputedStyle(cell);
                w = parseInt(styles.width, 10);

                const mouseMoveHandler = function (e: any) {
                  const dx = e.clientX - x;
                  // const width = `${w + dx}px`;
                  cells.forEach((c) => (c.style.width = c.initX + dx + "px"));
                };

                const mouseUpHandler = function () {
                  document.removeEventListener("mousemove", mouseMoveHandler);
                  document.removeEventListener("mouseup", mouseUpHandler);
                };

                document.addEventListener("mousemove", mouseMoveHandler);
                document.addEventListener("mouseup", mouseUpHandler);
              }}
            ></span>
            <span
              style={{
                position: "absolute",
                width: "100%",
                height: 5,
                left: 0,
                bottom: 0,
                cursor: "row-resize",
                userSelect: "none",
              }}
              contentEditable={false}
              onMouseDown={(e: any) => {
                let y = e.clientY;
                let h = 0;
                let cell: any = null,
                  row: any = null;

                for (
                  let i = 0, paths = e.nativeEvent.path;
                  i < paths.length;
                  i++
                ) {
                  const ele = paths[i];
                  if (ele.tagName == "TD") {
                    cell = ele;
                  }
                  if (ele.tagName == "TR") {
                    row = ele;
                    break;
                  }
                }

                if (cell == null || row == null) return;

                const cells: any[] = Array.from(row.querySelectorAll("td"));

                const styles = window.getComputedStyle(cell);
                h = parseInt(styles.height, 10);

                const mouseMoveHandler = function (e: any) {
                  e.preventDefault();
                  const dy = e.clientY - y;
                  const width = `${h + dy}px`;
                  cells.forEach((c) => (c.style.height = width));
                };

                const mouseUpHandler = function () {
                  document.removeEventListener("mousemove", mouseMoveHandler);
                  document.removeEventListener("mouseup", mouseUpHandler);
                };

                document.addEventListener("mousemove", mouseMoveHandler);
                document.addEventListener("mouseup", mouseUpHandler);
              }}
            ></span>
          </td>
        );
      default:
        return <div {...attributes}>{children}</div>;
    }
  }, []);

  const renderLeaf: EditableProps["renderLeaf"] = useCallback(
    ({ attributes, children, leaf }) => {
      return (
        <span
          {...attributes}
          style={{
            fontWeight: leaf.bold ? "bold" : "normal",
            fontStyle: leaf.italic ? "italic" : "normal",
          }}
        >
          {children}
        </span>
      );
    },
    []
  );

  const bindKeyDownEvent: EditableProps["onKeyDown"] = (e) => {
    let { selection } = editor;
    if (!selection) return;

    const removeRangeElement = (editor: EditorType, selection: Range) => {
      // 不能在withoutNormalize里运行
      for (const [n, p] of Editor.nodes(editor, {
        at: selection,
        reverse: true,
        universal: true,
        match(n, p) {
          return utils.isTextWrapper(n);
        },
      })) {
        const [parent, pp] = utils.getParent(editor, p);
        if (!parent) continue;

        if (TableLogic.isTd(parent)) {
          TableLogic.removeRangeTd(editor, selection, [parent, pp]);
        } else if (ListLogic.isListItem(parent)) {
          ListLogic.removeRangeLi(editor, selection, [parent, pp]);
        } else {
          const int = Range.intersection(selection, Editor.range(editor, p));
          int &&
            Transforms.delete(editor, {
              at: int,
              reverse: true,
              voids: true,
              unit: "character",
              hanging: true,
            });
        }
      }

      // const tableRanges: any = [];
      // for (const [n, p] of Editor.nodes(editor, {
      //   match(n) {
      //     return TableLogic.isTable(n);
      //   },
      // })) {
      //   const inte = Range.intersection(selection, Editor.range(editor, p));
      //   tableRanges.push(inte);
      // }

      // Transforms.collapse(editor, { edge: "start" });

      // setTimeout(() => {
      //   tableRanges.forEach((inte: any) => {
      //     if (inte) {
      //       Transforms.insertText(editor, "", {
      //         at: inte,
      //       });
      //     }
      //   });
      // }, 0);

      // 为了在normalize之后运行
      setTimeout(() => {
        Transforms.select(
          editor,
          editor.selection ? Range.start(editor.selection) : []
        );
      }, 0);
    };

    if (Range.isExpanded(selection)) {
      switch (e.key) {
        case "Backspace":
        case "Delete": {
          e.preventDefault();
          removeRangeElement(editor, selection);
          break;
        }
        // 如果在选区里按回车，只删除内容
        case "Enter": {
          e.preventDefault();
          removeRangeElement(editor, selection);
          break;
        }
        case "Tab": {
          e.preventDefault();

          for (const [n, p] of Editor.nodes(editor, {
            at: selection,
            reverse: true,
            universal: true,
            match(n) {
              return utils.isTextWrapper(n);
            },
          })) {
            const [parent, pp] = utils.getParent(editor, p);
            if (!parent) continue;
            if (ListLogic.isListItem(parent)) {
              e.shiftKey
                ? ListLogic.indentLi(editor, [parent, pp])
                : ListLogic.liftLi(editor, [parent, pp]);
            }
          }
          break;
        }
      }

      if (!e.ctrlKey && (e.key.length == 1 || e.key == "Process")) {
        removeRangeElement(editor, selection);
        Transforms.collapse(editor, { edge: "start" });
        return;
      }
      return;
    }

    if (Range.isCollapsed(selection)) {
      // 以下是没有选区的情况下的事件
      const elementType = utils.getElementType(editor);

      // 如果默认事件没有被组件拦截掉，那么在这里重新定义拦截逻辑
      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown": {
          if (CET.TD == elementType) {
            if (TableLogic.arrowKeyEvent(editor, e.key)) e.preventDefault();
            break;
          }
          break;
        }
        case "Tab": {
          e.preventDefault();
          if (CET.LIST_ITEM == elementType) {
            e.shiftKey
              ? ListLogic.shiftTabEvent(editor)
              : ListLogic.tabEvent(editor);
            break;
          }
          if (CET.TD == elementType) {
            e.shiftKey
              ? TableLogic.shiftTabEvent(editor)
              : TableLogic.tabEvent(editor);
            break;
          }
          // 如果是在其他元素上
          !e.shiftKey && Transforms.insertText(editor, "    ");
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (CET.LIST_ITEM == elementType) {
            ListLogic.enterEvent(editor);
            break;
          }
          if (CET.TD == elementType) {
            TableLogic.enterEvent(editor);
            break;
          }
          Editor.insertBreak(editor);
          break;
        }
        case "Delete": {
          e.preventDefault();
          if (CET.LIST_ITEM == elementType) {
            ListLogic.deleteEvent(editor);
            break;
          }
          if (CET.TD == elementType) {
            TableLogic.deleteEvent(editor);
            break;
          }
          // 如果后面是表格，则无法删除
          const afterNodePath = Editor.after(editor, selection);
          const table = Editor.above(editor, {
            at: afterNodePath,
            match(n) {
              return TableLogic.isTable(n);
            },
          });
          // 如果已经是空元素，那么删除整行
          const textWrapper = Editor.above(editor, {
            match(n) {
              return utils.isTextWrapper(n);
            },
          });
          if (!textWrapper) break;
          if (Editor.string(editor, textWrapper[1], { voids: true }) == "") {
            Transforms.removeNodes(editor, {
              at: textWrapper[1],
            });
            break;
          }

          if (!!table) break;
          Editor.deleteForward(editor);
          break;
        }
        case "Backspace": {
          e.preventDefault();
          if (CET.LIST_ITEM == elementType) {
            ListLogic.backspaceEvent(editor);
            break;
          }
          if (CET.TD == elementType) {
            TableLogic.backspaceEvent(editor);
            break;
          }
          // 如果前面是表格，则无法删除
          const beforeNodePath = Editor.before(editor, selection);
          const table = Editor.above(editor, {
            at: beforeNodePath,
            match(n) {
              return TableLogic.isTable(n);
            },
          });
          if (!!table) break;
          Editor.deleteBackward(editor);
          break;
        }
      }
      return;
    }
  };

  return (
    <div className="RichEditor">
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
      >
        <ToolBar></ToolBar>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          autoFocus
          spellCheck
          onKeyDown={bindKeyDownEvent}
          onDragStart={(e) => {
            e.preventDefault();
          }}
        />
      </Slate>
    </div>
  );
};

export default EditorComp;
