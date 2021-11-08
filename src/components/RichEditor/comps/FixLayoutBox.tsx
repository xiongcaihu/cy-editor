import React, { ReactElement, useLayoutEffect, useRef, useState } from "react";
import { EditorContainerClassName, FixlayoutBoxId } from "../common/Defines";
import { utils } from "../common/utils";

const style: React.CSSProperties = {
  position: "absolute",
  boxSizing: "border-box",
  zIndex: 999,
};
export const FixLayoutBox: React.FC<{
  visible: boolean;
  left: number;
  top: number;
  childrenComp?: ReactElement<any>;
}> = (props) => {
  const { visible = false, left, top } = props;
  const [finalLeft, setFinalLeft] = useState(left);
  const ref = useRef<any>();
  useLayoutEffect(() => {
    if (ref.current && visible && left >= 0) {
      const boxDom = ref.current;
      const boxWidth = boxDom.offsetWidth;
      const editorContainerDom = utils.findParentByClassName(
        boxDom,
        EditorContainerClassName
      ); // 包裹edtior的元素
      if (!editorContainerDom) return;
      const editorContainerWidth = editorContainerDom.offsetWidth;
      // 用来调整浮窗位置，考虑情况，如果在文档最右边需要弹出此浮窗，那么考虑到浮窗还有宽度，又不能超出文档当前页，所以需要再往左移。
      if (left + boxWidth > editorContainerWidth) {
        setFinalLeft(editorContainerWidth - boxWidth - 14); // 完整公式：left - (left + boxWidth - editorContainerWidth ) - 14(滚动条宽度)
      } else {
        setFinalLeft(left);
      }
    }
  }, [left, visible]);

  return (
    <div
      ref={(e) => (ref.current = e)}
      id={FixlayoutBoxId}
      style={{
        ...style,
        display: visible === true ? "block" : "none",
        left: finalLeft,
        top,
      }}
    >
      {props.childrenComp}
    </div>
  );
};
