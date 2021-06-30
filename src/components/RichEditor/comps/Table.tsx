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
          width:'100%'
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
    `[{"type":"div","children":[{"text":"12131232"}]},{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string0"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string0"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string0"}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string1"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string1"}]},{"type":"div","children":[{"text":"string2"}]},{"type":"div","children":[{"text":"string2"}]},{"type":"div","children":[{"text":"string1"}]}],"colSpan":2,"rowSpan":2}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string2"}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string3"}]}]},{"type":"td","children":[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"string3d"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"ds"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"fsd"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"dsadsad"}]}]},{"type":"li","children":[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"dsad"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"sadas"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"asd"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"dsa"}]}]}]}]}]}]}]}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"string3"}]},{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"d"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"dsa"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"sad"}]}]},{"type":"td","children":[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"dsadsa"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"dsad"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"sd"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"das"}]}]},{"type":"li","children":[{"type":"table","children":[{"type":"tbody","children":[{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"ds"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"d"}]}]}]},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"adsa"}]}]},{"type":"td","children":[{"type":"div","children":[{"text":"das"}]}]}]}]}]}]}]}]}]}]}]}]}]}],"shouldEmpty":false},{"type":"tr","children":[{"type":"td","children":[{"type":"div","children":[{"text":"string4"}]},{"type":"div","children":[{"text":"string4"}]}],"colSpan":2,"rowSpan":1},{"type":"td","children":[{"type":"div","children":[{"text":"string4"}]}]}],"shouldEmpty":false}]}]},{"type":"div","children":[{"text":"1"}]}]`
  ),
  model: [
    {
      type: CET.TABLE,
      children: [
        {
          type: CET.TBODY,
          children: new Array(100).fill(0).map((item, fatherIndex) => {
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
  deleteRow(editor: EditorType) {
    // 删除选区对应的列
    let deleteVArea: number[] = [Infinity, -Infinity];
    const [selectedTd] = Editor.nodes(editor, {
      at: [],
      reverse: true,
      match(n) {
        return TableLogic.isTd(n) && n.selected == true;
      },
    });
    if (!selectedTd) return;

    const tbody = Editor.above(editor, {
      at: selectedTd[1],
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody) return;
    const { tdMap } = TdLogic.getTdMap(tbody);
    if (!tdMap) return;
    const selectedTds = Array.from(TdLogic.getSelectedTd(tbody)?.keys() || []);
    if (selectedTds.length == 0) return;

    selectedTds.forEach((td) => {
      deleteVArea[0] = Math.min(deleteVArea[0], td.row);
      deleteVArea[1] = Math.max(deleteVArea[1], td.row + td.rowSpan);
    });

    // 说明是整个表格所有行被删除
    if (deleteVArea[1] - deleteVArea[0] == tdMap.length) {
      // 直接删除表格
      Transforms.removeNodes(editor, {
        at: Path.parent(tbody[1]),
      });
      return;
    }

    const removePath = [];
    for (let row = deleteVArea[0]; row < deleteVArea[1]; row++) {
      removePath.unshift([...tbody[1], row]);
      for (let col = 0; col < tdMap[row].length; col++) {
        const td = tdMap[row][col];
        td.rowSpan--;
        const tdPath = [...tbody[1], td.originRow, td.originCol];
        // 如果rowSpan被减去到0，说明这个cell在要删除的行里
        if (td.rowSpan != 0) {
          Transforms.setNodes(
            editor,
            {
              rowSpan: td.rowSpan,
            },
            {
              at: tdPath,
            }
          );
        }
        col += td.colSpan - 1;
      }
    }

    // 再次遍历，找到那些起始点身处删除范围内，且rowSpan>0的
    for (let row = deleteVArea[0]; row < deleteVArea[1]; row++) {
      for (let col = 0; col < tdMap[row].length; col++) {
        const td = tdMap[row][col];
        if (
          td.rowSpan > 0 &&
          td.row >= deleteVArea[0] &&
          td.row == row &&
          td.col == col
        ) {
          const targetRow = deleteVArea[1];
          const leftCol = tdMap[targetRow][td.col - 1];
          if (leftCol) {
            Transforms.moveNodes(editor, {
              at: [...tbody[1], td.originRow, td.originCol],
              to: [...tbody[1], targetRow, leftCol.originCol + 1],
            });
          } else {
            Transforms.moveNodes(editor, {
              at: [...tbody[1], td.originRow, td.originCol],
              to: [...tbody[1], targetRow, 0],
            });
          }
        }
        col += td.colSpan - 1;
      }
    }

    // 从最低点开始删除
    removePath.forEach((path) => {
      Transforms.removeNodes(editor, { at: path });
    });
  },
  deleteColumn(editor: EditorType) {
    // 删除选区对应的列
    let deleteHArea: number[] = [Infinity, -Infinity];
    const [selectedTd] = Editor.nodes(editor, {
      at: [],
      reverse: true,
      match(n) {
        return TableLogic.isTd(n) && n.selected == true;
      },
    });
    if (!selectedTd) return;

    const tbody = Editor.above(editor, {
      at: selectedTd[1],
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody) return;
    const { tdMap } = TdLogic.getTdMap(tbody);
    if (!tdMap) return;
    const selectedTds = Array.from(TdLogic.getSelectedTd(tbody)?.keys() || []);
    if (selectedTds.length == 0) return;

    selectedTds.forEach((td) => {
      deleteHArea[0] = Math.min(deleteHArea[0], td.col);
      deleteHArea[1] = Math.max(deleteHArea[1], td.col + td.colSpan);
    });

    // 说明是整个表格所有列被删除
    if (deleteHArea[1] - deleteHArea[0] == tdMap[0].length) {
      // 直接删除表格
      Transforms.removeNodes(editor, {
        at: Path.parent(tbody[1]),
      });
      return;
    }

    const removePath = [];
    for (let col = deleteHArea[0]; col < deleteHArea[1]; col++) {
      for (let row = 0; row < tdMap.length; row++) {
        const td = tdMap[row][col];
        td.colSpan--;
        const tdPath = [...tbody[1], td.originRow, td.originCol];
        if (td.colSpan == 0) {
          removePath.push(tdPath);
        } else {
          Transforms.setNodes(
            editor,
            {
              colSpan: td.colSpan,
            },
            {
              at: tdPath,
            }
          );
        }
        row += td.rowSpan - 1;
      }
    }

    // 从最低点开始删除
    removePath.sort((a, b) => {
      const arow = a[a.length - 2];
      const brow = b[b.length - 2];
      const acol = a[a.length - 1];
      const bcol = b[b.length - 1];
      return arow > brow ? -1 : arow == brow ? bcol - acol : 1;
    });
    removePath.forEach((path) => {
      Transforms.removeNodes(editor, { at: path });
    });
  },
  insertColumn(
    editor: EditorType,
    type: "before" | "after",
    count: number = 1
  ) {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const [nowTd] = Editor.nodes(editor, {
        mode: "lowest",
        match(n) {
          return TableLogic.isTd(n);
        },
      });
      if (!nowTd) return;
      const nowTr = Editor.parent(editor, nowTd[1]);
      if (!nowTr) return;
      const tbody = Editor.parent(editor, nowTr[1]);
      if (!tbody) return;
      const { tdMap } = TdLogic.getTdMap(tbody);
      if (
        !Element.isElement(nowTd[0]) ||
        !Element.isElement(nowTd[0]) ||
        !Element.isElement(tbody[0])
      )
        return;

      const getInsertCells = () => {
        return _.cloneDeep(
          new Array(count).fill(0).map(() => {
            return _.cloneDeep({
              type: CET.TD,
              children: [
                {
                  type: CET.DIV,
                  children: [{ text: "" }],
                },
              ],
            });
          })
        );
      };

      // 首先找到第一插入点
      const [nowTdRow, nowTdCol] = nowTd[1].slice(nowTd[1].length - 2);
      let insertPos: number[] = []; // [row,col]
      for (let i = 0; i < tdMap[nowTdRow].length; i++) {
        const td = tdMap[nowTdRow][i];
        // 找到当前td在tdMap中的位置
        if (td.originCol == nowTdCol && td.originRow == nowTdRow) {
          insertPos = [td.row, td.col + (type == "after" ? td.colSpan : 0)];
          break;
        }
      }
      if (insertPos.length == 0) return;
      // 从上到下遍历整个表格当前列
      for (let row = 0; row < tdMap.length; row++) {
        const downTd = tdMap[row][insertPos[1]];
        // 如果不存在，那么说明是插在最后
        if (!downTd) {
          Transforms.insertNodes(editor, getInsertCells(), {
            at: [
              ...tbody[1],
              row,
              tbody[0]?.children?.[row]?.children?.length || 0,
            ],
          });
          continue;
        }
        const downTdOriginPos = [
          ...tbody[1],
          downTd.originRow,
          downTd.originCol,
        ];
        if (downTd.col == insertPos[1]) {
          Transforms.insertNodes(editor, getInsertCells(), {
            at: [...tbody[1], row, downTd.originCol],
          });
        } else {
          Transforms.setNodes(
            editor,
            {
              colSpan: downTd.colSpan + 1,
            },
            {
              at: downTdOriginPos,
            }
          );
          row += downTd.rowSpan - 1;
        }
      }
    }
  },
  insertRow(editor: EditorType, type: "after" | "before", count: number = 1) {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const [nowTd] = Editor.nodes(editor, {
        mode: "lowest",
        match(n) {
          return TableLogic.isTd(n);
        },
      });
      if (!nowTd) return;
      const nowTr = Editor.parent(editor, nowTd[1]);
      if (!nowTr) return;
      const tbody = Editor.parent(editor, nowTr[1]);
      if (!tbody) return;
      const { tdMap } = TdLogic.getTdMap(tbody);
      if (
        !Element.isElement(nowTd[0]) ||
        !Element.isElement(nowTd[0]) ||
        !Element.isElement(tbody[0])
      )
        return;

      const insertNode = {
        type: CET.TD,
        children: [
          {
            type: CET.DIV,
            children: [{ text: "" }],
          },
        ],
      };

      // 首先找到第一插入点
      const [nowTdRow, nowTdCol] = nowTd[1].slice(nowTd[1].length - 2);
      let insertRow = -1;
      for (let i = 0; i < tdMap[nowTdRow].length; i++) {
        const td = tdMap[nowTdRow][i];
        // 找到当前td在tdMap中的位置
        if (td.originCol == nowTdCol && td.originRow == nowTdRow) {
          insertRow = td.row + (type == "after" ? td.rowSpan : 0);
          break;
        }
      }
      if (insertRow == -1) return;

      const getInsertRow = (tdCount: number) => {
        return new Array(count).fill(0).map(() => {
          return _.cloneDeep({
            type: CET.TR,
            children: new Array(tdCount).fill(0).map(() => {
              return _.cloneDeep(insertNode);
            }),
          });
        });
      };

      // 最后一行的插入
      if (tdMap[insertRow] == null) {
        Transforms.insertNodes(editor, getInsertRow(tdMap[0].length), {
          at: [...tbody[1], insertRow],
        });
        return;
      }

      // 找到tdMap中的当前行
      let tdCount = 0;
      for (let i = 0; i < tdMap[insertRow].length; i++) {
        const td = tdMap[insertRow][i];
        if (td.row == insertRow) {
          tdCount++;
        } else {
          Transforms.setNodes(
            editor,
            {
              rowSpan: td.rowSpan + 1,
            },
            {
              at: [...tbody[1], td.originRow, td.originCol],
            }
          );
          i += td.colSpan - 1;
        }
      }

      Transforms.insertNodes(editor, getInsertRow(tdCount), {
        at: [...tbody[1], insertRow],
      });
    }
  },
  splitTd(editor: EditorType) {
    let selectedTds = Editor.nodes(editor, {
      at: [],
      reverse: true,
      match(n) {
        return TableLogic.isTd(n) && n.selected == true;
      },
    });
    if (!selectedTds) return;

    let tbody = null;
    for (const [td, tdPath] of selectedTds) {
      if (!Element.isElement(td)) continue;
      Transforms.setNodes(editor, { colSpan: 1, rowSpan: 1 }, { at: tdPath });
      Transforms.unsetNodes(editor, ["selected", "start"], { at: tdPath });
      if ((!td.colSpan || td.colSpan < 2) && (!td.rowSpan || td.rowSpan < 2))
        continue;

      if (!tbody) {
        tbody = Editor.above(editor, {
          at: tdPath,
          mode: "lowest",
          match(n) {
            return Element.isElement(n) && n.type == CET.TBODY;
          },
        });
        if (!tbody) continue;
      }

      const belongTr = Editor.parent(editor, tdPath),
        tdCol = tdPath[tdPath.length - 1],
        tdRow = tdPath[tdPath.length - 2],
        tdColSpan = td.colSpan || 1,
        tdRowSpan = td.rowSpan || 1;
      let leftSumColSpan = 0;
      for (let i = 0; i < tdCol; i++) {
        leftSumColSpan =
          leftSumColSpan + (belongTr[0]?.children?.[i]?.colSpan || 1);
      }

      // 找到当前tr应该插入新td的位置
      const findInsertCol = (tr: NodeEntry) => {
        let sumColSpan = 0;
        for (let i = 0; i < tr[0].children.length; i++) {
          sumColSpan = sumColSpan + (tr[0].children[i].colSpan || 1);
          if (sumColSpan == leftSumColSpan) return i + 1;
        }
        return 0;
      };

      for (let row = tdRow, count = 0; count < tdRowSpan; count++, row++) {
        const isInNowTr = row == tdRow;
        const insertCol = findInsertCol(
          Editor.node(editor, [...tbody[1], row])
        );

        // 插入几个td
        const insertTdCount = tdColSpan - (isInNowTr ? 1 : 0);
        Transforms.insertNodes(
          editor,
          new Array(insertTdCount).fill(0).map(() => {
            return _.cloneDeep({
              type: CET.TD,
              children: [
                {
                  type: CET.DIV,
                  children: [{ text: "" }],
                },
              ],
            });
          }),
          {
            at: [...tbody[1], row, insertCol + (isInNowTr ? 1 : 0)],
          }
        );
      }
      TableLogic.splitTd(editor);
      return;
    }
  },
  mergeTd(editor: EditorType) {
    if (editor.selection && !Range.isExpanded(editor.selection)) return;

    const [selectedTd, secTd] = Editor.nodes(editor, {
      at: [],
      match(n) {
        return TableLogic.isTd(n) && n.selected == true;
      },
    });
    if (!selectedTd || secTd == null) return;

    const tbody = Editor.above(editor, {
      at: selectedTd[1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody) return;

    const selectedTds = TdLogic.getSelectedTd(tbody);
    if (!selectedTds) return;
    const tbodyPath = tbody[1];
    const tds = Array.from(selectedTds?.keys());

    tds.sort((a, b) => {
      if (a.row > b.row) {
        return 1;
      }
      if (a.row == b.row) {
        return a.col - b.col;
      }
      return -1;
    });

    let firstTd = tds[0];
    let maxColSpan = 0,
      maxRowSpan = 0;
    tds.forEach((td) => {
      maxColSpan = Math.max(maxColSpan, td.colSpan + td.col - firstTd.col);
      maxRowSpan = Math.max(maxRowSpan, td.rowSpan + td.row - firstTd.row);
    });

    const newTdPath = [...tbodyPath, firstTd.originRow, firstTd.originCol];
    Transforms.setNodes(
      editor,
      {
        colSpan: maxColSpan,
        rowSpan: maxRowSpan,
      },
      { at: newTdPath }
    );

    const firstTdEntry = Editor.node(editor, newTdPath);
    tds.forEach((td) => {
      if (td.col == firstTd.col && td.row == firstTd.row) return;
      const tdPath = [...tbodyPath, td.originRow, td.originCol];
      for (const [, childP] of Node.children(editor, tdPath, {
        reverse: true,
      })) {
        if (Editor.string(editor, childP, { voids: true }) == "") continue;
        Transforms.moveNodes(editor, {
          at: childP,
          to: [...firstTdEntry[1], firstTdEntry[0].children.length],
        });
      }
      Transforms.setNodes(editor, { toBeDeleted: true }, { at: tdPath });
    });

    Transforms.removeNodes(editor, {
      at: [],
      match(n) {
        return TableLogic.isTd(n) && n.toBeDeleted == true;
      },
    });
  },
  deleteTable(editor: EditorType) {
    const table = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTable(n);
      },
    });
    if (!table) return;
    Transforms.removeNodes(editor, { at: table[1] });
  },
  insertDivAfterTable(editor: EditorType) {
    if (editor.selection && !Range.isCollapsed(editor.selection)) return;
    const table = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTable(n);
      },
    });
    if (!table) return;
    const nextPath = utils.getPath(table[1], "next");
    Transforms.insertNodes(
      editor,
      {
        type: CET.DIV,
        children: [{ text: "" }],
      },
      { at: nextPath }
    );
  },
  insertDivBeforeTable(editor: EditorType) {
    if (editor.selection && !Range.isCollapsed(editor.selection)) return;
    const table = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTable(n);
      },
    });
    if (!table) return;
    Transforms.insertNodes(
      editor,
      {
        type: CET.DIV,
        children: [{ text: "" }],
      },
      { at: table[1] }
    );
  },
};
