/* eslint-disable eqeqeq */
import {
  Transforms,
  Range,
  Text,
  Element,
  Editor,
  Node,
  NodeEntry,
  Path,
  Descendant,
} from "slate";
import { ReactEditor } from "slate-react";
import { CET, EditorType, Marks } from "../common/Defines";
import { utils } from "../common/utils";

export const ListLogic = {
  toggleList(editor: EditorType, type: CET.NORMAL_LIST | CET.NUMBER_LIST) {
    // 判断当前是不是列表形态
    const [text] = Editor.nodes(editor, {
      mode: "lowest",
      match(n) {
        return Text.isText(n) || Editor.isInline(editor, n);
      },
    });
    if (!text) return;
    const textWrapper = Editor.parent(editor, text[1]);
    if (!textWrapper) return;
    const twParent = Editor.parent(editor, textWrapper[1]);
    const li = ListLogic.isListItem(twParent[0]) && twParent;
    const liParent = li && utils.getParent(editor, li[1]);

    const isSameTypeToggle =
      li &&
      liParent &&
      Element.isElement(liParent[0]) &&
      liParent?.[0].type == type;
    // 是否改变列表类型
    const isChangeListType = li && !isSameTypeToggle;
    // 是否删除列表
    const isCancelList = li && isSameTypeToggle;
    // 是否设置为列表
    const isSetToList = !li;

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
          mode: "lowest",
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
        const elementsInRange = Array.from(
          Editor.nodes(editor, {
            reverse: true,
            mode: "lowest",
            match(n) {
              return utils.isTextWrapper(n);
            },
          })
        );

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
    if (!editor.selection) return false;

    const {
      focus: { path: fPath },
      anchor: { path: aPath },
    } = editor.selection;

    let rel = Editor.above(editor, {
      at: fPath,
      match(n) {
        return ListLogic.isListItem(n);
      },
    });

    if (rel) return true;

    rel = Editor.above(editor, {
      at: aPath,
      match(n) {
        return ListLogic.isListItem(n);
      },
    });

    if (rel) return true;

    return false;
  },
  isInList(editor: EditorType) {
    if (!editor.selection) return false;

    const {
      focus: { path: fPath },
      anchor: { path: aPath },
    } = editor.selection;

    let rel = Editor.above(editor, {
      at: fPath,
      match(n) {
        return ListLogic.isListItem(n);
      },
    });

    if (rel) return true;

    rel = Editor.above(editor, {
      at: aPath,
      match(n) {
        return ListLogic.isListItem(n);
      },
    });

    if (rel) return true;

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
      // 如果有多个textWrapper，那么从第二个开始就包裹成li
      if (node.children.length > 1) {
        Editor.withoutNormalizing(editor, () => {
          const nextPath = [...path, 1];
          const texts = Array.from(
            Editor.nodes(editor, {
              at: nextPath,
              match(n) {
                return Text.isText(n) || Editor.isInline(editor, n);
              },
            })
          );

          Transforms.wrapNodes(
            editor,
            {
              type: CET.LIST_ITEM,
              children: [],
            },
            {
              at: nextPath,
            }
          );

          Transforms.removeNodes(editor, {
            at: [...nextPath, 0],
          });
          Transforms.insertNodes(
            editor,
            {
              type: CET.DIV,
              children: texts.map((t) => t[0]) as Descendant[],
            },
            {
              at: [...nextPath, 0],
            }
          );
          Transforms.liftNodes(editor, { at: nextPath });
          Transforms.select(editor, Editor.start(editor, Path.next(path)));
        });
        return true;
      }

      // 如果父元素不是list，那么unwrap li 组件
      if (!ListLogic.isOrderList(Editor.parent(editor, path)?.[0])) {
        Editor.withoutNormalizing(editor, () => {
          Transforms.unwrapNodes(editor, { at: path });
          Transforms.select(editor, Editor.start(editor, path));
        });
        return true;
      }

      // li里只允许有textWrapper包裹的inline元素
      for (const [child, childP] of Node.children(editor, nodeEntry[1], {
        reverse: true,
      })) {
        if (ListLogic.isOrderList(child)) {
          Transforms.liftNodes(editor, { at: childP });
          return true;
        }
        if (!utils.isTextWrapper(child)) {
          Editor.withoutNormalizing(editor, () => {
            const texts = Array.from(
              Editor.nodes(editor, {
                at: Editor.range(editor, childP),
                match(n) {
                  return Text.isText(n) || Editor.isInline(editor, n);
                },
              })
            );
            Transforms.wrapNodes(
              editor,
              {
                type: CET.DIV,
                children: [],
              },
              {
                at: childP,
              }
            );
            Transforms.removeNodes(editor, {
              at: [...childP, 0],
            });
            Transforms.insertNodes(
              editor,
              texts.map((t) => t[0]),
              { at: [...childP, 0] }
            );
          });
          return true;
        }
      }

      // 如果所有的text都是一样的Color，那么设置li的color也为该color
      const colors = new Set();
      for (const [child] of Node.texts(node)) {
        colors.add(child[Marks.Color]);
      }
      if (colors.size == 1) {
        const onlyColor = Array.from(colors).pop();
        onlyColor &&
          Transforms.setNodes(editor, { liColor: onlyColor }, { at: path });
        return;
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
  tabEvent(editor: EditorType) {
    Editor.withoutNormalizing(editor, () => {
      const selectedListItems = Editor.nodes(editor, {
        universal: true,
        mode: "lowest",
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
        mode: "lowest",
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
