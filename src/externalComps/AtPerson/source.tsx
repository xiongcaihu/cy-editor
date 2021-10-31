/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlateStatic,
} from "slate-react";
import { ChoosePersonComp } from "./ChoosePersonComp";
import {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useMemo,
} from "react";
import { Transforms } from "slate";
import {
  CypressFlagValues,
  CypressTestFlag,
} from "../../components/RichEditor/common/Defines";
import { utils } from "../../components/RichEditor/common/utils";

export type PersonShape = {
  name: string;
  id: number | string; // 工号
  moreInfo?: {
    [key: string]: any;
  };
};

export const mountPopComp = (nowNode: HTMLElement) =>
  ((nowNode) => {
    let parent = nowNode.offsetParent as HTMLElement;
    while (parent != null && parent.className !== "cyEditor__content") {
      parent = parent.offsetParent as HTMLElement;
    }
    return parent;
  })(nowNode) || document.body;

export const Source: (props: RenderElementProps) => JSX.Element = ({
  element,
  attributes,
  children,
}) => {
  const editor = useSlateStatic();
  const readonly = useReadOnly();

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "c" && e.ctrlKey) {
      console.log("copy");
    }
  };

  const wrapperButtonStyle: CSSProperties = {
    padding: "0",
    margin: "0 4px",
    border: 0,
    height: "auto",
    borderRadius: 0,
  };

  const person: PersonShape = useMemo(
    () =>
      element.person || {
        name: "点击搜索员工",
      },
    [element.person]
  );

  const ChoosePersonCompCache = useMemo(() => {
    return (
      <ChoosePersonComp
        cypressId={CypressFlagValues.AT_PERSON_MODAL}
        initPerson={person}
        onChange={(person) => {
          Transforms.setNodes(
            editor,
            {
              person,
            },
            {
              at: ReactEditor.findPath(editor, element),
            }
          );
        }}
      />
    );
  }, [editor, element, person]);

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      e.preventDefault();
      if (readonly) return;
      const domNode = ReactEditor.toDOMNode(editor, element);
      const domRect = domNode.getBoundingClientRect();
      if (!domRect) return false;

      const distance = utils.calcOffsetDistanceFromAToB(
        e.target as HTMLElement,
        ReactEditor.toDOMNode(editor, editor)?.offsetParent as any
      );
      editor?.setFixLayoutBox?.(
        {
          visible: true,
          left: distance.offsetLeft + 2, // 这里加4是加的padding距离
          top: distance.offsetTop + domNode.offsetHeight,
        },
        ChoosePersonCompCache
      );

      const afterClick = function (e: any) {
        if (!e.target) return;
        // 如果点击atPerson组件的文字部分
        const isInAtPersonText = Array.from(
          document.querySelectorAll(
            `[${CypressTestFlag}='${CypressFlagValues.AT_PERSON_TEXT}']`
          )
        ).some((text) => text?.contains(e.target));
        // 如果点击弹出的modal部分
        const isInPopModal = document
          .querySelector(
            `[${CypressTestFlag}='${CypressFlagValues.AT_PERSON_MODAL}']`
          )
          ?.contains(e.target);

        // 如果点击了人员选择下拉框里的项
        const isInPropModalSelectDropDownList = (() => {
          let node = e.target;
          while (
            node != null &&
            !node?.className?.includes?.("choosePersonCompDropDown")
          ) {
            node = node.offsetParent as HTMLElement;
          }
          return node != null;
        })();
        if (isInAtPersonText || isInPopModal || isInPropModalSelectDropDownList)
          return;

        // 其他情况：当更新完后再销毁组件，不然会报错
        editor?.setFixLayoutBox?.({
          visible: false,
        });

        window.removeEventListener("click", afterClick);
      };
      window.addEventListener("click", afterClick);
      return false;
    },
    [ChoosePersonCompCache, editor, element, readonly]
  );

  const divAttr = {
    ...attributes,
    style: {
      display: "inline",
      verticalAlign: "baseline",
      ...wrapperButtonStyle,
    },
    contentEditable: false,
    onKeyUp: handleKeyDown,
    [CypressTestFlag]: CypressFlagValues.AT_PERSON_TEXT,
  };

  return (
    <div {...divAttr}>
      <a onClick={handleClick}>@{person.name}</a>
      {/* 虽然是void元素，但是还是需要放children在这里，我也不清楚为什么，不放就报错 */}
      {children}
    </div>
  );
};
