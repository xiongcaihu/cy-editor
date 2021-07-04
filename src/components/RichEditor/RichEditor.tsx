/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
} from "react";
import {
  createEditor,
  Transforms,
  Editor,
  Operation,
  Selection,
  Text,
} from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  CustomElement,
  EditableProps,
  EditorCompShape,
  Marks,
  StateShape,
} from "./common/Defines";
import { TableLogic } from "./comps/Table";
import { utils } from "./common/utils";
import { ToolBar } from "./comps/ToolBar";
import { TdLogic } from "./comps/Td";
import { withCyWrap } from "./plugins/WithCyWrap";
import { HandleKeyDownEvent } from "./EventHandler/HandleKeyDownEvent/HandleKeyDownEvent";
import { MyElements } from "./RenderElements/MyElements";
import { MyLeaf } from "./RenderElements/RenderLeaf";
import _ from "lodash";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import "./RichEditor.css";

type savedMarksShape =
  | (Partial<
      {
        [key in Marks]: any;
      }
    > &
      Partial<
        {
          [key in keyof CustomElement]: CustomElement[key];
        }
      > & {
        [key: string]: any;
      })
  | null
  | undefined;

export const EditorContext = createContext<{
  savedMarks: savedMarksShape;
  setSavedMarks: (marks: savedMarksShape) => void;
}>({
  savedMarks: null,
  setSavedMarks: () => {},
});

const EditorComp: EditorCompShape = () => {
  /**
   * 解决live refresh问题的链接
   * https://github.com/ianstormtaylor/slate/issues/4081
   */
  // const [editor] = useState(withCyWrap(withHistory(withReact(createEditor()))));
  const [editor] = useState(withCyWrap(withReact(createEditor())));
  const [value, setValue] = useState<StateShape>(TableLogic.model);
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

  useEffect(() => {
    // window.localStorage.removeItem("history");
    // setTimeout(() => {
    //   unitTest(editor);
    // }, 100);
    TableLogic.resetSelectedTds(editor);
  }, []);

  // useEffect(() => {
  //   // console.log(ref.current.preUndos);
  //   // console.log(editor.history.undos);
  //   ref.current.preUndos = _.clone(editor.history.undos);
  // }, [editor.history.undos.length]);

  const renderElement: EditableProps["renderElement"] = useCallback(
    (props) => <MyElements {...props} editorRef={ref}></MyElements>,
    []
  );
  const renderLeaf: EditableProps["renderLeaf"] = useCallback((props) => {
    return <MyLeaf {...props}></MyLeaf>;
  }, []);
  const MyToolBar = useMemo(() => {
    return <ToolBar></ToolBar>;
  }, []);

  const handleSelect = () => {
    // 处理格式刷逻辑
    if (savedMarks != null) {
      const hasSelectTd = TableLogic.getFirstSelectedTd(editor);
      if (hasSelectTd) return;

      const hasTextAlign = savedMarks[Marks.TextAlign];
      const textWrapper = Editor.above(editor, {
        mode: "lowest",
        match(n) {
          return utils.isTextWrapper(n);
        },
      });
      if (!textWrapper) return;
      for (const key of Object.values(Marks)) {
        Editor.removeMark(editor, key);
      }
      if (hasTextAlign) {
        Transforms.unsetNodes(editor, Marks.TextAlign, { at: textWrapper[1] });
      }
      for (const key in savedMarks) {
        Editor.addMark(editor, key, savedMarks[key]);
      }
      if (hasTextAlign) {
        Transforms.setNodes(
          editor,
          {
            [Marks.TextAlign]: savedMarks[Marks.TextAlign],
          },
          { at: textWrapper[1] }
        );
      }
      setSavedMarks(null);
      document.body.style.cursor = "auto";
      editor.selection &&
        Transforms.select(editor, Editor.start(editor, editor.selection));
    }
  };
  const handleFocus = () => {
    ref.current.preSelection &&
      Transforms.select(editor, ref.current.preSelection);
  };
  const handleBlur = () => {
    ref.current.preSelection = editor.selection;
  };
  const handleMouseDown = (e: any) => {
    if (!e.nativeEvent.target) return;
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
          value={{
            savedMarks: savedMarks,
            setSavedMarks: setSavedMarks,
          }}
        >
          {MyToolBar}
          <div
            style={{
              overflow: "auto",
              height: window.screen.availHeight - 200,
              border: "1px solid",
              padding: 12,
            }}
          >
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              autoFocus
              onCompositionStart={() => {
                utils.removeRangeElement(editor);
              }}
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

export default EditorComp;
