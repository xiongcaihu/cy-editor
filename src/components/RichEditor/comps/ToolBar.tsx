/* eslint-disable eqeqeq */
import { Button } from "antd";
import { Editor, Node, Transforms, Element, Range, NodeEntry } from "slate";
import { useSlate } from "slate-react";
import { CET, Marks } from "../common/Defines";
import { ListLogic } from "./ListComp";
import { TableLogic } from "../comps/Table";
import { utils } from "../common/utils";

export const ToolBar = () => {
  const editor = useSlate();
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

    const selectedTds = TableLogic.getSelectedTd(tbody);
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

  const splitTd = () => {
    const selectedTds = Editor.nodes(editor, {
      at: [],
      reverse: true,
      match(n) {
        return TableLogic.isTd(n) && n.selected == true;
      },
    });

    let tbody;
    for (const [td, tdPath] of selectedTds) {
      // fill col
      if (!Element.isElement(td)) continue;
      Transforms.setNodes(editor, { colSpan: 1, rowSpan: 1 }, { at: tdPath });
      Transforms.unsetNodes(editor, ["selected", "start"], { at: tdPath });
      if ((!td.colSpan || td.colSpan < 2) && (!td.rowSpan || td.rowSpan < 2))
        continue;

      if (tbody == null) {
        tbody = Editor.above(editor, {
          at: tdPath,
          mode: "lowest",
          match(n) {
            return Element.isElement(n) && n.type == CET.TBODY;
          },
        });
        if (!tbody) return;
      }

      const nowTr = Editor.parent(editor, tdPath);
      let leftSumColSpan = 0;
      for (let i = 0; i < tdPath[tdPath.length - 1]; i++) {
        leftSumColSpan = leftSumColSpan + (nowTr[0].children[i].colSpan || 1);
      }
      const findInsertCol = (tr: NodeEntry) => {
        let sumColSpan = 0;
        for (let i = 0; i < tr[0].children.length; i++) {
          sumColSpan = sumColSpan + (tr[0].children[i].colSpan || 1);
          if (sumColSpan == leftSumColSpan) return i + 1;
        }
        return 0;
      };

      for (
        let row = tdPath[tdPath.length - 2], count = 0;
        count < (td.rowSpan || 1);
        count++, row++
      ) {
        const isInNowTr = row == tdPath[tdPath.length - 2];
        const insertCol = findInsertCol(
          Editor.node(editor, [...tbody[1], row])
        );
        console.log(insertCol);
        for (let i = 0; i < (td.colSpan || 1) - (isInNowTr ? 1 : 0); i++) {
          Transforms.insertNodes(
            editor,
            {
              type: CET.TD,
              children: [
                {
                  type: CET.DIV,
                  children: [{ text: "" }],
                },
              ],
            },
            {
              at: [...tbody[1], row, insertCol + (isInNowTr ? 1 : 0)],
            }
          );
        }
      }
      splitTd();
      return;
    }
  };

  const insertRowAfter = () => {};

  const insertRowBefore = () => {};

  const insertColumnAfter = () => {};

  const insertColumnBefore = () => {};

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
          insertColumnAfter();
        }}
      >
        insertColumnAfter
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();
          insertColumnBefore();
        }}
      >
        insertColumnBefore
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();
          insertRowAfter();
        }}
      >
        insertRowAfter
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();
          insertRowBefore();
        }}
      >
        insertRowBefore
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
      <Button
        onMouseDown={(e) => {
          e.preventDefault();

          insertDivAfterTable();
        }}
      >
        insertDivAfterTable
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();

          insertDivBeforeTable();
        }}
      >
        insertDivBeforeTable
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();

          deleteTable();
        }}
      >
        deleteTable
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();

          mergeTd();
        }}
      >
        mergeTd
      </Button>
      <Button
        onMouseDown={(e) => {
          e.preventDefault();

          splitTd();
        }}
      >
        splitTd
      </Button>
    </div>
  );
};
