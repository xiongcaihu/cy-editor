/* eslint-disable eqeqeq */
import _ from "lodash";
import { useRef } from "react";
import {
  Node,
  NodeEntry,
  Element,
  Text,
  Range,
  Transforms,
  Editor,
  Path,
  Point,
} from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import { CET, EditorType } from "../common/Defines";
import { utils } from "../common/utils";
import { TdLogic } from "./Td";

declare module "react" {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    border?: any;
  }
}

export const Table: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
}) => {
  const ref = useRef<{
    isBeginSelectTd: boolean;
    mouseDownStartPoint: any;
    preMouseOnTdPath: Path | null; //  鼠标移动时，记录上一次所处的td
    lastSelectedPaths: Path[];
    initX: number;
    initY: number;
  }>({
    isBeginSelectTd: false,
    mouseDownStartPoint: null,
    initX: 0,
    initY: 0,
    lastSelectedPaths: [],
    preMouseOnTdPath: null,
  });

  const editor = useSlateStatic();
  const selectTd = _.debounce((pa: Point, pb: Point) => {
    const commonNode = Node.common(editor, pa.path, pb.path);
    if (!commonNode) return;
    const pbTd = Editor.above(editor, {
      at: pb,
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (!pbTd) return;

    const preMouseOnTdPath = ref.current.preMouseOnTdPath;
    if (preMouseOnTdPath && Path.equals(preMouseOnTdPath, pbTd[1])) return;
    ref.current.preMouseOnTdPath = pbTd[1];

    const paTd = Editor.above(editor, {
      at: pa,
      mode: "lowest",
      match(n) {
        return TableLogic.isTd(n);
      },
    });
    if (!paTd) return;

    // 取消选择上一次选中的td
    ref.current.lastSelectedPaths.forEach((p) => {
      Transforms.unsetNodes(editor, ["selected", "start"], {
        at: p,
      });
    });
    ref.current.lastSelectedPaths = [];

    if (Path.equals(paTd[1], pbTd[1])) {
      // 说明选区在一个td里
      Transforms.setNodes(
        editor,
        { selected: true, start: true },
        { at: paTd[1] }
      );
      return;
    }
    if (
      !Element.isElement(commonNode[0]) ||
      (commonNode[0].type != CET.TBODY && commonNode[0].type != CET.TR)
    )
      return;

    // 找到两个点同一层级的td
    const tda = Editor.above(editor, {
      at: pa,
      mode: "highest",
      match(n, p) {
        return TableLogic.isTd(n) && p.length > commonNode[1].length;
      },
    });
    if (!tda) return;
    Transforms.setNodes(editor, { start: true }, { at: tda[1] });
    const tdb = Editor.above(editor, {
      at: pb,
      mode: "highest",
      match(n, p) {
        return TableLogic.isTd(n) && p.length > commonNode[1].length;
      },
    });
    if (!tdb) return;
    Transforms.setNodes(editor, { start: true }, { at: tdb[1] });

    const tbody = Editor.above(editor, {
      at: tda[1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody || !Element.isElement(tbody[0])) return;

    const selectedTds = TdLogic.getSelectedTd(tbody);
    if (selectedTds == null) return;

    const tbodyPath = tbody[1];
    for (const td of selectedTds.keys()) {
      const tdPath = [...tbodyPath, td.originRow, td.originCol];
      Transforms.setNodes(editor, { selected: true }, { at: tdPath });
      ref.current.lastSelectedPaths.push(tdPath);
    }
  }, 5);

  const mousedownFunc = (e: any) => {
    // 防止事件冒泡到父元素的td
    e.stopPropagation();
    try {
      ref.current.lastSelectedPaths = [];
      ref.current.preMouseOnTdPath = null;
      const slateNode = ReactEditor.toSlateNode(editor, e.target);
      const path = ReactEditor.findPath(editor, slateNode);
      ref.current.initX = e.clientX;
      ref.current.initY = e.clientY;

      const tdDom = e.nativeEvent.path.find((e: any) => {
        return e.tagName == "TD";
      });
      if (!tdDom) return;

      if (
        !["resizer", "columnSelector"].includes(e.target.className) &&
        tdDom.contentEditable === "false"
      ) {
        ref.current.isBeginSelectTd = true;
        ref.current.mouseDownStartPoint = path;

        for (const [, p] of Editor.nodes(editor, {
          at: [],
          match(n) {
            return (
              TableLogic.isTd(n) && (n.selected == true || n.start == true)
            );
          },
        })) {
          ref.current.lastSelectedPaths.push(p);
        }
        window.onmousemove = mousemoveFunc;
        window.onmouseup = mouseupFunc;
      }
    } catch (error) {}
  };
  const mousemoveFunc = (e: any) => {
    try {
      // 如果移动距离不超过1，那么不进入逻辑
      if (
        ref.current.isBeginSelectTd &&
        (Math.abs(e.clientX - ref.current.initX) > 1 ||
          Math.abs(e.clientY - ref.current.initY) > 1)
      ) {
        const slateNode = ReactEditor.toSlateNode(editor, e.target);
        const path = ReactEditor.findPath(editor, slateNode);
        selectTd(
          Editor.point(editor, ref.current.mouseDownStartPoint),
          Editor.point(editor, path)
        );
      }
    } catch (error) {}
  };
  const mouseupFunc = (e: any) => {
    ref.current.isBeginSelectTd = false;
    window.onmousemove = () => {};
    window.onmousedown = () => {};
    window.onmouseup = () => {};
  };

  return (
    <div
      {...attributes}
      style={{
        display: "inline-block",
        position: "relative",
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
      }}
    >
      <table
        border="1"
        {...attributes}
        style={{
          tableLayout: "auto",
          wordBreak: "break-all",
        }}
        onMouseDown={mousedownFunc}
      >
        {children}
      </table>
      <span
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          right: -5,
          bottom: -5,
          display: "none",
          cursor: "se-resize",
          userSelect: "none",
        }}
        contentEditable={false}
        onMouseDown={(e: any) => {
          let y = e.clientY,
            x = e.clientX,
            h = 0,
            w = 0,
            table: any = e.target.previousElementSibling;

          if (table == null) return;

          const styles = window.getComputedStyle(table);
          w = parseInt(styles.width, 10);
          h = parseInt(styles.height, 10);
          const tableWidth = parseInt(window.getComputedStyle(table).width);
          const tableHeight = parseInt(window.getComputedStyle(table).height);
          Array.from(table.querySelectorAll(":scope>tbody>tr>td")).forEach(
            (td: any) => {
              td.initXPer =
                parseInt(window.getComputedStyle(td).width) / tableWidth;
              td.initYPer =
                parseInt(window.getComputedStyle(td).height) / tableHeight;
            }
          );

          const mouseMoveHandler = function (e: any) {
            e.preventDefault();
            const dx = e.clientX - x;
            const dy = e.clientY - y;
            const width = w + dx;
            const height = h + dy;
            table.style.width = width + "px";
            table.style.height = height + "px";
            Array.from(table.querySelectorAll(":scope>tbody>tr>td")).forEach(
              (td: any) => {
                if (td.nextElementSibling != null) {
                  td.style.width = td.initXPer * width + "px";
                  td.style.height = td.initYPer * height + "px";
                }
              }
            );
          };

          const mouseUpHandler = function () {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
          };

          document.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);
        }}
      ></span>
    </div>
  );
};

export const TableLogic = {
  testModel: JSON.parse(
    `[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string0"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string0"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string0"}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string1"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string1"}]},{"type":"div","children":[{"text":"string2"}]},{"type":"div","children":[{"text":"string2"}]},{"type":"div","children":[{"text":"string1"}]}],"colSpan":2,"rowSpan":2}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string2"}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string3"}]}]},{"type":"td","children":[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"string3d"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"ds"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"dsadsad"}]}]},{"type":"li","children":[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"dsad"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"sadas"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"asd"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"dsa"}]}]}]}]}]}]}]}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string3"}]},{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"d"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"dsa"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"sad"}]}]},{"type":"td","children":[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"dsadsa"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"dsad"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"sd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"das"}]}]},{"type":"li","children":[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"ds"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"d"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"adsa"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"das"}]}]}]}]}]}]}]}]}]}]}]}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string4"}]},{"type":"div","children":[{"text":"string4"}]}],"colSpan":2,"rowSpan":1},{"type":"td","children":[{"type":"div","children":[{"text":"string4"}]}]}],"shouldEmpty":false}]}]},{"type":"div","children":[{"text":"1"}]}]`
  ),
  model: [
    {
      type: CET.TABLE,
      children: [
        {
          type: CET.TBODY,
          children: new Array(10).fill(0).map((item, fatherIndex) => {
            return {
              type: CET.TR,
              children: new Array(10).fill(0).map((item, index) => {
                return {
                  type: CET.TD,
                  children: [
                    {
                      type: CET.DIV,
                      children: [{ text: `string${fatherIndex}-${index}` }],
                    },
                  ],
                };
              }),
            };
          }),
        },
      ],
    },
    {
      type: CET.DIV,
      children: [{ text: "1" }],
    },
  ],
  isSelectedTd(n: Node) {
    return TableLogic.isTd(n) && n.selected == true;
  },
  isTable(node: Node): node is Element {
    return Element.isElement(node) && CET.TABLE == node.type;
  },
  isTd(node: Node): node is Element {
    return Element.isElement(node) && [CET.TD].includes(node.type);
  },
  isInTd(editor: EditorType) {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      return utils.getFirstAboveElementType(editor) == CET.TD;
    }
    return false;
  },
  normalizeTable(editor: EditorType, nodeEntry: NodeEntry) {
    const [node, path] = nodeEntry;

    // tbody校验规则
    if (Element.isElement(node) && [CET.TBODY].includes(node.type)) {
      // 如果tbody的父元素不是table，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && parent.type == CET.TABLE)) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
    }

    // tr校验规则
    if (Element.isElement(node) && CET.TR == node.type) {
      // 如果父元素不为tbody，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && [CET.TBODY].includes(parent.type))) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
      if (node.children.length == 1 && Node.child(node, 0).type != CET.TD) {
        Transforms.setNodes(editor, { shouldEmpty: true }, { at: path });
        return true;
      } else {
        if (node.children.length > 1) {
          for (const [child, childP] of Node.children(editor, path, {
            reverse: true,
          })) {
            if (Text.isText(child)) {
              Transforms.removeNodes(editor, { at: childP });
              return true;
            }
          }
        }

        Transforms.setNodes(editor, { shouldEmpty: false }, { at: path });
        return true;
      }
    }
    // td校验
    if (Element.isElement(node) && CET.TD == node.type) {
      // 如果父元素不是tr，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && [CET.TR].includes(parent.type))) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
      // 如果没有子元素，那么默认添加一个
      if (
        node.children.length == 1 &&
        Text.isText(Node.child(node, 0)) &&
        Editor.string(editor, path, { voids: true }) == ""
      ) {
        Transforms.wrapNodes(
          editor,
          {
            type: CET.DIV,
            children: [{ text: "" }],
          },
          {
            at: [...path, 0],
          }
        );
        return true;
      }
    }
  },
  tabEvent(editor: EditorType) {
    const td = TdLogic.getEditingTd(editor);
    if (!td) return;

    Transforms.deselect(editor);
    TdLogic.findTargetTd(editor, td, "right");
  },
  shiftTabEvent(editor: EditorType) {
    const td = TdLogic.getEditingTd(editor);
    if (!td) return;

    Transforms.deselect(editor);
    TdLogic.findTargetTd(editor, td, "left");
  },
};
