/* eslint-disable eqeqeq */
import { Button } from "antd";
import { Editor, Transforms, Element, Range, Node, Path } from "slate";
import { useSlate } from "slate-react";
import { CET, Marks } from "../common/Defines";
import { ListLogic } from "./ListComp";
import { TableLogic } from "../comps/Table";
import { utils } from "../common/utils";
import _ from "lodash";

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
    const tds = Editor.nodes(editor, {
      mode: "all",
      reverse: true,
      match(n) {
        return TableLogic.isTd(n);
      },
    });

    let prePath: Path = [],
      preNode: Node = {} as Node;
    for (const [n, p] of tds) {
      if (
        p &&
        prePath &&
        Element.isElement(preNode) &&
        Element.isElement(n) &&
        prePath.length == p.length &&
        _.last(prePath) == (_.last(p) || 0) + 1
      ) {
        Transforms.mergeNodes(editor, { at: prePath });
        Transforms.setNodes(
          editor,
          { colSpan: (preNode.colSpan || 1) + (n.colSpan || 1) },
          { at: p }
        );
        mergeTd();
        return;
      }
      prePath = p;
      preNode = n;
    }
  };

  const splitTd = () => {
    const textWrappers = Editor.nodes(editor, {
      mode: "lowest",
      reverse: true,
      match(n) {
        return utils.isTextWrapper(n);
      },
    });

    for (const [, p] of textWrappers) {
      const td = utils.getParent(editor, p);
      if (
        td.length > 0 &&
        TableLogic.isTd(td[0]) &&
        Element.isElement(td[0]) &&
        (td[0].colSpan || 1) > 1
      ) {
        const addTdCount = (td[0].colSpan || 1) - 1;
        Transforms.setNodes(editor, { colSpan: 1 }, { at: td[1] });
        Transforms.insertNodes(
          editor,
          new Array(addTdCount).fill(0).map((item) => {
            return {
              type: CET.TD,
              children: [{ type: CET.DIV, children: [{ text: "" }] }],
            };
          }),
          {
            at: utils.getPath(td[1], "next"),
          }
        );
        splitTd();
        return;
      }
    }
  };

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
