import { CleanFormatButton } from "./funcButtons/CleanFormatButton";
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
import { SelectCellButton } from "./funcButtons/SelectCellButton";
import { TableAutoWidthButton } from "./funcButtons/TableAutoWidth";
import { Button as InsertCodeButton } from "../../../../externalComps/Code/button";
import { ToolBars } from "../../common/Defines";
import { ReactElement, useContext } from "react";
import { StaticButton } from "./common/StaticButton";
import { EditorContext } from "../../RichEditor";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Divider } from "antd";

const ReadOnlyButton: React.FC<{}> = (props) => {
  const { readOnly, setReadOnly } = useContext(EditorContext);
  const title = readOnly ? "切换到编辑模式" : "切换到只读模式";
  return (
    <StaticButton
      title={title}
      mousedownFunc={() => {
        setReadOnly(!readOnly);
      }}
    >
      {readOnly ? <EyeOutlined /> : <EyeInvisibleOutlined />}
    </StaticButton>
  );
};

const diverComp = (
  <Divider
    style={{ height: 20, backgroundColor: "rgb(0 0 0 / 10%)" }}
    type="vertical"
  />
);

export const ButtonMapper = (() => {
  const obj: {
    [key in ToolBars | "divide"]?: ReactElement;
  } = {};
  obj[ToolBars.FontTypeButton] = <FontTypeButton />;
  obj[ToolBars.FontSizeButton] = <FontSizeButton />;
  obj[ToolBars.TextAlignButton] = <TextAlignButton />;
  obj[ToolBars.CopyFormatButton] = <CopyFormatButton />;
  obj[ToolBars.CleanFormatButton] = <CleanFormatButton />;
  obj[ToolBars.FontColorButton] = <FontColorButton />;
  obj[ToolBars.FontBGColorButton] = <FontBGColorButton />;
  obj[ToolBars.FontWeightButton] = <FontWeightButton />;
  obj[ToolBars.FontStyleButton] = <FontStyleButton />;
  obj[ToolBars.UnderLineButton] = <UnderLineButton />;
  obj[ToolBars.LineThroughButton] = <LineThroughButton />;
  obj[ToolBars.ToDoListButton] = <ToDoListButton />;
  obj[ToolBars.OrderListButton] = <OrderListButton />;
  obj[ToolBars.NormalListButton] = <NormalListButton />;
  obj[ToolBars.InsertTextAfterVoid] = <InsertTextAfterVoid />;
  obj[ToolBars.InsertTextBeforeVoid] = <InsertTextBeforeVoid />;
  obj[ToolBars.SetLinkButton] = <SetLinkButton />;
  obj[ToolBars.InsertImgButton] = <InsertImgButton />;
  obj[ToolBars.InsertFileButton] = <InsertFileButton />;
  obj[ToolBars.InsertTableButton] = <InsertTableButton />;
  obj[ToolBars.TableAutoWidthButton] = <TableAutoWidthButton />;
  obj[ToolBars.DeleteTableButton] = <DeleteTableButton />;
  obj[ToolBars.CopyTableButton] = <CopyTableButton />;
  obj[ToolBars.SelectCellButton] = <SelectCellButton />;
  obj[ToolBars.DeleteColumnButton] = <DeleteColumnButton />;
  obj[ToolBars.DeleteRowButton] = <DeleteRowButton />;
  obj[ToolBars.InsertColumnBeforeCell] = <InsertColumnBeforeCell />;
  obj[ToolBars.InsertColumnAfterCell] = <InsertColumnAfterCell />;
  obj[ToolBars.InsertRowBeforeButton] = <InsertRowBeforeButton />;
  obj[ToolBars.InsertRowAfterButton] = <InsertRowAfterButton />;
  obj[ToolBars.MergeCellButton] = <MergeCellButton />;
  obj[ToolBars.SplitCellButton] = <SplitCellButton />;
  obj[ToolBars.ClearCellButton] = <ClearCellButton />;
  obj[ToolBars.ReadOnlyButton] = <ReadOnlyButton />;
  obj[ToolBars.InsertCodeButton] = <InsertCodeButton />;
  obj.divide = diverComp;
  return obj;
})();
