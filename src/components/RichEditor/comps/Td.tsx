/* eslint-disable eqeqeq */
import { RenderElementProps } from "slate-react";

export const TD: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  element,
  children,
}) => {
  return (
    <td
      {...attributes}
      colSpan={element.colSpan}
      style={{
        padding: 4,
        minWidth: 50,
        position: "relative",
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          width: 5,
          right: 0,
          top: 0,
          height: "100%",
          cursor: "col-resize",
          userSelect: "none",
        }}
        contentEditable={false}
        onMouseDown={(e: any) => {
          let x = 0;
          let cell: any = null,
            table: any = null;
          x = e.clientX;

          for (let i = 0, paths = e.nativeEvent.path; i < paths.length; i++) {
            const ele = paths[i];
            if (ele.tagName == "TD") {
              cell = ele;
            }
            if (ele.tagName == "TABLE") {
              table = ele;
              break;
            }
          }

          if (cell == null || table == null) return;

          const cells: any[] = Array.from(table.querySelectorAll("td")).filter(
            (c: any) => {
              const end = cell.cellIndex + cell.colSpan - 1;
              if (c.tagName == "TD" && c.cellIndex == end) {
                c.initX = parseInt(window.getComputedStyle(c).width, 10);
                return true;
              }
              return false;
            }
          );

          const mouseMoveHandler = function (e: any) {
            const dx = e.clientX - x;
            cells.forEach((c) => (c.style.width = c.initX + dx + "px"));
          };

          const mouseUpHandler = function () {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
          };

          document.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);
        }}
      ></span>
      <span
        style={{
          position: "absolute",
          width: "100%",
          height: 5,
          left: 0,
          bottom: 0,
          cursor: "row-resize",
          userSelect: "none",
        }}
        contentEditable={false}
        onMouseDown={(e: any) => {
          let y = e.clientY;
          let h = 0;
          let cell: any = null,
            row: any = null;

          for (let i = 0, paths = e.nativeEvent.path; i < paths.length; i++) {
            const ele = paths[i];
            if (ele.tagName == "TD") {
              cell = ele;
            }
            if (ele.tagName == "TR") {
              row = ele;
              break;
            }
          }

          if (cell == null || row == null) return;

          const cells: any[] = Array.from(row.querySelectorAll("td"));

          const styles = window.getComputedStyle(cell);
          h = parseInt(styles.height, 10);

          const mouseMoveHandler = function (e: any) {
            e.preventDefault();
            const dy = e.clientY - y;
            const width = `${h + dy}px`;
            cells.forEach((c) => (c.style.height = width));
          };

          const mouseUpHandler = function () {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
          };

          document.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);
        }}
      ></span>
    </td>
  );
};
