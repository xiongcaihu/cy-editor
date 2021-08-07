/* eslint-disable eqeqeq */
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Popover, Row, Tooltip } from "antd";
import { Transforms } from "slate";
import {
  ReactEditor,
  RenderElementProps,
  useSlateStatic,
  useReadOnly,
} from "slate-react";

export const FileComp: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const readOnly = useReadOnly();
  const editor = useSlateStatic();

  const mask = (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        opacity: 0.5,
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

  const deleteFile = () => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.delete(editor, { at: path, voids: true, reverse: true });
    ReactEditor.focus(editor);
  };

  const imgFuncs = [
    {
      title: "删除",
      icon: <DeleteOutlined />,
      method: deleteFile,
    },
  ];

  return (
    <div
      {...attributes}
      contentEditable={false}
      style={{
        position: "relative",
        display: "inline-block",
        margin: "0 5px",
        verticalAlign: "bottom",
      }}
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
        <a
          download
          href={element.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {element.fileName}
        </a>
      </Popover>
      {children}
    </div>
  );
};
