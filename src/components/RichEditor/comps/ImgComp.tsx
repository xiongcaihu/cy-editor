/* eslint-disable eqeqeq */
import {
  BorderlessTableOutlined,
  BorderOuterOutlined,
  DeleteOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import { Button, Col, Popover, Row, Tooltip } from "antd";
import { Resizable } from "re-resizable";
import { useState } from "react";
import { Transforms } from "slate";
import {
  useSelected,
  ReactEditor,
  RenderElementProps,
  useSlateStatic,
  useReadOnly,
} from "slate-react";
import testImg from "../c.jpg";

export const ImgComp: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = useSlateStatic();
  const [state, setState] = useState({
    size: {
      width: element.width || 100,
      height: element.height || 100,
    },
    showTool: false,
  });

  const enableResize = () => {
    return ReactEditor.isReadOnly(editor)
      ? {
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }
      : {
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        };
  };

  const onResizeStop: ConstructorParameters<
    typeof Resizable
  >[0]["onResizeStop"] = (e, direction, ref, d) => {
    const newWidth = state.size.width + d.width;
    const newHeight = state.size.height + d.height;
    setState((t) => ({
      ...t,
      size: {
        width: newWidth,
        height: newHeight,
      },
    }));
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      {
        children: [],
        width: newWidth,
        height: newHeight,
      },
      { at: path }
    );
  };

  const showBigImg = () => {
    window.open(element.url || testImg);
  };

  const mask = (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        opacity: 0.8,
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 12,
        backgroundColor: "black",
        zIndex: 9,
      }}
    >
      uploading...
    </div>
  );

  const addBorder = () => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { border: true }, { at: path });
  };

  const removeBorder = () => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.unsetNodes(editor, "border", { at: path });
  };

  const deleteImg = () => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.delete(editor, { at: path, voids: true, reverse: true });
    ReactEditor.focus(editor);
  };
  const imgFuncs = [
    {
      title: "边框",
      icon: <BorderOuterOutlined />,
      method: addBorder,
    },
    {
      title: "取消边框",
      icon: <BorderlessTableOutlined />,
      method: removeBorder,
    },
    {
      title: "查看大图",
      icon: <FullscreenOutlined />,
      method: showBigImg,
    },
    {
      title: "删除",
      icon: <DeleteOutlined />,
      method: deleteImg,
    },
  ];

  return (
    <div
      {...attributes}
      contentEditable={false}
      style={{
        position: "relative",
        display: "inline-block",
        margin: 5,
        verticalAlign: "bottom",
        boxShadow: selected ? "0 0 0 3px rgba(180,215,255,.7)" : "none",
        border: element.border ? "1px solid #e5e5e5" : "none",
      }}
      onDoubleClick={showBigImg}
    >
      <Resizable
        enable={enableResize()}
        style={{ display: "inline-block" }}
        size={state.size}
        onResizeStop={onResizeStop}
      >
        {element.id ? mask : null}
        <Popover
          content={
            <Row gutter={8}>
              {imgFuncs.map((func) => {
                return (
                  <Col key={func.title}>
                    <Tooltip title={func.title}>
                      <Button
                        onClick={func.method}
                        type="text"
                        icon={func.icon}
                      ></Button>
                    </Tooltip>
                  </Col>
                );
              })}
            </Row>
          }
          trigger={readOnly ? [] : "click"}
          placement="bottomLeft"
        >
          <img width="100%" height="100%" alt="" src={element.url}></img>
        </Popover>
        {children}
      </Resizable>
    </div>
  );
};
