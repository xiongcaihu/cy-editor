// https://github.com/scniro/react-codemirror2
// https://codemirror.net/doc/manual.html#config
import { Select } from "antd";
import _ from "lodash";
import { Resizable } from "re-resizable";
import { useRef } from "react";
import { useCallback } from "react";
import { useMemo } from "react";
import { useState } from "react";
import { ICodeMirror, Controlled as CodeMirror } from "react-codemirror2";
import { Transforms } from "slate";
import {
  useSlateStatic,
  ReactEditor,
  useReadOnly,
  useSelected,
} from "slate-react";
import { RenderElementProps } from "slate-react/dist/components/editable";
require("codemirror/lib/codemirror.css");
require("codemirror/theme/material.css");
require("codemirror/theme/neat.css");
require("codemirror/theme/darcula.css");
require("codemirror/theme/material-palenight.css");
require("codemirror/mode/xml/xml.js");
require("codemirror/mode/javascript/javascript.js");
require("codemirror/mode/jsx/jsx.js");
require("codemirror/mode/vue/vue.js");
require("codemirror/mode/clike/clike.js");

const lans = [
  {
    title: "html",
    value: "text/html",
  },
  {
    title: "javascript",
    value: "javascript",
  },
  {
    title: "react",
    value: "text/jsx",
  },
  {
    title: "react-ts",
    value: "text/typescript-jsx",
  },
  {
    title: "vue",
    value: "vue",
  },
  {
    title: "java",
    value: "text/x-java",
  },
  {
    title: "c++",
    value: "text/x-c++src",
  },
];

export const CodeComp: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
  element,
}) => {
  const readOnly = useReadOnly();
  const editor = useSlateStatic();
  const [state, setState] = useState({
    size: {
      width: "100%",
      height: element.height || 300,
    },
    showTool: false,
  });
  const [code, setCode] = useState(element.defaultCode || "");
  const codeIns = useRef<any>(null);
  const saveContent = useRef<any>(
    _.debounce((value) => {
      const path = ReactEditor.findPath(editor, element);
      Transforms.setNodes(
        editor,
        {
          children: [],
          defaultCode: value,
        },
        { at: path }
      );
    }, 100)
  );
  const codeConfig = useMemo(() => {
    return {
      mode: element.defaultMode,
      theme: "darcula",
      lineNumbers: true,
      readOnly: readOnly ? "nocursor" : false,
    };
  }, [element.defaultMode, readOnly]);

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
          top: false,
          right: false,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        };
  };
  const onResizeStop: ConstructorParameters<
    typeof Resizable
  >[0]["onResizeStop"] = (e, direction, ref, d) => {
    setState((t) => ({
      ...t,
      size: {
        ...t.size,
        height: ref.offsetHeight,
      },
    }));
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      {
        children: [],
        height: ref.offsetHeight,
      },
      { at: path }
    );
  };

  const onLanChange = (value: string) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      {
        children: [],
        defaultMode: value,
      },
      { at: path }
    );
  };
  const editorDidMount: ICodeMirror["editorDidMount"] = useCallback(
    (editor: any) => {
      codeIns.current = editor;
      editor.setSize("100%", element.height);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const onEditorChange: ICodeMirror["onChange"] = useCallback(
    (editor, data, value) => {
      saveContent.current(value);
    },
    [saveContent]
  );

  return (
    <div {...attributes} contentEditable={false}>
      <Resizable
        enable={enableResize()}
        style={{ display: "inline-block", position: "relative" }}
        size={state.size}
        onResizeStop={onResizeStop}
        onResize={(a, b, c, d) => {
          codeIns.current?.setSize("100%", c.offsetHeight);
        }}
      >
        <div
          style={{
            color: "white",
            position: "absolute",
            right: 30,
            top: 5,
            zIndex: 7,
          }}
        >
          <Select
            size="small"
            defaultValue={element.defaultMode}
            style={{ width: 120, color: "white", textAlign: "right" }}
            bordered={false}
            showArrow={false}
            onChange={onLanChange}
          >
            {lans.map((lan) => {
              return (
                <Select.Option key={lan.value} value={lan.value}>
                  {lan.title}
                </Select.Option>
              );
            })}
          </Select>
        </div>
        {useMemo(() => {
          return (
            <CodeMirror
              value={code}
              onBeforeChange={(editor, data, value) => {
                setCode(value);
              }}
              options={codeConfig}
              onChange={onEditorChange}
              editorDidMount={editorDidMount}
            />
          );
        }, [code, codeConfig, editorDidMount, onEditorChange])}
      </Resizable>
      {children}
    </div>
  );
};
