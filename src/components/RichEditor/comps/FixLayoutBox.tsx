import React, { ReactElement } from "react";
import { FixlayoutBoxId } from "../common/Defines";

const style: React.CSSProperties = {
  position: "absolute",
  zIndex: 999,
};
export const FixLayoutBox: React.FC<{
  visible: boolean;
  left: number;
  top: number;
  childrenComp?: ReactElement<any>;
}> = (props) => {
  const { visible = false, left, top } = props;
  return (
    <div
      id={FixlayoutBoxId}
      style={{
        ...style,
        display: visible === true ? "block" : "none",
        left,
        top,
      }}
    >
      {props.childrenComp}
    </div>
  );
};
