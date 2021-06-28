/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable eqeqeq */
import { Button, Dropdown, Menu, Tooltip, Row, Select } from "antd";
import {
  Editor,
  Node,
  Transforms,
  Element,
  Selection,
  Range,
  NodeEntry,
  Path,
} from "slate";
import { ReactEditor, useSlate } from "slate-react";
import { CET, Marks } from "../common/Defines";
import { ListLogic } from "./ListComp";
import { TableLogic } from "../comps/Table";
import { utils } from "../common/utils";
import _ from "lodash";
import { TdLogic } from "./Td";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import "./ToolBar.css";
import { useEffect, useRef, useState } from "react";

export const ToolBar = () => {
  const editor = useSlate();
  const ref = useRef<{
    preSelection: Selection | null;
  }>({
    preSelection: null,
  });
  const [dropdownMenuVisible, setDmvVisible] = useState(false);

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

  const getMarkValue = (mark: Marks) => {
    try {
      const marks = Editor.marks(editor);
      return marks?.[mark];
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const isBlockActive = (type: CET) => {
    try {
      const [match] = Editor.nodes(editor, {
        match: (n) => Element.isElement(n) && n.type === type,
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
    if (editor.selection && Range.isExpanded(editor.selection)) {
      Transforms.collapse(editor, { edge: "end" });
    }
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

  const insertTable = () => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const textWrapper = Editor.above(editor, {
        match(n) {
          return utils.isTextWrapper(n);
        },
      });
      if (textWrapper) {
        Transforms.insertNodes(
          editor,
          {
            type: CET.TABLE,
            children: [
              {
                type: CET.TBODY,
                children: [
                  {
                    type: CET.TR,
                    children: [
                      {
                        type: CET.TD,
                        children: [
                          {
                            type: CET.DIV,
                            children: [
                              {
                                text: "",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: CET.TD,
                        children: [
                          {
                            type: CET.DIV,
                            children: [
                              {
                                text: "",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: CET.TR,
                    children: [
                      {
                        type: CET.TD,
                        children: [
                          {
                            type: CET.DIV,
                            children: [
                              {
                                text: "",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: CET.TD,
                        children: [
                          {
                            type: CET.DIV,
                            children: [
                              {
                                text: "",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            at: utils.getPath(textWrapper[1], "next"),
          }
        );
      }
    }
  };

  const insertDivAfterTable = () => {
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
  };

  const insertDivBeforeTable = () => {
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
  };

  const deleteTable = () => {
    const table = Editor.above(editor, {
      mode: "lowest",
      match(n) {
        return TableLogic.isTable(n);
      },
    });
    if (!table) return;
    Transforms.removeNodes(editor, { at: table[1] });
  };

  const mergeTd = () => {
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
  };

  const splitTd: () => void = () => {
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
      splitTd();
      return;
    }
  };

  const insertRowAfter = () => {
    insertRow("after");
  };

  const insertRowBefore = () => {
    insertRow("before");
  };

  const insertColumn = (type: "before" | "after", count: number = 1) => {
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
  };

  const insertRow = (type: "after" | "before", count: number = 1) => {
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
  };

  const insertColumnAfter = () => {
    insertColumn("after");
  };

  const insertColumnBefore = () => {
    insertColumn("before");
  };

  const deleteColumn = () => {
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
  };

  const deleteRow = () => {
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
  };

  const clearTd = () => {
    TdLogic.clearTd(editor);
  };

  return (
    <div
      className="cyEditor__toolBar"
      style={{ position: "relative", marginBottom: 4 }}
    >
      <Row>
        <Button
          type={isBlockActive(CET.H1) ? "link" : "text"}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock(CET.H1);
          }}
        >
          H1
        </Button>
        <Button
          type={isBlockActive(CET.H2) ? "link" : "text"}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock(CET.H2);
          }}
        >
          H2
        </Button>
        <Tooltip title="字体大小" zIndex={99}>
          <div>
            <Select
              placeholder="字体大小"
              value={String(getMarkValue(Marks.FontSize) || 14)}
              style={{ width: 100 }}
              bordered={false}
              open={dropdownMenuVisible}
              onClick={(e: any) => {
                e.preventDefault();
                const isClickItem = e.nativeEvent.path.find((ele: any) => {
                  return ele.className == "rc-virtual-list-holder-inner";
                });
                if (editor.selection) {
                  ref.current.preSelection = editor.selection;
                }
                setTimeout(() => {
                  if (isClickItem) return;
                  ReactEditor.focus(editor);
                  ref.current.preSelection &&
                    Transforms.select(editor, ref.current.preSelection);
                  setDmvVisible(true);
                }, 0);
              }}
              onSelect={(value) => {
                ReactEditor.focus(editor);
                ref.current.preSelection &&
                  Transforms.select(editor, ref.current.preSelection);
                Editor.addMark(editor, Marks.FontSize, Number(value));
                setDmvVisible(false);
              }}
            >
              {[12, 13, 14, 15, 16, 19, 22, 24, 29, 32, 40, 48].map(
                (fontSize) => {
                  return (
                    <Select.Option value={String(fontSize)} key={fontSize}>
                      {fontSize}px
                    </Select.Option>
                  );
                }
              )}
            </Select>
          </div>
        </Tooltip>
        {/* 
        <Button
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            clearTd();
          }}
          type="link"
        >
          清空单元格
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();
            deleteColumn();
          }}
        >
          删除列
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();
            deleteRow();
          }}
        >
          删除行
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();
            insertColumnAfter();
          }}
        >
          后插入列
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();
            insertColumnBefore();
          }}
        >
          前插入列
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();
            insertRowAfter();
          }}
        >
          后插入行
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();
            insertRowBefore();
          }}
        >
          前插入行
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();

            insertDivAfterTable();
          }}
        >
          表格后插入文本
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();

            insertDivBeforeTable();
          }}
        >
          表格前插入文本
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();

            deleteTable();
          }}
        >
          删除表格
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();

            mergeTd();
          }}
        >
          合并单元格
        </Button>
        <Button
          onMouseDown={(e) => {
            e.preventDefault();

            splitTd();
          }}
        >
          拆分单元格
        </Button>
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
        </Button> */}
      </Row>
    </div>
  );
};
