/* eslint-disable eqeqeq */
import { Resizable } from "re-resizable";
import { useState, useEffect } from "react";
import { Transforms } from "slate";
import {
  useSelected,
  ReactEditor,
  RenderElementProps,
  useSlateStatic,
} from "slate-react";
import testImg from "../c.jpg";

export const ImgComp: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const selected = useSelected();
  const editor = useSlateStatic();
  const [state, setState] = useState({
    size: {
      width: element.width || 100,
      height: element.height || 100,
    },
    showTool: false,
  });

  const enableResize = () => {
    return ReactEditor.isReadOnly(editor)
      ? {
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }
      : {
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        };
  };

  useEffect(() => {
    return () => {
      window.onclick = () => {};
    };
  }, []);

  const onResizeStop: ConstructorParameters<
    typeof Resizable
  >[0]["onResizeStop"] = (e, direction, ref, d) => {
    const newWidth = state.size.width + d.width;
    const newHeight = state.size.height + d.height;
    setState((t) => ({
      ...t,
      size: {
        width: newWidth,
        height: newHeight,
      },
    }));
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      {
        children: [],
        width: newWidth,
        height: newHeight,
      },
      { at: path }
    );
  };

  const toggleShowTool = () => {
    if (state.showTool) return;
    setState((t) => ({ ...t, showTool: true }));

    setTimeout(() => {
      window.onclick = (e: any) => {
        if (e.path.findIndex((o: any) => o?.dataset?.cyimgcomptool == 1) != -1)
          return;
        else {
          window.onclick = () => {};
          setState((t) => ({ ...t, showTool: false }));
        }
      };
    }, 0);
  };

  const showBigImg = () => {
    window.open(element.url || testImg);
  };

  const mask = (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        opacity: 0.8,
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
        backgroundColor: "black",
        zIndex: 9,
      }}
    >
      uploading...
    </div>
  );

  return (
    <div
      {...attributes}
      contentEditable={false}
      style={{
        position: "relative",
        display: "inline-block",
        marginRight: 5,
        marginLeft: 5,
        verticalAlign: "bottom",
        boxShadow:
          state.showTool || selected
            ? "0 0 0 3px rgba(180,215,255,.7)"
            : "none",
      }}
      onClick={toggleShowTool}
      onDoubleClick={showBigImg}
    >
      <Resizable
        enable={enableResize()}
        style={{ display: "inline-block" }}
        size={state.size}
        onResizeStop={onResizeStop}
      >
        {element.id ? mask : null}
        <img width="100%" height="100%" alt="" src={element.url}></img>
        {children}
      </Resizable>
    </div>
  );
};
