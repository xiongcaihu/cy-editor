/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Transforms } from "slate";
import { RenderElementProps, ReactEditor, useSlateStatic } from "slate-react";

export const LinkComp: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const editor = useSlateStatic();
  const [state, setState] = useState<{
    url?: string;
    content?: string;
    showTool?: boolean;
  }>(() => ({
    url: element.url,
    content: element.content,
    showTool: false,
  }));

  useEffect(() => {
    setState((t) => ({
      ...t,
      url: element.url,
      content: element.content,
    }));
    return () => {
      window.onclick = () => {};
    };
  }, []);

  const showTool = () => {
    if (state.showTool) return;
    setState((t) => ({
      ...t,
      showTool: true,
      url: element.url,
      content: element.content,
    }));

    setTimeout(() => {
      window.onclick = (e: any) => {
        if (e.path.findIndex((o: any) => o?.dataset?.cylinkcomptool == 1) != -1)
          return;
        else {
          hideTool();
        }
      };
    }, 0);
  };

  const hideTool = () => {
    setState((t) => ({
      ...t,
      showTool: false,
    }));
    window.onclick = () => {};
  };

  const openUrl = () => {
    element.url && ReactEditor.isReadOnly(editor) && window.open(element.url);
  };

  const submitChange = () => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      {
        children: [],
        content: state.content,
        url: state.url,
      },
      { at: path }
    );
    hideTool();
  };

  return (
    <div
      contentEditable={false}
      {...attributes}
      style={{
        display: "inline-block",
        userSelect: "auto",
        position: "relative",
      }}
      onClick={showTool}
    >
      <span
        style={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "#69c0ff",
        }}
        onClick={openUrl}
      >
        {element.content}
      </span>
      <div
        data-cylinkcomptool="1"
        style={{
          position: "absolute",
          userSelect: "none",
          fontSize: 12,
          backgroundColor: "#fff",
          display:
            !state.showTool || ReactEditor.isReadOnly(editor)
              ? "none"
              : "block",
          left: 0,
          width: 300,
          top: "100%",
          border: "1px solid",
          color: "unset",
        }}
        contentEditable={false}
      >
        设置链接：
        <input
          type="text"
          value={state.url}
          onChange={(e) => setState((t) => ({ ...t, url: e?.target?.value }))}
        />
        <br></br>
        设置文字：
        <input
          type="text"
          value={state.content}
          onChange={(e) =>
            setState((t) => ({ ...t, content: e?.target?.value }))
          }
        />
        <button onClick={submitChange}>确定</button>
      </div>
      {children}
    </div>
  );
};
