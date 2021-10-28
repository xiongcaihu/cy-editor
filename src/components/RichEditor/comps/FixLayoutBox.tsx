import React from "react";

const style: React.CSSProperties = {
  position: "absolute",
  zIndex: 9999999,
};
export const FixLayoutBox: React.FC<{
  visible: boolean;
  left: number;
  top: number;
  childrenComp?: React.FC<any>;
}> = (props) => {
  const { visible = false, left, top } = props;
  return (
    <div
      style={{
        ...style,
        display: visible === true ? "block" : "none",
        left,
        top,
      }}
    >
      {props.childrenComp ? <props.childrenComp /> : null}
    </div>
  );
};
