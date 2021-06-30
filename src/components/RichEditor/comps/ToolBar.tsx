/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable eqeqeq */
import {
  Col,
  Button as AntButton,
  Dropdown,
  Menu,
  Tooltip,
  Row,
  Select,
  Divider,
} from "antd";
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
import { ReactEditor, useSlate, useSlateStatic } from "slate-react";
import { CET, EditorType, Marks } from "../common/Defines";
import { ListLogic } from "./ListComp";
import { TableLogic } from "../comps/Table";
import { utils } from "../common/utils";
import _ from "lodash";
import { TdLogic } from "./Td";
import {
  BgColorsOutlined,
  BoldOutlined,
  CaretDownOutlined,
  SaveOutlined,
  CaretUpOutlined,
  ClearOutlined,
  DeleteColumnOutlined,
  DeleteOutlined,
  DeleteRowOutlined,
  DisconnectOutlined,
  FontColorsOutlined,
  HighlightOutlined,
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
} from "@ant-design/icons";
import "./ToolBar.css";
import React, { useEffect, useRef, useState } from "react";
import { SketchPicker, CompactPicker } from "react-color";

const ColorPicker: React.FC<{
  title: string;
  onChange?: (color: string) => void;
  icon?: any;
  mark: Marks;
}> = (props) => {
  const editor = useSlate();
  const getColor = () => {
    const marks = Editor.marks(editor);
    return marks && marks[props.mark];
  };

  const [color, setColor] = useState<{ hex: any }>({
    hex: getColor() || window.getComputedStyle(document.body).backgroundColor,
  });

  const [visible, setVisible] = useState(false);
  const ref = useRef<{
    preSelection: Selection | null;
  }>({
    preSelection: null,
  });
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
              <CompactPicker
                color={color.hex}
                onChange={(color) => {
                  setColor(color);
                  setVisible(false);
                  ReactEditor.focus(editor);
                  ref.current.preSelection &&
                    Transforms.select(editor, ref.current.preSelection);
                }}
                onChangeComplete={(color) => {
                  props?.onChange?.(color.hex);
                }}
              ></CompactPicker>
            );
          }}
          trigger={["click"]}
          getPopupContainer={(triggerNode) =>
            triggerNode.parentElement || document.body
          }
        >
          <AntButton
            type="text"
            style={{ color: getColor() }}
            onClick={() => {
              setVisible(true);
              ref.current.preSelection = editor.selection;
            }}
          >
            {props.icon}
          </AntButton>
        </Dropdown>
      </div>
    </Tooltip>
  );
};

const getMarkValue = (editor: EditorType, mark: Marks) => {
  try {
    const marks = Editor.marks(editor);
    return marks?.[mark];
  } catch (error) {
    console.error(error);
    return false;
  }
};

const isMarkActive = (editor: EditorType, mark: Marks) => {
  try {
    const marks = Editor.marks(editor);
    return marks?.[mark] === true ? true : false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const CySelector = (props: {
  options: (string | number)[];
  optionLabelRender?: (value: string | number) => any;
  title: string;
  getValue: (editor: EditorType) => any;
  afterSelect?: (value: string | number) => void;
}) => {
  const editor = useSlate();
  const [visible, setVisible] = useState(false);
  const toolDom = useRef<any>();
  const ref = useRef<{
    preSelection: Selection | null;
  }>({
    preSelection: null,
  });

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
            ref.current.preSelection = editor.selection;
            setVisible(true);
          }}
        ></div>
        <Select
          placeholder={props.title}
          value={props.getValue(editor)}
          bordered={false}
          style={{ width: "100%" }}
          open={visible}
          dropdownClassName="cyEditor__toolbar__dropdown"
          getPopupContainer={(triggerNode) =>
            triggerNode.parentElement || document.body
          }
          onSelect={(value) => {
            ReactEditor.focus(editor);
            ref.current.preSelection &&
              Transforms.select(editor, ref.current.preSelection);
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
};

const Button: React.FC<{
  title: string;
  mark?: Marks;
  mousedownFunc: () => void;
}> = (props) => {
  const editor = useSlate();
  return (
    <Tooltip title={props.title} mouseEnterDelay={0} mouseLeaveDelay={0}>
      <AntButton
        className="cyEditor__toolbar__button"
        type={props.mark && isMarkActive(editor, props.mark) ? "link" : "text"}
        onMouseDown={(e) => {
          e.preventDefault();
          props.mousedownFunc();
        }}
      >
        {props.children}
      </AntButton>
    </Tooltip>
  );
};

const StaticButton: React.FC<{ title: string; mousedownFunc: () => void }> = (
  props
) => {
  return (
    <Tooltip title={props.title} mouseEnterDelay={0} mouseLeaveDelay={0}>
      <AntButton
        className="cyEditor__toolbar__button"
        type={"text"}
        onMouseDown={(e) => {
          e.preventDefault();
          props.mousedownFunc();
        }}
      >
        {props.children}
      </AntButton>
    </Tooltip>
  );
};

export const ToolBar = () => {
  const editor = useSlateStatic();

  const setNumberList = () => {
    ListLogic.toggleList(editor, CET.NUMBER_LIST);
  };

  const setNormalList = () => {
    ListLogic.toggleList(editor, CET.NORMAL_LIST);
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

  const setTextWrapper = (type: CET) => {
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
          <CySelector
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
          ></CySelector>
        </Col>
        {/* 设置字体大小 */}
        <Col>
          <CySelector
            getValue={(editor) => {
              return String(getMarkValue(editor, Marks.FontSize) || 14);
            }}
            options={[12, 13, 14, 15, 16, 19, 22, 24, 29, 32, 40, 48]}
            optionLabelRender={(value) => {
              return `${value}px`;
            }}
            title="字体大小"
            afterSelect={(value) => {
              Editor.addMark(editor, Marks.FontSize, Number(value));
            }}
          ></CySelector>
        </Col>
        <Col>
          <Divider
            style={{ height: 20, backgroundColor: "rgb(0 0 0 / 10%)" }}
            type="vertical"
          />
        </Col>
        <Col>
          <ColorPicker
            title="字体颜色"
            onChange={(color) => {
              Editor.addMark(editor, Marks.Color, color);
            }}
            mark={Marks.Color}
            icon={<FontColorsOutlined />}
          ></ColorPicker>
        </Col>
        <Col>
          <ColorPicker
            title="背景颜色"
            onChange={(color) => {
              Editor.addMark(editor, Marks.BGColor, color);
            }}
            mark={Marks.BGColor}
            icon={<BgColorsOutlined />}
          ></ColorPicker>
        </Col>
        <Col>
          <Button
            title="加粗"
            mark={Marks.BOLD}
            mousedownFunc={() => {
              toggleMark(Marks.BOLD);
            }}
          >
            <BoldOutlined />
          </Button>
        </Col>
        <Col>
          <Button
            title="斜体"
            mark={Marks.ITALIC}
            mousedownFunc={() => {
              toggleMark(Marks.ITALIC);
            }}
          >
            <ItalicOutlined />
          </Button>
        </Col>
        <Col>
          <Button
            title="下划线"
            mark={Marks.Underline}
            mousedownFunc={() => {
              toggleMark(Marks.Underline);
            }}
          >
            <UnderlineOutlined />
          </Button>
        </Col>
        <Col>
          <Button
            title="删除线"
            mark={Marks.LineThrough}
            mousedownFunc={() => {
              toggleMark(Marks.LineThrough);
            }}
          >
            <StrikethroughOutlined />
          </Button>
        </Col>
        {/* 设置对齐方式 */}
        <Col>
          <CySelector
            getValue={(editor) => {
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
              console.log(value);
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
          ></CySelector>
        </Col>
        <Col>
          <Divider
            style={{ height: 20, backgroundColor: "rgb(0 0 0 / 10%)" }}
            type="vertical"
          />
        </Col>
        <Col>
          <StaticButton
            title="有序列表"
            mousedownFunc={() => {
              setNumberList();
            }}
          >
            <OrderedListOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="无序列表"
            mousedownFunc={() => {
              setNormalList();
            }}
          >
            <UnorderedListOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="插入链接"
            mousedownFunc={() => {
              insertLink();
            }}
          >
            <LinkOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="取消链接"
            mousedownFunc={() => {
              insertLink();
            }}
          >
            <DisconnectOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="插入图片"
            mousedownFunc={() => {
              insertImg();
            }}
          >
            <PictureOutlined />
          </StaticButton>
        </Col>
        <Col>
          <Divider
            style={{ height: 20, backgroundColor: "rgb(0 0 0 / 10%)" }}
            type="vertical"
          />
        </Col>
        <Col>
          <StaticButton
            title="表格"
            mousedownFunc={() => {
              insertTable();
            }}
          >
            <TableOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="删除表格"
            mousedownFunc={() => {
              deleteTable();
            }}
          >
            <DeleteOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="删除列"
            mousedownFunc={() => {
              deleteColumn();
            }}
          >
            <DeleteColumnOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="表格后插入文本"
            mousedownFunc={() => {
              insertDivAfterTable();
            }}
          >
            <VerticalAlignBottomOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="表格前插入文本"
            mousedownFunc={() => {
              insertDivBeforeTable();
            }}
          >
            <VerticalAlignTopOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="删除行"
            mousedownFunc={() => {
              deleteRow();
            }}
          >
            <DeleteRowOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="左插入列"
            mousedownFunc={() => {
              insertColumnBefore();
            }}
          >
            <InsertRowLeftOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="右插入列"
            mousedownFunc={() => {
              insertColumnAfter();
            }}
          >
            <InsertRowRightOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="上插入行"
            mousedownFunc={() => {
              insertRowBefore();
            }}
          >
            <InsertRowAboveOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="下插入行"
            mousedownFunc={() => {
              insertRowAfter();
            }}
          >
            <InsertRowBelowOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="合并单元格"
            mousedownFunc={() => {
              mergeTd();
            }}
          >
            <MergeCellsOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="拆分单元格"
            mousedownFunc={() => {
              splitTd();
            }}
          >
            <SplitCellsOutlined />
          </StaticButton>
        </Col>
        <Col>
          <StaticButton
            title="清空单元格"
            mousedownFunc={() => {
              clearTd();
            }}
          >
            <ClearOutlined />
          </StaticButton>
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
            }}
          >
            <SaveOutlined />
          </StaticButton>
        </Col>
      </Row>
    </div>
  );
};
