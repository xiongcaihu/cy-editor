import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  ReactElement,
} from "react";
import { createEditor, Transforms, Editor, Operation, Selection } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import {
  CET,
  CustomElement,
  EditableProps,
  EditorCompShape,
  EditorContainerClassName,
  EditorType,
  Marks,
  StateShape,
  ToolBars,
} from "./common/Defines";
import { TableLogic } from "./comps/Table";
import { utils } from "./common/utils";
import { ToolBar } from "./comps/TooBar/ToolBar";
import { TdLogic } from "./comps/Td";
import { withCyWrap } from "./plugins/WithCyWrap";
import { HandleKeyDownEvent } from "./EventHandler/HandleKeyDownEvent/HandleKeyDownEvent";
import { MyElements } from "./RenderElements/MyElements";
import { MyLeaf } from "./RenderElements/RenderLeaf";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import "./RichEditor.css";
import { getCopyedCells } from "./common/globalStore";
import { FixLayoutBox } from "./comps/FixLayoutBox";
import { ToDoListLogic } from "./comps/TodoListComp";
import codeComp from "../../externalComps/Code/index";
import atPerson from "../../externalComps/AtPerson/index";

type savedMarksShape =
  | (Partial<{
      [key in Marks]: any;
    }> &
      Partial<{
        [key in keyof CustomElement]: CustomElement[key];
      }> & {
        [key: string]: any;
      })
  | null
  | undefined;

export const EditorContext = createContext<{
  savedMarks: savedMarksShape;
  setSavedMarks: (marks: savedMarksShape) => void;
  readOnly: boolean;
  setReadOnly: (value: boolean) => void;
}>({
  savedMarks: null,
  setSavedMarks: () => {},
  readOnly: false,
  setReadOnly: () => {},
});

const loadPlugins = (plugins: ((editor: EditorType) => EditorType)[]) => {
  return plugins.reduceRight((p, c) => {
    return c(p);
  }, createEditor());
};

const EditorComp: EditorCompShape = (props) => {
  const { plugins } = props;
  const editorDomRef = useRef<any>(null);

  const [fixBox, setFixBox] = useState<{
    left: number;
    top: number;
    visible: boolean;
    childrenComp?: ReactElement<any>;
  }>({
    left: 0,
    top: 0,
    visible: false,
  });

  /**
   * 解决live refresh问题的链接
   * https://github.com/ianstormtaylor/slate/issues/4081
   */
  const [editor] = useState(() =>
    loadPlugins([
      (editor) => {
        // 定义浮窗打开逻辑
        editor.setFixLayoutBox = ({ left = 0, top = 0, visible }, children) => {
          setFixBox((t) => ({
            ...t,
            left,
            top,
            visible,
            childrenComp: children,
          }));
        };
        return editor;
      },
      ...(plugins?.map((plugin) => plugin.rule) || []),
      withCyWrap,
      withHistory,
      withReact,
    ])
  );
  const [value, setValue] = useState<StateShape>(() => {
    const content =
      props.content ||
      window.localStorage.getItem("savedContent") ||
      JSON.stringify([{ type: CET.DIV, children: [{ text: "" }] }]);
    // return TableLogic.model || JSON.parse(content);
    return JSON.parse(content);
  });
  const ref = useRef<{
    preUndos: Operation[][];
    preSelection: Selection | null;
  }>({
    preUndos: [],
    preSelection: null,
  });
  const [savedMarks, setSavedMarks] = useState<savedMarksShape>();

  useEffect(() => {
    if (savedMarks != null) {
      document.body.style.cursor = "copy";
    } else {
      document.body.style.cursor = "auto";
    }
  }, [savedMarks]);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    props.getEditor?.(editor);
  }, [editor, fixBox, props]);

  const renderElement: EditableProps["renderElement"] = useCallback(
    (props) => (
      <MyElements
        {...props}
        comps={plugins?.map((plugin) => ({
          comp: plugin.comp,
          name: plugin.name,
        }))}
        editorRef={ref}
      ></MyElements>
    ),
    [plugins]
  );
  const renderLeaf: EditableProps["renderLeaf"] = useCallback((props) => {
    return <MyLeaf {...props}></MyLeaf>;
  }, []);
  const MyToolBar = useMemo(() => {
    return <ToolBar buttons={props.toolbars || []}></ToolBar>;
  }, [props.toolbars]);

  const handleSelect = () => {
    // 处理格式刷逻辑
    if (savedMarks != null) {
      const hasSelectTd = TableLogic.getFirstSelectedTd(editor);
      if (hasSelectTd) return;

      const hasTextAlign = savedMarks[Marks.TextAlign];
      const textWrappers =
        Array.from(
          Editor.nodes(editor, {
            // at: editor.selection?.anchor,
            mode: "lowest",
            match(n) {
              return utils.isTextWrapper(n) || ToDoListLogic.isTodoList(n);
            },
          })
        ) || [];

      for (const key of Object.values(Marks)) {
        Editor.removeMark(editor, key);
      }

      textWrappers.forEach((textWrapper) => {
        Transforms.unsetNodes(editor, Marks.TextAlign, {
          at: textWrapper[1],
        });
      });

      for (const key in savedMarks) {
        if (key === "children") continue;
        Editor.addMark(editor, key, savedMarks[key]);
      }
      if (hasTextAlign) {
        textWrappers.forEach((textWrapper) => {
          Transforms.setNodes(
            editor,
            {
              [Marks.TextAlign]: savedMarks[Marks.TextAlign],
            },
            { at: textWrapper[1] }
          );
        });
      }
      setSavedMarks(null);
      document.body.style.cursor = "auto";
      editor.selection &&
        Transforms.select(editor, Editor.start(editor, editor.selection));
    }
  };
  const handleFocus = () => {
    ref.current.preSelection &&
      Editor.hasPath(editor, ref.current.preSelection.anchor.path) &&
      Editor.hasPath(editor, ref.current.preSelection.focus.path) &&
      Transforms.select(editor, ref.current.preSelection);
  };
  const handleBlur = () => {
    ref.current.preSelection = editor.selection;
  };
  const handleMouseDown = (e: any) => {
    // 取消所有表格的选中状态，因为表格部分已经阻止了自己的mousedown事件传递到父组件，所以只要能在这里触发的，都肯定不是在表格里
    TdLogic.deselectAllTd(editor);
  };
  const handleKeyDown = (e: any) => HandleKeyDownEvent(e, editor);

  return (
    <div className="cyEditor" style={{ position: "relative" }}>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
      >
        <EditorContext.Provider
          value={useMemo(() => {
            return {
              savedMarks: savedMarks,
              setSavedMarks: setSavedMarks,
              readOnly,
              setReadOnly,
            };
          }, [readOnly, savedMarks])}
        >
          {(props.toolbars || []).length === 0 ? null : MyToolBar}
          <div
            className={EditorContainerClassName}
            ref={editorDomRef}
            style={{
              overflowY: "auto",
              overflowX: "hidden",
              height: window.screen.availHeight - 200,
              border: "1px solid",
              padding: 12,
              position: "relative",
            }}
          >
            <FixLayoutBox {...fixBox}></FixLayoutBox>
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              autoFocus
              readOnly={readOnly}
              onCompositionStart={() => {
                utils.removeRangeElement(editor);
              }}
              onDOMBeforeInput={(e) => {
                // 当插入内容来源粘贴时，如果此时有已经复制的表格内容，那么拦截默认行为。
                if (e.inputType === "insertFromPaste") {
                  const copyedCells = getCopyedCells() || [];
                  if (copyedCells.length > 0) {
                    e.preventDefault();
                    ReactEditor.insertData(editor, utils.getDataTransfer([]));
                  }
                }
              }}
              placeholder="welcome to cyEditor!"
              onKeyDown={handleKeyDown}
              onMouseDown={handleMouseDown}
              onDragStart={(e) => {
                e.preventDefault();
              }}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onSelect={handleSelect}
            />
          </div>
        </EditorContext.Provider>
      </Slate>
    </div>
  );
};

const CyReactEditor: EditorCompShape = (props) => {
  return (
    <EditorComp
      plugins={props.plugins || [codeComp, atPerson]}
      toolbars={props.toolbars || Object.values(ToolBars)}
    />
  );
};

export default CyReactEditor;
