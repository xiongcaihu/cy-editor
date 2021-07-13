/* eslint-disable eqeqeq */
import _ from "lodash";
import { useContext, useRef } from "react";
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
import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlateStatic,
} from "slate-react";
import { CET, CustomElement, EditorType, Marks } from "../common/Defines";
import { utils } from "../common/utils";
import { EditorContext } from "../RichEditor";
import { customTdShape, TdLogic, tdMinHeight, tdMinWidth } from "./Td";
import {
  getStrPathSetOfSelectedTds,
  getEditingTdsPath,
  setStrPathSetOfSelectedTds,
  setEditingTdsPath,
  setCopyedCells,
  setCopyedMaxRowAndCol,
  getCopyedCells,
  getCopyedMaxRowAndCol,
  getCopyedContent,
} from "../common/globalStore";
import { message } from "antd";
import { useEffect } from "react";
declare module "react" {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    border?: any;
  }
}

export const Table: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const ref = useRef<{
    isBeginSelectTd: boolean;
    mouseDownStartPoint: any;
    preMouseOnTdPath: Path | null; //  鼠标移动时，记录上一次所处的td
    lastSelectedPaths: Path[];
    initX: number;
    initY: number;
    prePath: Path | null;
  }>({
    isBeginSelectTd: false,
    mouseDownStartPoint: null,
    initX: 0,
    initY: 0,
    lastSelectedPaths: [],
    preMouseOnTdPath: null,
    prePath: null,
  });

  const { savedMarks, setSavedMarks } = useContext(EditorContext);

  const editor = useSlateStatic();
  const readOnly = useReadOnly();

  const reCalcTdWidth = () => {
    const selfDom = attributes.ref.current;
    if (!selfDom) return;
    const nowWrapperWidth = selfDom?.offsetWidth - 2;
    const preWrapperWidth = element.wrapperWidthWhenCreated;
    const tableDom = selfDom.querySelector(":scope>table");
    if (!tableDom || nowWrapperWidth == null || preWrapperWidth == null) return;
    if (preWrapperWidth != nowWrapperWidth) {
      const tableNode = ReactEditor.toSlateNode(editor, selfDom);
      if (!tableNode) return;
      const tablePath = ReactEditor.findPath(editor, tableNode);
      if (!tablePath) return;
      const trs = Array.from(tableDom.querySelectorAll(":scope>tbody>tr"));
      trs.forEach((tr: any, rowIndex) => {
        const tds = Array.from(tr.querySelectorAll(":scope>td"));
        tds.forEach((td: any, cellIndex) => {
          const tdNode = ReactEditor.toSlateNode(editor, td);
          if (!Element.isElement(tdNode)) return;
          const width =
            ((tdNode.width || tdMinWidth) / preWrapperWidth) * nowWrapperWidth;
          Transforms.setNodes(
            editor,
            { width },
            { at: [...tablePath, 0, rowIndex, cellIndex] }
          );
        });
      });
      Transforms.setNodes(
        editor,
        { wrapperWidthWhenCreated: nowWrapperWidth },
        { at: tablePath }
      );
    }
  };

  useEffect(() => {
    // 每次渲染时，判断自己当前的容器宽度是否和之前保存的宽度一致，如果不一致，则计算内部所有td的新的宽度
    reCalcTdWidth();
    // 每次渲染时，判断自己的位置和之前的位置相比是否变化，如果变化，需要重新计算自己内部td的状态
    const path = ReactEditor.findPath(editor, element);
    if (
      ref.current.prePath != null &&
      !Path.equals(path, ref.current.prePath)
    ) {
      TableLogic.resetSelectedTds(editor);
    }
    ref.current.prePath = path;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // 找到需要取消选择和新选择的td的完整的path
  const findPath = (nowSelectedTds: Path[], preSelectedTds: Path[]) => {
    const nowSelectedTdsPathSet = new Set(
      nowSelectedTds.map((o) => o.slice(o.length - 2).join(","))
    );

    const preSelectedTdsPathSet = new Set(
      preSelectedTds.map((o) => o.slice(o.length - 2).join(","))
    );

    const deselectedPath = preSelectedTds.filter((path) => {
      return !nowSelectedTdsPathSet.has(path.slice(path.length - 2).join(","));
    });

    const newSelectedPath = nowSelectedTds.filter((path) => {
      return !preSelectedTdsPathSet.has(path.slice(path.length - 2).join(","));
    });

    return { deselectedPath, newSelectedPath };
  };

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
    const deselectTds = () => {
      ref.current.lastSelectedPaths.forEach((p) => {
        Transforms.unsetNodes(editor, ["selected", "start"], {
          at: p,
        });
      });
      ref.current.lastSelectedPaths = [];
    };

    ref.current.lastSelectedPaths.forEach((p) => {
      const td = Editor.node(editor, p);
      if (td && Element.isElement(td[0]) && td[0].start == true) {
        Transforms.unsetNodes(editor, ["start"], {
          at: p,
        });
      }
    });

    if (Path.equals(paTd[1], pbTd[1])) {
      deselectTds();
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
    ) {
      deselectTds();
      return;
    }

    // 找到两个点同一层级的td
    const tda = Editor.above(editor, {
      at: pa,
      mode: "highest",
      match(n, p) {
        return TableLogic.isTd(n) && p.length > commonNode[1].length;
      },
    });
    if (!tda) return;
    Transforms.setNodes(
      editor,
      { start: true, selected: true },
      { at: tda[1] }
    );
    const tdb = Editor.above(editor, {
      at: pb,
      mode: "highest",
      match(n, p) {
        return TableLogic.isTd(n) && p.length > commonNode[1].length;
      },
    });
    if (!tdb) return;
    Transforms.setNodes(
      editor,
      { start: true, selected: true },
      { at: tdb[1] }
    );

    const tbody = Editor.above(editor, {
      at: tda[1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody || !Element.isElement(tbody[0])) return;

    const selectedTds = TdLogic.getSelectedTdInTdMap(tbody);
    if (selectedTds == null) return;
    const nowTdsPath = Array.from(selectedTds.keys()).map((o) => [
      ...tbody[1],
      o.originRow,
      o.originCol,
    ]);

    const { deselectedPath, newSelectedPath } = findPath(
      nowTdsPath,
      ref.current.lastSelectedPaths
    );

    for (const path of newSelectedPath) {
      Transforms.setNodes(editor, { selected: true }, { at: path });
    }

    for (const path of deselectedPath) {
      Transforms.unsetNodes(editor, ["selected", "start"], { at: path });
    }

    ref.current.lastSelectedPaths = nowTdsPath;
  }, 5);

  const mousedownFunc = (e: any) => {
    // 防止事件冒泡到父元素的td
    e.stopPropagation();
    try {
      const slateNode = ReactEditor.toSlateNode(editor, e.target);
      const path = ReactEditor.findPath(editor, slateNode);
      ref.current.initX = e.clientX;
      ref.current.initY = e.clientY;

      ref.current.preMouseOnTdPath = null;
      ref.current.lastSelectedPaths = [];

      const tdDom = e.nativeEvent.path.find((e: any) => {
        return e.tagName == "TD";
      });
      if (!tdDom) return;

      if (
        !readOnly &&
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
        ref.current.preMouseOnTdPath = path;

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
          overflowX: "auto",
          overflowY: "hidden",
          borderCollapse: "collapse",
        }}
        onMouseDown={mousedownFunc}
        onMouseUp={() => {
          if (savedMarks) {
            const copyMarks: any = {};
            const hasSelectTd = TableLogic.getSelectedTdsSize(editor);
            for (const key of Object.values(Marks)) {
              copyMarks[key] = savedMarks[key];
            }
            if (hasSelectTd > 0) {
              const selectedTdsPath = TableLogic.getSelectedTdsPath(editor);
              for (const path of selectedTdsPath) {
                Transforms.setNodes(editor, copyMarks, {
                  at: path,
                });
              }
              setSavedMarks(null);
              return;
            }
          }
        }}
      >
        {children}
      </table>
    </div>
  );
};

const getEditingOrSelectedTdBelongTable = (editor: Editor) => {
  const td = TableLogic.getFirstSelectedTd(editor);
  let table;
  if (td) {
    table = Editor.above(editor, {
      mode: "lowest",
      at: td[1],
      match(n) {
        return TableLogic.isTable(n);
      },
    });
  } else if (editor.selection) {
    table = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTable(n);
      },
    });
  }
  return table;
};

export const TableLogic = {
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
                  width: 100,
                  height: 50,
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

    if (Element.isElement(node) && [CET.TABLE].includes(node.type)) {
      // 如果table的子元素里含有其他非tbody的标签，删除
      for (const [child, childP] of Node.children(editor, path, {
        reverse: true,
      })) {
        if (child.type != CET.TBODY) {
          Transforms.removeNodes(editor, { at: childP });
          return;
        }
      }
    }

    // tbody校验规则
    if (Element.isElement(node) && [CET.TBODY].includes(node.type)) {
      // 如果tbody的父元素不是table，则删除
      const [parent] = utils.getParent(editor, path);
      if (!(Element.isElement(parent) && parent.type == CET.TABLE)) {
        Transforms.removeNodes(editor, { at: path });
        return true;
      }
      for (const [child, childP] of Node.children(editor, path, {
        reverse: true,
      })) {
        if (child.type != CET.TR) {
          Transforms.removeNodes(editor, { at: childP });
          return;
        }
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
      for (const [child, childP] of Node.children(editor, path, {
        reverse: true,
      })) {
        if (child.type != CET.TD) {
          Transforms.removeNodes(editor, { at: childP });
          return;
        }
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
    const selectedTd = TableLogic.getFirstSelectedTd(editor);
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
    const selectedTds = Array.from(
      TdLogic.getSelectedTdInTdMap(tbody)?.keys() || []
    );
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

    TableLogic.resetSelectedTds(editor);
  },
  deleteColumn(editor: EditorType) {
    // 删除选区对应的列
    let deleteHArea: number[] = [Infinity, -Infinity];
    const selectedTd = TableLogic.getFirstSelectedTd(editor);
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
    const selectedTds = Array.from(
      TdLogic.getSelectedTdInTdMap(tbody)?.keys() || []
    );
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

    TableLogic.resetSelectedTds(editor);
  },
  insertColumn(
    editor: EditorType,
    type: "before" | "after",
    count: number = 1
  ) {
    let nowTd = TableLogic.getFirstSelectedTd(editor);
    // 如果没有选中的td，那么就从光标位置找
    if (!nowTd && editor.selection) {
      [nowTd] = Editor.nodes(editor, {
        mode: "lowest",
        match(n) {
          return TableLogic.isTd(n);
        },
      });
    }
    if (!nowTd) return;
    const nowTr = Editor.parent(editor, nowTd[1]);
    if (!nowTr) return;
    const tbody = Editor.parent(editor, nowTr[1]);
    if (!tbody) return;
    const { tdMap } = TdLogic.getTdMap(tbody);
    const selectedTds = TdLogic.getSelectedTdInTdMap(tbody);
    if (
      !Element.isElement(nowTd[0]) ||
      !Element.isElement(nowTd[0]) ||
      !Element.isElement(tbody[0])
    )
      return;

    const editorDom = ReactEditor.toDOMNode(editor, editor);

    const getInsertCells = (): CustomElement[] => {
      return _.cloneDeep(
        new Array(count).fill(0).map(() => {
          return _.cloneDeep({
            type: CET.TD,
            width: editorDom.offsetWidth / 10,
            height: tdMinHeight,
            children: [
              {
                type: CET.DIV,
                children: [{ text: "" }],
              },
            ],
          } as CustomElement);
        })
      );
    };

    // 首先找到第一插入点
    const [nowTdRow, nowTdCol] = nowTd[1].slice(nowTd[1].length - 2);
    let insertCol;
    if (selectedTds && selectedTds.size > 0) {
      insertCol = type == "after" ? -Infinity : Infinity;
      for (const tdInTdMap of selectedTds.keys()) {
        insertCol =
          type == "after"
            ? Math.max(insertCol, tdInTdMap.col + tdInTdMap.colSpan)
            : Math.min(insertCol, tdInTdMap.col);
      }
    } else {
      insertCol = -1;
      for (let i = 0; i < tdMap[nowTdRow].length; i++) {
        const td = tdMap[nowTdRow][i];
        // 找到当前td在tdMap中的位置
        if (td.originCol == nowTdCol && td.originRow == nowTdRow) {
          insertCol = td.col + (type == "after" ? td.colSpan : 0);
          break;
        }
      }
    }
    if (insertCol == null || !Number.isFinite(insertCol)) return;
    // 从上到下遍历整个表格当前列
    for (let row = 0; row < tdMap.length; row++) {
      const downTd = tdMap[row][insertCol] as customTdShape;
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
      const downTdOriginPos = [...tbody[1], downTd.originRow, downTd.originCol];
      if (downTd.col == insertCol) {
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
    TableLogic.resetSelectedTds(editor);
  },
  insertRow(editor: EditorType, type: "after" | "before", count: number = 1) {
    let nowTd = TableLogic.getFirstSelectedTd(editor);
    // 如果没有选中的td，那么就从光标位置找
    if (!nowTd && editor.selection) {
      [nowTd] = Editor.nodes(editor, {
        mode: "lowest",
        match(n) {
          return TableLogic.isTd(n);
        },
      });
    }
    if (!nowTd) return;
    const nowTr = Editor.parent(editor, nowTd[1]);
    if (!nowTr) return;
    const tbody = Editor.parent(editor, nowTr[1]);
    if (!tbody) return;
    const { tdMap } = TdLogic.getTdMap(tbody);
    const selectedTds = TdLogic.getSelectedTdInTdMap(tbody);
    if (
      !Element.isElement(nowTd[0]) ||
      !Element.isElement(nowTd[0]) ||
      !Element.isElement(tbody[0])
    )
      return;

    const editorDom = ReactEditor.toDOMNode(editor, editor);

    const insertNode = {
      type: CET.TD,
      width: editorDom.offsetWidth / 10,
      height: tdMinHeight,
      children: [
        {
          type: CET.DIV,
          children: [{ text: "" }],
        },
      ],
    };

    // 首先找到第一插入点
    const [nowTdRow, nowTdCol] = nowTd[1].slice(nowTd[1].length - 2);
    let insertRow;
    if (selectedTds && selectedTds.size > 0) {
      insertRow = type == "after" ? -Infinity : Infinity;
      for (const tdInTdMap of selectedTds.keys()) {
        insertRow =
          type == "after"
            ? Math.max(insertRow, tdInTdMap.row + tdInTdMap.rowSpan)
            : Math.min(insertRow, tdInTdMap.row);
      }
    } else {
      insertRow = -1;
      for (let i = 0; i < tdMap[nowTdRow].length; i++) {
        const td = tdMap[nowTdRow][i];
        // 找到当前td在tdMap中的位置
        if (td.originCol == nowTdCol && td.originRow == nowTdRow) {
          insertRow = td.row + (type == "after" ? td.rowSpan : 0);
          break;
        }
      }
    }
    if (insertRow == -1 || !Number.isFinite(insertRow)) return;

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
      const td = tdMap[insertRow][i] as customTdShape;
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

    TableLogic.resetSelectedTds(editor);
  },
  splitTd(editor: EditorType) {
    const selectedTds = Editor.nodes(editor, {
      at: [],
      match(n) {
        return TableLogic.isSelectedTd(n);
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
      TableLogic.resetSelectedTds(editor);
      return;
    }
  },
  mergeTd(editor: EditorType) {
    const isOnlyOne = TableLogic.getSelectedTdsSize(editor) == 1;

    const selectedTd = TableLogic.getFirstSelectedTd(editor);
    if (!selectedTd || isOnlyOne == null) return;

    const tbody = Editor.above(editor, {
      at: selectedTd[1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type == CET.TBODY;
      },
    });
    if (!tbody) return;

    const selectedTds = TdLogic.getSelectedTdInTdMap(tbody);
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

    TableLogic.resetSelectedTds(editor);
  },
  deleteTable(editor: EditorType) {
    const table = getEditingOrSelectedTdBelongTable(editor);
    if (!table) return;
    Transforms.removeNodes(editor, { at: table[1] });
    TableLogic.resetSelectedTds(editor);
  },
  insertDivAfterTable(editor: EditorType) {
    const table = getEditingOrSelectedTdBelongTable(editor);

    if (!table) return;
    const nextPath = utils.getPath(table[1], "next");
    Transforms.insertNodes(
      editor,
      {
        type: CET.DIV,
        children: [{ text: "write something..." }],
      },
      { at: nextPath }
    );
    TableLogic.resetSelectedTds(editor);
  },
  insertDivBeforeTable(editor: EditorType) {
    const table = getEditingOrSelectedTdBelongTable(editor);

    if (!table) return;
    Transforms.insertNodes(
      editor,
      {
        type: CET.DIV,
        children: [{ text: "write something..." }],
      },
      { at: table[1] }
    );
    TableLogic.resetSelectedTds(editor);
  },
  getSelectedTdsPath(editor: EditorType) {
    const selectedTds = getStrPathSetOfSelectedTds(editor);
    const pathArr = [];
    for (const tdStrPath of selectedTds) {
      const path: Path = tdStrPath.split(",").map((o) => +o);
      pathArr.push(path);
    }
    return pathArr;
  },
  getSelectedTds(editor: EditorType) {
    const selectedTds = getStrPathSetOfSelectedTds(editor);
    const tdArr = [];
    for (const tdStrPath of selectedTds) {
      const path: Path = tdStrPath.split(",").map((o) => +o);
      const td = Editor.node(editor, path);
      tdArr.push(td);
    }
    return tdArr;
  },
  getFirstSelectedTd(editor: EditorType) {
    const selectedTds = getStrPathSetOfSelectedTds(editor);
    const arr = Array.from(selectedTds).sort((a, b) =>
      a > b ? 1 : a === b ? 0 : -1
    );
    if (arr.length == 0) return null;

    const path: Path = arr[0].split(",").map((o) => +o);
    const td = Editor.node(editor, path);
    return td;
  },
  getEditingTds(editor: EditorType) {
    const editingTdsPath = getEditingTdsPath(editor);
    const arr = [];
    for (const tdStrPath of editingTdsPath) {
      const path: Path = tdStrPath.split(",").map((o) => +o);
      arr.push(Editor.node(editor, path));
    }
    return arr;
  },
  getEditingTdsPath(editor: EditorType): Set<string> {
    return getEditingTdsPath(editor);
  },
  getSelectedTdsSize(editor: EditorType) {
    return getStrPathSetOfSelectedTds(editor).size;
  },
  resetSelectedTds(editor: EditorType) {
    const tdsPath = Array.from(
      Editor.nodes(editor, {
        at: [],
        match(n) {
          return TableLogic.isSelectedTd(n);
        },
      })
    ).map((o) => o[1].join(","));

    setStrPathSetOfSelectedTds(new Set(tdsPath));

    const editingTdsPath = Array.from(
      Editor.nodes(editor, {
        at: [],
        match(n) {
          return TableLogic.isTd(n) && n.canTdEdit == true;
        },
      })
    ).map((o) => o[1].join(","));

    setEditingTdsPath(new Set(editingTdsPath));
  },
  copyCells(editor: EditorType) {
    const selectedTds = TableLogic.getSelectedTds(editor);
    setCopyedCells(
      selectedTds.sort((a, b) => {
        const [arow, acol] = a[1].slice(a[1].length - 2);
        const [brow, bcol] = b[1].slice(b[1].length - 2);
        return arow > brow ? 1 : arow === brow ? acol - bcol : -1;
      })
    );
    const tbody = Editor.above(editor, {
      at: selectedTds[0][1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type === CET.TBODY;
      },
    });
    if (!tbody) return;
    const tds = Array.from(
      TdLogic.getSelectedTdInTdMap(tbody)?.keys() || ([] as customTdShape[])
    );
    const { startPoins } = TdLogic.getTdMap(tbody);
    let areaWidth = 0,
      areaHeight = 0;
    tds.forEach((td) => {
      const { row, col } = td;
      areaWidth = Math.max(
        col + (td.colSpan || 1) - startPoins[0].col,
        areaWidth
      );
      areaHeight = Math.max(
        row + (td.rowSpan || 1) - startPoins[0].row,
        areaHeight
      );
    });
    setCopyedMaxRowAndCol({
      copyedAreaWidth: areaWidth,
      copyedAreaHeight: areaHeight,
    });
  },
  pasteCells(editor: EditorType) {
    const copyedContent = getCopyedContent();
    if (copyedContent) {
      // 将复制的内容全部加入到选择的td中
      const selectedTdsPath = Array.from(TableLogic.getSelectedTdsPath(editor));
      TdLogic.clearTd(editor);
      for (const path of selectedTdsPath) {
        Transforms.insertNodes(editor, _.cloneDeep(copyedContent), {
          at: [...path, 0],
        });
        Transforms.removeNodes(editor, {
          at: [...path, Array.from(Node.children(editor, path)).length - 1],
        });
      }
      return;
    }
    // 检查复制的单元格区域能否完全覆盖目标区域
    const copyedCells = getCopyedCells();
    if (!copyedCells) return;
    const { copyedAreaWidth: areaWidth, copyedAreaHeight: areaHeight } =
      getCopyedMaxRowAndCol();
    const selectedTds = Array.from(TableLogic.getSelectedTds(editor));
    const tbody = Editor.above(editor, {
      at: selectedTds[0][1],
      mode: "lowest",
      match(n) {
        return Element.isElement(n) && n.type === CET.TBODY;
      },
    });
    if (!tbody) return;
    // 如果复制的单元格只有一个，那么将选中的单元格的内容全部替换成复制的单元格内容
    if (copyedCells.length == 1) {
      const copyedTd = copyedCells[copyedCells.length - 1];
      if (!copyedTd) return;
      selectedTds.forEach((td) => {
        let childLength = td[0].children.length;
        Transforms.insertNodes(editor, _.cloneDeep(copyedTd[0].children), {
          at: [...td[1], 0],
        });
        for (const [, childP] of Node.children(editor, td[1], {
          reverse: true,
        })) {
          if (childLength-- == 0) break;
          Transforms.removeNodes(editor, {
            at: childP,
          });
        }
      });
      return;
    }
    const { tdMap, startPoins } = TdLogic.getTdMap(tbody);
    const startPoint = startPoins[0];
    if (
      startPoint.row + areaHeight > tdMap.length ||
      startPoint.col + areaWidth > tdMap[0].length
    ) {
      message.error("无法完整覆盖目标区域");
      return false;
    }
    const waitToDeleteTdsPath = [];
    // 验证覆盖区域是否合法
    for (
      let row = startPoint.row;
      row < tdMap.length && row < startPoint.row + areaHeight;
      row++
    ) {
      for (
        let col = startPoint.col;
        col < tdMap[0].length && col < startPoint.col + areaWidth;
        col++
      ) {
        const td = tdMap[row][col];
        waitToDeleteTdsPath.unshift([td.originRow, td.originCol]);
        if (
          td.col < startPoint.col ||
          td.col + td.colSpan > startPoint.col + areaWidth ||
          td.row < startPoint.row ||
          td.row + td.rowSpan > startPoint.row + areaHeight
        ) {
          message.error("无法完整覆盖目标区域");
          return false;
        }
      }
    }

    // 缓存之前复制的td
    _.uniqWith(waitToDeleteTdsPath, (a, b) => {
      return a.join(",") === b.join(",");
    }).forEach((path) => {
      Transforms.removeNodes(editor, { at: [...tbody[1], ...path] });
    });

    let minRow = copyedCells.slice().reduce((p, c) => {
      return Math.min(p, c[1][c[1].length - 2]);
    }, Infinity);

    for (
      let row = startPoint.row, nowCopyedCellsRow = minRow;
      row < startPoint.row + areaHeight;
      row++, nowCopyedCellsRow++
    ) {
      const td = tdMap[row][startPoint.col];
      const insertTds: any[] = [];
      copyedCells.forEach((td) => {
        const path = td[1];
        if (path[path.length - 2] === nowCopyedCellsRow) {
          insertTds.push({
            ...td[0],
            selected: false,
            start: false,
            canTdEdit: false,
          });
        }
      });
      insertTds.length > 0 &&
        Transforms.insertNodes(editor, _.cloneDeep(insertTds), {
          at: [...tbody[1], row, td.originCol],
        });
    }

    TdLogic.deselectAllTd(editor);
    TableLogic.resetSelectedTds(editor);
  },
};
