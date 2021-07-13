/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable eqeqeq */
import {
  Col,
  Button as AntButton,
  Dropdown,
  Tooltip,
  Popover,
  Row,
  Select,
  Divider,
} from "antd";
import { Editor, Transforms, Element, Range, Text } from "slate";
import { ReactEditor, useSlate, useSlateStatic } from "slate-react";
import { CET, EditorType, Marks } from "../common/Defines";
import { ListLogic } from "./ListComp";
import { TableLogic } from "../comps/Table";
import { utils } from "../common/utils";
import _ from "lodash";
import { TdLogic, tdMinHeight } from "./Td";
import Icon, {
  BgColorsOutlined,
  BoldOutlined,
  SaveOutlined,
  ClearOutlined,
  DeleteColumnOutlined,
  DeleteOutlined,
  DeleteRowOutlined,
  FontColorsOutlined,
  InsertRowAboveOutlined,
  InsertRowBelowOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  ItalicOutlined,
  LinkOutlined,
  MergeCellsOutlined,
  OrderedListOutlined,
  PictureOutlined,
  SplitCellsOutlined,
  StrikethroughOutlined,
  TableOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
  FolderOpenOutlined,
  FormatPainterOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import "./ToolBar.css";
import React, { useContext, useMemo, useRef, useState } from "react";
import { CompactPicker } from "react-color";
import { EditorContext } from "../RichEditor";
import { useEffect } from "react";
import { slateToHtml } from "../common/slateToHtml";
import { htmlToSlate } from "../common/htmlToSlate";

const calcStatusDelay = 50;

const isSelectTd = (editor: EditorType) => {
  const hasSelectedTd = TableLogic.getFirstSelectedTd(editor);
  return hasSelectedTd == null;
};

export const cleanFormat = (editor: EditorType) => {
  const tds = TableLogic.getSelectedTds(editor);
  if (tds.length > 0) {
    for (const td of tds) {
      Transforms.unsetNodes(editor, Object.values(Marks), { at: td[1] });
    }
    return;
  }

  const all = Editor.nodes(editor, {
    mode: "lowest",
    match(n) {
      return utils.isTextWrapper(n) || Text.isText(n);
    },
  });
  for (const el of all) {
    Transforms.unsetNodes(editor, Object.values(Marks), { at: el[1] });
  }
};

const ColorPicker: React.FC<{
  title: string;
  onChange?: (color?: string) => void;
  icon?: any;
  mark: Marks;
}> = (props) => {
  const editor = useSlate();
  const [color, setColor] = useState("");
  const [visible, setVisible] = useState(false);
  const ref = useRef<any>({
    _getColor: _.debounce(() => {
      setColor(getColor());
    }, calcStatusDelay),
  });

  const getColor = () => {
    const td = TableLogic.getFirstSelectedTd(editor);
    if (td) {
      return Element.isElement(td[0]) && (td[0][props.mark] || "unset");
    }

    if (!editor.selection) return "unset";
    if (!props.mark) return "unset";
    const marks = Editor.marks(editor);
    return (
      (marks && marks?.[props?.mark]) ||
      window.getComputedStyle(document.body).color
    );
  };

  useEffect(() => {
    ref.current._getColor();
  });

  return useMemo(() => {
    return (
      <Tooltip
        title={props.title}
        zIndex={99}
        mouseLeaveDelay={0}
        mouseEnterDelay={0}
      >
        <div
          onMouseLeave={() => {
            setVisible(false);
          }}
        >
          <Dropdown
            placement="bottomCenter"
            overlayStyle={{ zIndex: 999 }}
            visible={visible}
            overlay={() => {
              return (
                <ColorPickerCore
                  value={color}
                  onChange={(color) => {
                    props?.onChange?.(color);
                    setVisible(false);
                  }}
                ></ColorPickerCore>
              );
            }}
            trigger={["click"]}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
          >
            <AntButton
              type="text"
              style={{ color }}
              onMouseDown={(e) => {
                e.preventDefault();
                setVisible(true);
              }}
            >
              {props.icon}
            </AntButton>
          </Dropdown>
        </div>
      </Tooltip>
    );
  }, [color, visible]);
};

const ColorPickerCore: React.FC<{
  value: string;
  onChange?: (color?: string) => void;
}> = (props) => {
  const [color, setColor] = useState<{ hex: any }>({
    hex: props.value,
  });

  return (
    <div
      style={{
        padding: 8,
        display: "flex",
        justifyContent: "flex-start",
        backgroundColor: "white",
        flexDirection: "column",
      }}
      className="cyEditor__toolbar__colorPanelWrapper"
    >
      <CompactPicker
        color={color.hex}
        onChange={(color) => {
          setColor(color);
          props?.onChange?.(color.hex);
        }}
      ></CompactPicker>
      <AntButton
        icon={<DeleteOutlined></DeleteOutlined>}
        size="small"
        onClick={() => {
          props?.onChange?.("unset");
          setColor({ hex: "" });
        }}
      >
        重置
      </AntButton>
    </div>
  );
};

const getMarkValue = (editor: EditorType, mark: Marks) => {
  try {
    const td = TableLogic.getFirstSelectedTd(editor);
    if (td && Element.isElement(td[0])) {
      return td[0][mark];
    }
    if (!editor.selection) return null;
    const marks = Editor.marks(editor);
    return marks?.[mark];
  } catch (error) {
    console.error(error);
    return false;
  }
};

const isMarkActive = (editor: EditorType, mark: Marks) => {
  try {
    const td = TableLogic.getFirstSelectedTd(editor);
    if (td && Element.isElement(td[0])) {
      return td[0][mark];
    }

    if (!editor.selection) return null;
    const marks = Editor.marks(editor);
    return marks?.[mark] === true ? true : false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const ValueSelector = (props: {
  options: (string | number)[];
  optionLabelRender?: (value: string | number) => any;
  title: string;
  getValue: (editor: EditorType) => any;
  afterSelect?: (value: string | number) => void;
}) => {
  const editor = useSlate();
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const toolDom = useRef<any>();
  const ref = useRef<any>({
    getValue: _.debounce(() => {
      setValue(props.getValue(editor));
    }, calcStatusDelay),
  });

  useEffect(() => {
    ref.current.getValue();
  });
  return useMemo(() => {
    return (
      <Tooltip
        title={props.title}
        zIndex={99}
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
      >
        <div
          ref={toolDom}
          style={{
            width: 100,
            position: "relative",
          }}
          className="cyEditor__toolbar__button"
          onMouseLeave={() => {
            setVisible(false);
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
              cursor: "pointer",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setVisible(!visible);
            }}
          ></div>
          <Select
            placeholder={props.title}
            value={value}
            bordered={false}
            style={{ width: "100%" }}
            open={visible}
            dropdownClassName="cyEditor__toolbar__dropdown"
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
            onSelect={(value) => {
              ReactEditor.focus(editor);
              props?.afterSelect?.(value);
              setVisible(false);
            }}
          >
            {props.options.map((value) => {
              return (
                <Select.Option value={String(value)} key={value}>
                  {props?.optionLabelRender?.(value) || value}
                </Select.Option>
              );
            })}
          </Select>
        </div>
      </Tooltip>
    );
  }, [visible, value]);
};

const MarkButton: React.FC<{
  title: string;
  mark?: Marks;
}> = (props) => {
  const editor = useSlate();
  const [type, setType] = useState("text");
  const ref = useRef<any>({
    getType: _.debounce(() => {
      setType(props.mark && isMarkActive(editor, props.mark) ? "link" : "text");
    }, calcStatusDelay),
  });

  useEffect(() => {
    ref.current.getType();
  });

  const toggleMark = (mark: Marks) => {
    // 针对选中表格的情况
    const tds = TableLogic.getSelectedTds(editor);

    if (tds.length > 0) {
      ReactEditor.focus(editor);
      tds.forEach((td) => {
        if (!Element.isElement(td[0])) return;
        if (td[0][mark]) {
          Transforms.unsetNodes(editor, [mark], { at: td[1] });
        } else {
          Transforms.setNodes(editor, { [mark]: true }, { at: td[1] });
        }
      });
      return;
    }

    if (!editor.selection) return;

    const marks = Editor.marks(editor);

    if (marks?.[mark]) {
      Editor.removeMark(editor, mark);
    } else {
      Editor.addMark(editor, mark, true);
    }
  };

  return useMemo(() => {
    return (
      <Tooltip title={props.title} mouseEnterDelay={0} mouseLeaveDelay={0}>
        <AntButton
          className="cyEditor__toolbar__button"
          type={type as any}
          onMouseDown={(e) => {
            e.preventDefault();
            props.mark && toggleMark(props.mark);
          }}
        >
          {props.children}
        </AntButton>
      </Tooltip>
    );
  }, [type]);
};

const StaticButton: React.FC<{
  title: string;
  mousedownFunc: (e: any) => void;
  disabled?: boolean;
}> = (props) => {
  return (
    <Tooltip title={props.title} mouseEnterDelay={0} mouseLeaveDelay={0}>
      <AntButton
        className="cyEditor__toolbar__button"
        type={"text"}
        disabled={props.disabled}
        onMouseDown={(e) => {
          e.preventDefault();
          props.mousedownFunc(e);
        }}
      >
        {props.children}
      </AntButton>
    </Tooltip>
  );
};

const ReactButton: React.FC<{
  title: string;
  mousedownFunc: (e: any) => void;
  disabledCondition?: (editor: EditorType) => boolean;
}> = (props) => {
  const editor = useSlate();
  const { mousedownFunc, title, disabledCondition = () => false } = props;
  const [disabled, setDisabled] = useState(false);
  const ref = useRef({
    _isDisabled: _.debounce(() => {
      setDisabled(disabledCondition(editor));
    }, calcStatusDelay),
  });
  useEffect(() => {
    ref.current._isDisabled();
  });
  return (
    <Tooltip title={title} mouseEnterDelay={0} mouseLeaveDelay={0}>
      <AntButton
        className="cyEditor__toolbar__button"
        type={"text"}
        disabled={disabled}
        onMouseDown={(e) => {
          e.preventDefault();
          mousedownFunc(e);
        }}
      >
        {props.children}
      </AntButton>
    </Tooltip>
  );
};

const CopyFormat: React.FC<{}> = (props) => {
  const editor = useSlate();
  const { setSavedMarks } = useContext(EditorContext);
  const [disabled, setDisabled] = useState(false);
  const ref = useRef<any>({
    isDisabled: _.debounce(() => {
      const isNotOnlyOne = TableLogic.getSelectedTdsSize(editor) > 1;
      const td = TableLogic.getFirstSelectedTd(editor);
      setDisabled(!(editor.selection != null || (td && !isNotOnlyOne)));
    }, calcStatusDelay),
  });

  useEffect(() => {
    ref.current.isDisabled();
  });

  const copyMark = () => {
    try {
      const isNotOnlyOne = TableLogic.getSelectedTdsSize(editor) > 1;
      const td = TableLogic.getFirstSelectedTd(editor);
      if (td && !isNotOnlyOne && Element.isElement(td[0])) {
        setSavedMarks(td[0] || null);
        return;
      }
      if (!editor.selection) return null;
      const marks = Editor.marks(editor);
      const textWrapper = Editor.above(editor, {
        mode: "lowest",
        match(n) {
          return utils.isTextWrapper(n);
        },
      });
      if (textWrapper) setSavedMarks({ ...marks, ...textWrapper[0] } || null);
      else setSavedMarks(marks || null);
    } catch (error) {
      console.warn(error);
    }
  };
  return useMemo(() => {
    return (
      <StaticButton
        title="格式刷"
        disabled={disabled}
        mousedownFunc={() => {
          copyMark();
        }}
      >
        <FormatPainterOutlined />
      </StaticButton>
    );
  }, [disabled]);
};

const InsertTableButton: React.FC<{
  title: string;
  onChange?: (color?: string) => void;
  icon?: any;
}> = (props) => {
  const editor = useSlate();
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState<string>("");
  const tableDom = useRef<any>();
  const [disabled, setDisabled] = useState(false);
  const ref = useRef({
    _isDisabled: _.debounce(() => {
      setDisabled(editor.selection == null);
    }, calcStatusDelay),
  });
  useEffect(() => {
    ref.current._isDisabled();
  });

  const rowCount = 10,
    cellCount = 10;

  const tdMouseEnter = (e: any) => {
    const table: any = tableDom.current;
    const td = e.target;
    const tr = e.target.parentNode;
    if (!table || !td || !tr) return;

    Array.from(table.querySelectorAll("td")).forEach((td: any) => {
      td.style.backgroundColor = "unset";
    });
    const trs = Array.from(table.querySelectorAll("tr"));

    for (let i = 0; i <= tr.rowIndex; i++) {
      const nowTr: any = trs[i];
      const tds: any = Array.from(nowTr.querySelectorAll("td"));
      for (let j = 0; j <= td.cellIndex; j++) {
        const nowTd = tds[j];
        nowTd.style.backgroundColor = "rgba(180,215,255,.7)";
      }
    }

    setCounts(`${td.cellIndex + 1}x${tr.rowIndex + 1}`);
  };

  const addTable = () => {
    const cellCount = Number(counts.split("x")[0]);
    const rowCount = Number(counts.split("x")[1]);
    if (!Number.isInteger(cellCount) || !Number.isInteger(rowCount)) return;

    ReactEditor.focus(editor);

    if (!editor.selection) return;

    const [tw] = Editor.nodes(editor, {
      mode: "lowest",
      match(n) {
        return utils.isTextWrapper(n);
      },
    });
    if (!tw) return;
    const twDom = ReactEditor.toDOMNode(editor, tw[0]);
    const parent: any = twDom.offsetParent;
    if (!parent) return;
    const tableWrapperWidth = twDom.offsetWidth - 2;

    Transforms.insertNodes(editor, {
      type: CET.TABLE,
      wrapperWidthWhenCreated: tableWrapperWidth,
      children: [
        {
          type: CET.TBODY,
          children: new Array(rowCount).fill("0").map(() => {
            return {
              type: CET.TR,
              children: new Array(cellCount).fill("0").map(() => {
                return {
                  type: CET.TD,
                  width: tableWrapperWidth / cellCount,
                  height: tdMinHeight,
                  children: [
                    {
                      type: CET.DIV,
                      children: [{ text: "" }],
                    },
                  ],
                };
              }),
            };
          }),
        },
      ],
    });

    Transforms.deselect(editor);
    setVisible(false);
  };

  return useMemo(() => {
    return (
      <div
        onMouseLeave={() => {
          setVisible(false);
        }}
      >
        <Dropdown
          placement="bottomCenter"
          overlayStyle={{ zIndex: 999 }}
          visible={visible}
          overlay={() => {
            return (
              <div
                className="cyEditor__toolbar__tablePanelWrapper"
                style={{
                  width: 200,
                  padding: 8,
                  display: "flex",
                  justifyContent: "flex-start",
                  backgroundColor: "white",
                  flexDirection: "column",
                }}
              >
                {visible ? (
                  <table border="1" ref={tableDom}>
                    <tbody>
                      {new Array(rowCount).fill(0).map((item, index) => {
                        return (
                          <tr key={index}>
                            {new Array(cellCount).fill(0).map((item, index) => {
                              return (
                                <td
                                  key={index}
                                  onMouseEnter={tdMouseEnter}
                                  onClick={addTable}
                                ></td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : null}
                <div style={{ textAlign: "right" }}>{counts}</div>
              </div>
            );
          }}
          trigger={["click"]}
          getPopupContainer={(triggerNode) =>
            triggerNode.parentElement || document.body
          }
        >
          <Tooltip
            title={props.title}
            zIndex={99}
            mouseLeaveDelay={0}
            mouseEnterDelay={0}
          >
            <AntButton
              type="text"
              onMouseDown={(e) => {
                e.preventDefault();
                setVisible(true);
              }}
              disabled={disabled}
            >
              {props.icon}
            </AntButton>
          </Tooltip>
        </Dropdown>
      </div>
    );
  }, [visible, disabled, counts]);
};

const ReadOnlyButton: React.FC<{}> = (props) => {
  const { readOnly, setReadOnly } = useContext(EditorContext);
  const title = readOnly ? "编辑模式" : "只读模式";
  return (
    <StaticButton
      title={title}
      mousedownFunc={() => {
        setReadOnly(!readOnly);
      }}
    >
      {title}
    </StaticButton>
  );
};

export const ToolBar: React.FC<{}> = (props) => {
  const editor = useSlateStatic();

  const setNumberList = () => {
    ListLogic.toggleList(editor, CET.NUMBER_LIST);
  };

  const insertToDoList = () => {
    Transforms.insertNodes(editor, {
      type: CET.TODOLIST,
      children: [{ text: "" }],
    });
  };

  const setNormalList = () => {
    ListLogic.toggleList(editor, CET.NORMAL_LIST);
  };

  const setTextWrapper = (type: CET) => {
    const tds = TableLogic.getSelectedTds(editor);
    if (tds.length > 0) {
      tds.forEach((td) => {
        Transforms.setNodes(
          editor,
          {
            type,
          },
          {
            at: td[1],
            match(n) {
              return utils.isTextWrapper(n);
            },
          }
        );
      });
    } else {
      Transforms.setNodes(
        editor,
        { type: type },
        {
          hanging: true,
          mode: "lowest",
          match(n) {
            return utils.isTextWrapper(n);
          },
        }
      );
    }
  };

  const setLink = () => {
    const [isLinkActive] = Editor.nodes(editor, {
      match(n) {
        return Element.isElement(n) && n.type == CET.LINK;
      },
    });
    if (!isLinkActive) {
      Transforms.wrapNodes(
        editor,
        {
          type: CET.LINK,
          url: "http://www.baidu.com",
          children: [],
        },
        {
          split: true,
        }
      );
    }
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

  const insertDivAfterTable = () => {
    TableLogic.insertDivAfterTable(editor);
  };

  const insertDivBeforeTable = () => {
    TableLogic.insertDivBeforeTable(editor);
  };

  const deleteTable = () => {
    TableLogic.deleteTable(editor);
  };

  const mergeTd = () => {
    TableLogic.mergeTd(editor);
  };

  const splitTd = () => {
    TableLogic.splitTd(editor);
  };

  const insertRowAfter = () => {
    TableLogic.insertRow(editor, "after");
  };

  const insertRowBefore = () => {
    TableLogic.insertRow(editor, "before");
  };

  const insertColumnAfter = () => {
    TableLogic.insertColumn(editor, "after");
  };

  const insertColumnBefore = () => {
    TableLogic.insertColumn(editor, "before");
  };

  const deleteColumn = () => {
    TableLogic.deleteColumn(editor);
  };

  const deleteRow = () => {
    TableLogic.deleteRow(editor);
  };

  const clearTd = () => {
    TdLogic.clearTd(editor);
  };

  return (
    <div
      className="cyEditor__toolBar"
      style={{ position: "relative", marginBottom: 4 }}
    >
      <Row align="middle">
        {/* 设置字体规格 */}
        <Col>
          <ValueSelector
            getValue={(editor: EditorType) => {
              const [node] = Editor.nodes(editor, {
                match(n) {
                  return utils.isTextWrapper(n);
                },
              });
              if (!node) return "正文";
              const type = Element.isElement(node[0]) && node[0].type;
              return type == "div" || type == false
                ? "正文"
                : type.toUpperCase();
            }}
            options={["H1", "H2", "H3", "H4", "正文"]}
            optionLabelRender={(value) => {
              return <span>{value}</span>;
            }}
            title="字体样式"
            afterSelect={(value) => {
              if (value == "H1") setTextWrapper(CET.H1);
              if (value == "H2") setTextWrapper(CET.H2);
              if (value == "H3") setTextWrapper(CET.H3);
              if (value == "H4") setTextWrapper(CET.H4);
              if (value == "正文") setTextWrapper(CET.DIV);
            }}
          ></ValueSelector>
        </Col>
        {/* 设置字体大小 */}
        <Col>
          <ValueSelector
            getValue={(editor) => {
              return String(getMarkValue(editor, Marks.FontSize) || 14);
            }}
            options={[12, 13, 14, 15, 16, 19, 22, 24, 29, 32, 40, 48]}
            optionLabelRender={(value) => {
              return `${value}px`;
            }}
            title="字体大小"
            afterSelect={(value) => {
              const tds = TableLogic.getSelectedTds(editor);
              if (tds.length > 0) {
                for (const td of tds) {
                  Transforms.setNodes(
                    editor,
                    {
                      [Marks.FontSize]: Number(value),
                    },
                    {
                      at: td[1],
                    }
                  );
                }
                return;
              }
              if (!editor.selection) return;
              Editor.addMark(editor, Marks.FontSize, Number(value));
            }}
          ></ValueSelector>
        </Col>
        {/* 设置对齐方式 */}
        <Col>
          <ValueSelector
            getValue={(editor) => {
              const td = TableLogic.getFirstSelectedTd(editor);
              if (td && Element.isElement(td[0])) {
                return td[0][Marks.TextAlign] || "左对齐";
              }

              const [node] = Editor.nodes(editor, {
                match(n) {
                  return utils.isTextWrapper(n);
                },
              });
              if (!node) return "左对齐";
              const textAlign = Element.isElement(node[0]) && node[0].textAlign;
              return textAlign == false || textAlign == null
                ? "left"
                : textAlign;
            }}
            options={["left", "right", "center"]}
            optionLabelRender={(value) => {
              if (value == "left") return "左对齐";
              if (value == "right") return "右对齐";
              if (value == "center") return "居中对齐";
              return `${value}`;
            }}
            title="对齐方式"
            afterSelect={(value) => {
              ReactEditor.focus(editor);
              const tds = TableLogic.getSelectedTds(editor);
              if (tds.length > 0) {
                for (const td of tds) {
                  Transforms.setNodes(
                    editor,
                    { textAlign: value },
                    {
                      at: td[1],
                    }
                  );
                }
                return;
              }
              if (!editor.selection) return;
              Transforms.setNodes(
                editor,
                { textAlign: value },
                {
                  mode: "lowest",
                  match(n) {
                    return utils.isTextWrapper(n);
                  },
                }
              );
            }}
          ></ValueSelector>
        </Col>
        <Col>
          <Divider
            style={{ height: 20, backgroundColor: "rgb(0 0 0 / 10%)" }}
            type="vertical"
          />
        </Col>
        <Col>
          <CopyFormat></CopyFormat>
        </Col>
        <Col>
          <StaticButton
            title="清除格式"
            mousedownFunc={() => {
              cleanFormat(editor);
            }}
          >
            <Icon
              component={() => (
                <svg
                  viewBox="0 0 1084 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="853"
                  width="14"
                  height="14"
                >
                  <defs>
                    <style type="text/css"></style>
                  </defs>
                  <path
                    d="M719.329882 422.249412l-255.578353 255.578353 234.315295 234.315294 255.518117-255.638588-234.315294-234.255059zM59.151059 315.813647l298.164706-298.164706a60.235294 60.235294 0 0 1 85.172706 0l596.329411 596.329412a60.235294 60.235294 0 0 1 0 85.172706l-298.164706 298.164706a60.235294 60.235294 0 0 1-85.232941 0l-596.329411-596.329412a60.235294 60.235294 0 0 1 0-85.172706z"
                    fill="#333333"
                    p-id="854"
                  ></path>
                </svg>
              )}
            ></Icon>
          </StaticButton>
        </Col>
        <Col>
          <ColorPicker
            title="字体颜色"
            onChange={(color) => {
              ReactEditor.focus(editor);
              const tds = TableLogic.getSelectedTds(editor);
              if (tds.length > 0) {
                for (const td of tds) {
                  Transforms.setNodes(
                    editor,
                    {
                      [Marks.Color]: color,
                    },
                    {
                      at: td[1],
                    }
                  );
                }
                return;
              }
              if (!editor.selection) return;
              Editor.addMark(editor, Marks.Color, color);
            }}
            mark={Marks.Color}
            icon={<FontColorsOutlined />}
          ></ColorPicker>
        </Col>
        <Col>
          <ColorPicker
            title="背景色"
            onChange={(color) => {
              ReactEditor.focus(editor);
              const tds = TableLogic.getSelectedTds(editor);
              if (tds.length > 0) {
                for (const td of tds) {
                  Transforms.setNodes(
                    editor,
                    {
                      [Marks.BGColor]: color,
                    },
                    {
                      at: td[1],
                    }
                  );
                }
                return;
              }
              if (!editor.selection) return;
              Editor.addMark(editor, Marks.BGColor, color);
            }}
            mark={Marks.BGColor}
            icon={<BgColorsOutlined />}
          ></ColorPicker>
        </Col>
        <Col>
          <MarkButton title="加粗" mark={Marks.BOLD}>
            <BoldOutlined />
          </MarkButton>
        </Col>
        <Col>
          <MarkButton title="斜体" mark={Marks.ITALIC}>
            <ItalicOutlined />
          </MarkButton>
        </Col>
        <Col>
          <MarkButton title="下划线" mark={Marks.Underline}>
            <UnderlineOutlined />
          </MarkButton>
        </Col>
        <Col>
          <MarkButton title="删除线" mark={Marks.LineThrough}>
            <StrikethroughOutlined />
          </MarkButton>
        </Col>
        <Col>
          <Divider
            style={{ height: 20, backgroundColor: "rgb(0 0 0 / 10%)" }}
            type="vertical"
          />
        </Col>
        <Col>
          <ReactButton
            title="待办列表"
            mousedownFunc={() => {
              insertToDoList();
            }}
            disabledCondition={(editor) => {
              return editor.selection == null;
            }}
          >
            <CheckSquareOutlined />
          </ReactButton>
          <ReactButton
            title="有序列表"
            mousedownFunc={() => {
              setNumberList();
            }}
            disabledCondition={(editor) => {
              return editor.selection == null;
            }}
          >
            <OrderedListOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="无序列表"
            mousedownFunc={() => {
              setNormalList();
            }}
            disabledCondition={(editor) => {
              return editor.selection == null;
            }}
          >
            <UnorderedListOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="设置链接"
            mousedownFunc={() => {
              setLink();
            }}
            disabledCondition={(editor) => {
              return editor.selection == null;
            }}
          >
            <LinkOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="插入图片"
            mousedownFunc={() => {
              insertImg();
            }}
            disabledCondition={(editor) => {
              return editor.selection == null;
            }}
          >
            <PictureOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="插入资源文件"
            mousedownFunc={() => {}}
            disabledCondition={(editor) => {
              return editor.selection == null;
            }}
          >
            <FolderOpenOutlined />
          </ReactButton>
        </Col>
        <Col>
          <Divider
            style={{ height: 20, backgroundColor: "rgb(0 0 0 / 10%)" }}
            type="vertical"
          />
        </Col>
        <Col>
          <InsertTableButton
            title="表格"
            icon={<TableOutlined />}
          ></InsertTableButton>
        </Col>
        <Col>
          <ReactButton
            title="删除表格"
            mousedownFunc={() => {
              deleteTable();
            }}
            disabledCondition={isSelectTd}
          >
            <DeleteOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="删除列"
            mousedownFunc={() => {
              deleteColumn();
            }}
            disabledCondition={isSelectTd}
          >
            <DeleteColumnOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="删除行"
            mousedownFunc={() => {
              deleteRow();
            }}
            disabledCondition={isSelectTd}
          >
            <DeleteRowOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="表格后插入文本"
            mousedownFunc={() => {
              insertDivAfterTable();
            }}
            disabledCondition={isSelectTd}
          >
            <VerticalAlignBottomOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="表格前插入文本"
            mousedownFunc={() => {
              insertDivBeforeTable();
            }}
            disabledCondition={isSelectTd}
          >
            <VerticalAlignTopOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="左插入列"
            mousedownFunc={() => {
              insertColumnBefore();
            }}
            disabledCondition={isSelectTd}
          >
            <InsertRowLeftOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="右插入列"
            mousedownFunc={() => {
              insertColumnAfter();
            }}
            disabledCondition={isSelectTd}
          >
            <InsertRowRightOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="上插入行"
            mousedownFunc={() => {
              insertRowBefore();
            }}
            disabledCondition={isSelectTd}
          >
            <InsertRowAboveOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="下插入行"
            mousedownFunc={() => {
              insertRowAfter();
            }}
            disabledCondition={isSelectTd}
          >
            <InsertRowBelowOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="合并单元格"
            mousedownFunc={() => {
              mergeTd();
            }}
            disabledCondition={isSelectTd}
          >
            <MergeCellsOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="拆分单元格"
            mousedownFunc={() => {
              splitTd();
            }}
            disabledCondition={isSelectTd}
          >
            <SplitCellsOutlined />
          </ReactButton>
        </Col>
        <Col>
          <ReactButton
            title="清空单元格"
            mousedownFunc={() => {
              clearTd();
            }}
            disabledCondition={isSelectTd}
          >
            <ClearOutlined />
          </ReactButton>
        </Col>
        <Col>
          <Divider
            style={{ height: 20, backgroundColor: "rgb(0 0 0 / 10%)" }}
            type="vertical"
          />
        </Col>
        <Col>
          <StaticButton
            title="输出内容"
            mousedownFunc={() => {
              console.log(JSON.stringify(editor.children));
              window.localStorage.setItem(
                "savedContent",
                JSON.stringify(editor.children)
              );
            }}
          >
            <SaveOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="输出内容HTML"
            mousedownFunc={(e) => {
              // const editorDom = e.nativeEvent.path.find((o: any) => o.className == "cyEditor");
              // if(!editorDom) return;
              // const content = editorDom.querySelector(':scope>.cyEditor__content');
              // console.log(content.innerHTML);
              console.log(slateToHtml(editor));
            }}
          >
            slateToHtml
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="输入内容"
            mousedownFunc={(e) => {
              // const editorDom = e.nativeEvent.path.find((o: any) => o.className == "cyEditor");
              // if(!editorDom) return;
              // const content = editorDom.querySelector(':scope>.cyEditor__content');
              // console.log(content.innerHTML);
              const content = htmlToSlate(
                `<table><tbody><tr><td>123</td></tr></tbody></table>`
              );
              Transforms.insertNodes(editor, content);
            }}
          >
            htmlToSlate
          </StaticButton>
        </Col>
        <Col>
          <ReadOnlyButton></ReadOnlyButton>
        </Col>
      </Row>
    </div>
  );
};
