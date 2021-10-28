/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable eqeqeq */
import { Col, Row, Divider } from "antd";
import { Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import _ from "lodash";
import { SaveOutlined } from "@ant-design/icons";
import "./ToolBar.css";
import React, { useContext, useEffect } from "react";
import { EditorContext } from "../../RichEditor";
import { slateToHtml } from "../../common/slateToHtml";
import { htmlToSlate } from "../../common/htmlToSlate";
import { CleanFormatButton } from "./funcButtons/CleanFormatButton";
import { StaticButton } from "./common/StaticButton";
import { CopyFormatButton } from "./funcButtons/CopyFormatButton";
import { TextAlignButton } from "./funcButtons/TextAlignButton";
import { FontSizeButton } from "./funcButtons/FontSizeButton";
import { FontTypeButton } from "./funcButtons/FontTypeButton";
import { FontColorButton } from "./funcButtons/FontColorButton";
import { FontBGColorButton } from "./funcButtons/FontBGColorButton";
import { FontWeightButton } from "./funcButtons/FontWeightButton";
import { FontStyleButton } from "./funcButtons/FontStyleButton";
import { UnderLineButton } from "./funcButtons/UnderLineButton";
import { LineThroughButton } from "./funcButtons/LineThroughButton";
import { ToDoListButton } from "./funcButtons/ToDoListButton";
import { OrderListButton } from "./funcButtons/OrderListButton";
import { NormalListButton } from "./funcButtons/NormalListButton";
import { SetLinkButton } from "./funcButtons/SetLinkButton";
import { InsertImgButton } from "./funcButtons/InsertImgButton";
import { InsertFileButton } from "./funcButtons/InsertFileButton";
import { InsertTableButton } from "./funcButtons/InsertTableButton";
import { DeleteTableButton } from "./funcButtons/DeleteTableButton";
import { CopyTableButton } from "./funcButtons/CopyTableButton";
import { DeleteColumnButton } from "./funcButtons/DeleteColumnButton";
import { DeleteRowButton } from "./funcButtons/DeleteRowButton";
import { InsertTextAfterVoid } from "./funcButtons/InsertTextAfterVoid";
import { InsertTextBeforeVoid } from "./funcButtons/InsertTextBeforeVoid";
import { InsertColumnBeforeCell } from "./funcButtons/InsertColumnBeforeCell";
import { InsertColumnAfterCell } from "./funcButtons/InsertColumnAfterCell";
import { InsertRowBeforeButton } from "./funcButtons/InsertRowBeforeButton";
import { InsertRowAfterButton } from "./funcButtons/InsertRowAfterButton";
import { MergeCellButton } from "./funcButtons/MergeCellButton";
import { SplitCellButton } from "./funcButtons/SplitCellButton";
import { ClearCellButton } from "./funcButtons/ClearCellButton";
import { CET } from "../../common/Defines";
import { SelectCellButton } from "./funcButtons/SelectCellButton";

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

export const ToolBar: React.FC<{
  moreButtons?: React.FC[];
}> = (props) => {
  const editor = useSlateStatic();

  const diverComp = (
    <Divider
      style={{ height: 20, backgroundColor: "rgb(0 0 0 / 10%)" }}
      type="vertical"
    />
  );

  return (
    <div
      className="cyEditor__toolBar"
      style={{ position: "relative", marginBottom: 4 }}
    >
      <Row align="middle">
        {/* 设置字体规格 */}
        <Col>
          <FontTypeButton></FontTypeButton>
        </Col>
        {/* 设置字体大小 */}
        <Col>
          <FontSizeButton></FontSizeButton>
        </Col>
        {/* 设置对齐方式 */}
        <Col>
          <TextAlignButton></TextAlignButton>
        </Col>
        <Col>{diverComp}</Col>
        <Col>
          <CopyFormatButton></CopyFormatButton>
        </Col>
        <Col>
          <CleanFormatButton></CleanFormatButton>
        </Col>
        <Col>
          <FontColorButton></FontColorButton>
        </Col>
        <Col>
          <FontBGColorButton></FontBGColorButton>
        </Col>
        <Col>
          <FontWeightButton></FontWeightButton>
        </Col>
        <Col>
          <FontStyleButton></FontStyleButton>
        </Col>
        <Col>
          <UnderLineButton></UnderLineButton>
        </Col>
        <Col>
          <LineThroughButton></LineThroughButton>
        </Col>
        <Col>{diverComp}</Col>
        <Col>
          <ToDoListButton></ToDoListButton>
        </Col>
        <Col>
          <OrderListButton></OrderListButton>
        </Col>
        <Col>
          <NormalListButton></NormalListButton>
        </Col>
        <Col>
          <InsertTextAfterVoid></InsertTextAfterVoid>
        </Col>
        <Col>
          <InsertTextBeforeVoid></InsertTextBeforeVoid>
        </Col>
        <Col>
          <SetLinkButton></SetLinkButton>
        </Col>
        <Col>
          <InsertImgButton></InsertImgButton>
        </Col>
        <Col>
          <InsertFileButton></InsertFileButton>
        </Col>
        <Col>{diverComp}</Col>
        <Col>
          <InsertTableButton></InsertTableButton>
        </Col>
        <Col>
          <DeleteTableButton></DeleteTableButton>
        </Col>
        <Col>
          <CopyTableButton></CopyTableButton>
        </Col>
        <Col>
          <SelectCellButton></SelectCellButton>
        </Col>
        <Col>
          <DeleteColumnButton></DeleteColumnButton>
        </Col>
        <Col>
          <DeleteRowButton></DeleteRowButton>
        </Col>
        <Col>
          <InsertColumnBeforeCell></InsertColumnBeforeCell>
        </Col>
        <Col>
          <InsertColumnAfterCell></InsertColumnAfterCell>
        </Col>
        <Col>
          <InsertRowBeforeButton></InsertRowBeforeButton>
        </Col>
        <Col>
          <InsertRowAfterButton></InsertRowAfterButton>
        </Col>
        <Col>
          <MergeCellButton></MergeCellButton>
        </Col>
        <Col>
          <SplitCellButton></SplitCellButton>
        </Col>
        <Col>
          <ClearCellButton></ClearCellButton>
        </Col>
        <Col>{diverComp}</Col>
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
        <Col>
          <ReadOnlyButton></ReadOnlyButton>
        </Col>
        <Col>{diverComp}</Col>
        {(props.moreButtons || []).map((Button, i) => {
          return (
            <Col key={i}>
              <Button></Button>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
