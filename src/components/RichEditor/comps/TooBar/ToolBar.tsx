/* eslint-disable no-eval */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable eqeqeq */
import { Col, Row } from "antd";
import { useSlateStatic } from "slate-react";
import _ from "lodash";
import { SaveOutlined } from "@ant-design/icons";
import "./ToolBar.css";
import React from "react";
import { ToolBars } from "../../common/Defines";
import { StaticButton } from "./common/StaticButton";
import { ButtonMapper } from "./FuncButtonMapper";

export const ToolBar: React.FC<{
  moreButtons?: React.FC[];
  buttons: (ToolBars | "divide")[];
}> = (props) => {
  const editor = useSlateStatic();

  return (
    <div
      className="cyEditor__toolBar"
      style={{ position: "relative", marginBottom: 4 }}
    >
      <Row align="middle">
        {props.buttons.map((button, index) => {
          return <Col key={index}>{ButtonMapper[button]}</Col>;
        })}
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
        {/* <Col>
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
        </Col> */}
      </Row>
    </div>
  );
};
