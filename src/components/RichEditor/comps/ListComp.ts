/* eslint-disable eqeqeq */
import {
  Transforms,
  Range,
  Text,
  Element,
  Editor,
  Node,
  NodeEntry,
  Point,
} from "slate";
import { ReactEditor } from "slate-react";
import { CET, EditorType } from "../common/Defines";
import { utils } from "../common/utils";

export const ListLogic = {
  model3: [
    {
      type: CET.NORMAL_LIST,
      children: new Array(100).fill(0).map((item, index) => {
        return {
          type: CET.LIST_ITEM,
          children: [
            {
              type: CET.DIV,
              children: [
                {
                  text: String(index),
                },
              ],
            },
          ],
        };
      }),
    },
  ],
  model2: JSON.parse(
    `[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"1"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"2"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"3"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"4"}]}]}]}]}]}]`
  ),
  model: JSON.parse(
    `[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"fsdf"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"sdf"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"sdfs"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"dfsd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]},{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fs"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"fs"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fsd"}]}]}]}]}]}]},{"type":"li","children":[{"type":"div","children":[{"text":""}]}]}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fsdfsdfsd"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fsd"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"fsdfsd"},{"type":"img","children":[{"text":""}]},{"text":"fsdfsdfsd"},{"type":"link","url":"http://www.baidu.com","content":"百度百度百度百度","children":[{"text":"百度百度百度百度"}]},{"text":"fsdfsdfsd"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fsdf"}]}]},{"type":"td","children":[{"type":"ul","children":[{"type":"li","children":[{"type":"div","children":[{"text":"fsdfsdfsdffs"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"ul","children":[{"type":"li","children":[{"type":"div","children":[{"text":"fsdfsd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"ffsd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"ul","children":[{"type":"li","children":[{"type":"div","children":[{"text":"fsfsdfsd"}]}]}]}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"sdfsd"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":""}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fs"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"sdf"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fsdfsdf"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fsdfsfsd"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"sdf"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fsdf"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"fsd"}]}]}]}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"dasd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"asd"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"as"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"das"}]}]}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"das"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"das"}]}]}]}]
  `
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
      parent[0] != null &&
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
        for (const [, path] of selectedListItems) {
          const parent = utils.getParent(editor, path);
          parent[0] != null && parents.add(parent[1].join("-"));
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
          mode: "lowest",
          match(n) {
            return utils.isTextWrapper(n);
          },
        });

        for (const [, path] of elementsInRange) {
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
  isInLi(editor: EditorType) {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      return utils.getFirstAboveElementType(editor) == CET.LIST_ITEM;
    }
    return false;
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
      /**
       * 如果父节点为空
       * 或者
       * 不为列表元素或者子元素为空，
       * 或者
       * 子元素只有一个文本节点(且本身在本编辑器中也是不合法的，只不过slate会默认给block元素加入一个默认的空文本节点)
       *
       */
      if (parent.length == 0 || !ListLogic.isOrderList(parent[0])) {
        Transforms.unwrapNodes(editor, { at: path });
        return true;
      }

      if (
        node.children.length == 0 ||
        (node.children.length == 1 && Text.isText(Node.child(node, 0)))
      ) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }

      if (node.children.length > 1) {
        const secChildPath = path.concat([1]);
        Transforms.wrapNodes(
          editor,
          { type: CET.LIST_ITEM, children: [] },
          { at: secChildPath }
        );
        Transforms.liftNodes(editor, { at: secChildPath });
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
        const [onlyChild] = Node.first(node, [0]);
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
          return true;
        }
      }

      // 如果没有符合条件的子元素，那么删除此列表元素
      let childCount = 0; // li,ul,ol数量
      for (const [child] of Node.children(editor, path, {
        reverse: true,
      })) {
        if (ListLogic.isOrderList(child) || ListLogic.isListItem(child)) {
          childCount++;
        }
      }
      if (childCount == 0) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
    }
    return false;
  },
  /**
   * 对应键盘Delete事件
   */
  deleteEvent(editor: EditorType) {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const textWrapper = Editor.parent(editor, editor.selection);
      if (
        utils.isTextWrapper(textWrapper[0]) &&
        Editor.string(editor, textWrapper[1], { voids: true }) == ""
      ) {
        Transforms.removeNodes(editor, { at: textWrapper[1] });
        return;
      }
      Editor.deleteForward(editor);
    }
  },
  /**
   * 对应键盘Backspace事件
   * 屏蔽了默认的退格事件，只针对没有选区的退格事件
   */
  backspaceEvent(editor: EditorType) {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      // 如果光标在textWrapper的开头第一个位置，那么直接lift li
      const textWrapper = utils.getParent(editor, selection.anchor.path);
      if (!textWrapper[0]) return;
      const li = utils.getParent(editor, textWrapper[1]);
      if (!li[0]) return;

      if (Point.equals(selection.anchor, Editor.start(editor, li[1]))) {
        Transforms.liftNodes(editor, { at: li[1] });
      } else {
        Editor.deleteBackward(editor);
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
    if (!editor.selection) return;
    // 如果光标位置在li的第一个textWrapper的第一个位置，向上提升，如果向上提升后是处于非list元素内，取消li包裹
    const textWrapper = utils.getParent(editor, editor.selection.anchor.path);
    if (!textWrapper[0]) return;
    const li = utils.getParent(editor, textWrapper[1]);
    if (!li[0]) return;
    const list = utils.getParent(editor, li[1]);
    if (!list[0]) return;

    if (Editor.string(editor, li[1], { voids: true }) == "") {
      Transforms.liftNodes(editor, { at: li[1] });
    } else {
      Editor.insertBreak(editor);
    }
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
      const [li] = liEntry;
      const p = ReactEditor.findPath(editor, li);

      const nextNode = utils.getNodeByPath(editor, utils.getPath(p, "next"));
      const parent = utils.getParent(editor, p);
      if (nextNode.length > 0 && ListLogic.isOrderList(nextNode?.[0])) {
        Transforms.wrapNodes(
          editor,
          {
            type: nextNode[0].type,
            children: [],
          },
          { at: p }
        );
      } else if (parent.length > 0 && ListLogic.isOrderList(parent?.[0])) {
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
    const [, liPath] = liEntry;
    const [parent, pp] = utils.getParent(editor, liPath);
    const [parentParent] = parent && utils.getParent(editor, pp);

    if (ListLogic.isOrderList(parentParent)) {
      Transforms.liftNodes(editor, {
        at: liPath,
      });
    }
  },
};
