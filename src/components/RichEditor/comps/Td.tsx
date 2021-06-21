/* eslint-disable eqeqeq */
import { useCallback } from "react";
import { RenderElementProps } from "slate-react";

export const TD: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  element,
  children,
}) => {
  const ref = useCallback((e) => {
    if (e && e.parentNode && e.parentNode.nextSibling == null) {
      // e.style.visibility = "hidden";
    }
  }, []);
  const ref2 = useCallback((e) => {
    if (
      e &&
      e?.parentNode?.parentNode &&
      e.parentNode.parentNode.nextSibling == null
    ) {
      // e.style.visibility = "hidden";
    }
  }, []);
  return (
    <td
      {...attributes}
      colSpan={element.colSpan}
      style={{
        padding: 4,
        minWidth: 100,
        position: "relative",
      }}
    >
      {children}
      <span
        ref={ref}
        className="resizer"
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

          const getLeftTotalColSpan = (td: any) => {
            let sum = td.colSpan,
              nowTd = td;
            while (nowTd.previousElementSibling != null) {
              nowTd = nowTd.previousElementSibling;
              sum += nowTd.colSpan;
            }
            return sum;
          };

          const cells: any[] = Array.from(
            table.querySelectorAll(":scope>tbody>tr>td")
          ).filter((c: any) => {
            if (
              c.tagName == "TD" &&
              c.cellIndex + getLeftTotalColSpan(c) ==
                cell.cellIndex + getLeftTotalColSpan(cell)
            ) {
              c.initX = c.offsetWidth;
              return true;
            }
            return false;
          });

          const tableInitX = parseInt(window.getComputedStyle(table).width);

          const mouseMoveHandler = function (e: any) {
            const dx = e.clientX - x;
            cells.forEach((c) => {
              c.style.width = c.initX + dx + "px";
            });
            table.style.width = tableInitX + dx + "px";
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
        ref={ref2}
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
            row: any = null,
            table: any = null;

          for (let i = 0, paths = e.nativeEvent.path; i < paths.length; i++) {
            const ele = paths[i];
            if (ele.tagName == "TD") {
              cell = ele;
            }
            if (ele.tagName == "TR") {
              row = ele;
            }
            if (ele.tagName == "TABLE") {
              table = ele;
              break;
            }
          }

          if (cell == null || row == null || table == null) return;

          const cells: any[] = Array.from(row.querySelectorAll(":scope>td"));

          const styles = window.getComputedStyle(cell);
          h = parseInt(styles.height, 10);

          const tableInitY = parseInt(window.getComputedStyle(table).height);

          const mouseMoveHandler = function (e: any) {
            e.preventDefault();
            const dy = e.clientY - y;
            const height = `${h + dy}px`;
            cells.forEach((c) => (c.style.height = height));
            table.style.height = tableInitY + dy + "px";
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
