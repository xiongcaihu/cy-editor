/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import { DisconnectOutlined, SelectOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Popover, Row } from "antd";
import { useState } from "react";
import { Editor, Element, Transforms } from "slate";
import {
  RenderElementProps,
  ReactEditor,
  useSlateStatic,
  useReadOnly,
} from "slate-react";
import { CET } from "../common/Defines";

export const LinkComp: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const [content, setContent] = useState<string>();
  const [url, setUrl] = useState<string>();

  const visitLink = () => {
    window.open(element.url);
  };

  const cancelLink = (e: any) => {
    e.preventDefault();
    ReactEditor.focus(editor);

    const { selection } = editor;
    if (!selection) return;

    Transforms.unwrapNodes(editor, {
      match(n) {
        return Element.isElement(n) && n.type == CET.LINK;
      },
    });
  };

  const formItemStyle = { marginBottom: 6 };

  const submitChange = () => {
    ReactEditor.focus(editor);
    const link = ReactEditor.toSlateNode(editor, attributes.ref.current);
    const linkPath = ReactEditor.findPath(editor, link);
    if (link && linkPath) {
      Transforms.insertText(editor, content || "link", {
        at: Editor.range(editor, linkPath),
      });
      Transforms.setNodes(editor, { url }, { at: linkPath });
    }
  };

  const editPanel = (
    <Form size="small">
      <Row gutter={8} style={{ flexDirection: "column", width: 300 }}>
        <Col flex="1">
          <Form.Item label="操作" style={formItemStyle}>
            <Button size="small" onClick={visitLink}>
              <SelectOutlined title="访问链接" /> 访问链接
            </Button>
            &nbsp;
            <Button size="small" onMouseDown={cancelLink}>
              <DisconnectOutlined title="取消链接" /> 取消链接
            </Button>
          </Form.Item>
        </Col>
        <Col flex="1">
          <Form.Item label="文字" style={formItemStyle}>
            <Input
              value={content}
              onChange={(el: any) => {
                setContent(el.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label="链接" style={formItemStyle}>
            <Input
              value={url}
              onChange={(el: any) => {
                setUrl(el.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Row justify="end">
          <Button
            type="primary"
            style={{ width: 100, marginRight: 4 }}
            onClick={submitChange}
          >
            确定
          </Button>
        </Row>
      </Row>
    </Form>
  );

  const initEditPanel = () => {
    const linkWrapper = attributes.ref.current;
    const link = linkWrapper.querySelector("a");

    if (!link) return;

    setUrl(link.href);
    setContent(link.innerText);
  };

  return (
    <div {...attributes} style={{ display: "inline", position: "relative" }}>
      <Popover
        placement="bottomLeft"
        content={editPanel}
        trigger={readOnly ? [] : ["hover"]}
      >
        <a
          href={element.url}
          target="__blank"
          onMouseEnter={() => initEditPanel()}
        >
          {children}
        </a>
      </Popover>
    </div>
  );
};
