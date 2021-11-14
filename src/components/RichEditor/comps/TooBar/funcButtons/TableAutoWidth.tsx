import { ColumnWidthOutlined } from "@ant-design/icons";
import { Editor, Element, NodeEntry, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { TableLogic } from "../../Table";
import { ReactButton } from "../common/ReactButton";

export const TableAutoWidthButton = () => {
  const editor = useSlateStatic();

  return (
    <ReactButton
      title={
        <span className="customToolBarTitle">
          表格(应用/取消)自适应
          <br />
          <span className="customToolBarTitle_subTitle">
            自适应模式：表格单元格最小宽度为100px，当所有单元格最小宽度加起来超过表格所处文档宽度，那么会出现滚动条。
          </span>
        </span>
      }
      mousedownFunc={() => {
        const isInTable =
          TableLogic.isInTable(editor) || TableLogic.getFirstSelectedTd(editor);
        if (isInTable) {
          var table: NodeEntry = null as any;
          if (editor.selection) {
            table = Array.from(
              Editor.nodes(editor, {
                mode: "highest",
                match: (n) => TableLogic.isTable(n),
              })
            )?.[0];
          } else {
            const td = TableLogic.getFirstSelectedTd(editor);
            if (td) {
              table =
                Editor.above(editor, {
                  match: (n) => TableLogic.isTable(n),
                  at: td[1],
                }) || (null as any);
            }
          }
          if (!table) return;
          const isAutoWidth =
            Element.isElement(table[0]) && table[0].tdAutoWidth;
          Editor.withoutNormalizing(editor, () => {
            Transforms.setNodes(
              editor,
              {
                tdAutoWidth: !isAutoWidth,
              },
              {
                at: table[1],
              }
            );
            Transforms.setNodes(
              editor,
              {
                tdAutoWidth: !isAutoWidth,
              },
              {
                at: table[1],
                mode: "lowest",
                match: (n) => TableLogic.isTd(n),
              }
            );
          });
        }
      }}
      disabledCondition={(editor) => {
        return (
          !TableLogic.isInTable(editor) &&
          TableLogic.getSelectedTdsSize(editor) === 0
        );
      }}
    >
      <ColumnWidthOutlined />
    </ReactButton>
  );
};
