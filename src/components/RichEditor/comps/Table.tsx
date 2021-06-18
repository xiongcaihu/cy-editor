/* eslint-disable eqeqeq */
import { RenderElementProps } from "slate-react";

declare module "react" {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    border?: any;
  }
}

export const Table: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  element,
  children,
}) => {
  return (
    <table
      border="1"
      {...attributes}
      style={{ width: "100%", wordBreak: "break-all" }}
    >
      {children}
    </table>
  );
};
