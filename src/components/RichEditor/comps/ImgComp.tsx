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
        boxShadow: state.showTool || selected ? "0 0 0 3px #B4D5FF" : "none",
      }}
      onClick={toggleShowTool}
    >
      <Resizable
        enable={enableResize()}
        style={{ display: "inline-block" }}
        size={state.size}
        onResizeStop={onResizeStop}
      >
        <img
          width="100%"
          height="100%"
          alt=""
          src={element.url || testImg}
        ></img>
        {children}
      </Resizable>
      <div
        data-cyimgcomptool="1"
        style={{
          position: "absolute",
          display: state.showTool ? "block" : "none",
          left: 0,
          width: 300,
          top: "100%",
          fontSize: 12,
          border: "1px solid",
          color: "unset",
        }}
        contentEditable={false}
      >
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            window.open(element.url || testImg);
          }}
        >
          查看大图
        </button>
        &nbsp;
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            const path = ReactEditor.findPath(editor, element);
            Transforms.removeNodes(editor, { at: path });
          }}
        >
          删除
        </button>
      </div>
    </div>
  );
};
