import { Tooltip, Select } from "antd";
import _ from "lodash";
import { useState, useRef, useEffect, useMemo } from "react";
import { useSlate, ReactEditor } from "slate-react";
import { EditorType } from "../../../common/Defines";
import { ToolBarConfig } from "./config";

export const ValueSelector = (props: {
  options: (string | number)[];
  optionLabelRender?: (value: string | number) => any;
  title: string;
  getValue: (editor: EditorType) => any;
  afterSelect?: (value: string | number) => void;
}) => {
  const editor = useSlate();
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const toolDom = useRef<any>();
  const ref = useRef<any>({
    getValue: _.debounce(() => {
      setValue(props.getValue(editor));
    }, ToolBarConfig.calcStatusDelay),
  });

  useEffect(() => {
    ref.current.getValue();
  });
  return useMemo(() => {
    return (
      <Tooltip
        title={props.title}
        zIndex={99}
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
      >
        <div
          ref={toolDom}
          style={{
            width: 100,
            position: "relative",
          }}
          className="cyEditor__toolbar__button"
          onMouseLeave={() => {
            setVisible(false);
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
              cursor: "pointer",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setVisible(!visible);
            }}
          ></div>
          <Select
            placeholder={props.title}
            value={value}
            bordered={false}
            style={{ width: "100%" }}
            open={visible}
            dropdownClassName="cyEditor__toolbar__dropdown"
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
            onSelect={(value) => {
              ReactEditor.focus(editor);
              props?.afterSelect?.(value);
              setVisible(false);
            }}
          >
            {props.options.map((value) => {
              return (
                <Select.Option value={String(value)} key={value}>
                  {props?.optionLabelRender?.(value) || value}
                </Select.Option>
              );
            })}
          </Select>
        </div>
      </Tooltip>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, value]);
};