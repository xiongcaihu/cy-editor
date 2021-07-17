import { Tooltip, Dropdown, Button } from "antd";
import _ from "lodash";
import { useState, useRef, useEffect, useMemo } from "react";
import { Editor, Element } from "slate";
import { useSlate } from "slate-react";
import { Marks } from "../../../common/Defines";
import { TableLogic } from "../../Table";
import { ColorPickerCore } from "./ColorPickerCore";
import { ToolBarConfig } from "./config";

export const ColorPicker: React.FC<{
  title: string;
  onChange?: (color?: string) => void;
  icon?: any;
  mark: Marks;
}> = (props) => {
  const editor = useSlate();
  const [color, setColor] = useState("");
  const [visible, setVisible] = useState(false);
  const ref = useRef<any>({
    _getColor: _.debounce(() => {
      setColor(getColor());
    }, ToolBarConfig.calcStatusDelay),
  });

  const getColor = () => {
    const td = TableLogic.getFirstSelectedTd(editor);
    if (td) {
      return Element.isElement(td[0]) && (td[0][props.mark] || "unset");
    }

    if (!editor.selection) return "unset";
    if (!props.mark) return "unset";
    const marks = Editor.marks(editor);
    return (
      (marks && marks?.[props?.mark]) ||
      window.getComputedStyle(document.body).color
    );
  };

  useEffect(() => {
    ref.current._getColor();
  });

  return useMemo(() => {
    return (
      <Tooltip
        title={props.title}
        zIndex={99}
        mouseLeaveDelay={0}
        mouseEnterDelay={0}
      >
        <div
          onMouseLeave={() => {
            setVisible(false);
          }}
        >
          <Dropdown
            placement="bottomCenter"
            overlayStyle={{ zIndex: 999 }}
            visible={visible}
            overlay={() => {
              return (
                <ColorPickerCore
                  value={color}
                  onChange={(color) => {
                    props?.onChange?.(color);
                    setVisible(false);
                  }}
                ></ColorPickerCore>
              );
            }}
            trigger={["click"]}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
          >
            <Button
              type="text"
              style={{ color }}
              onMouseDown={(e) => {
                e.preventDefault();
                setVisible(true);
              }}
            >
              {props.icon}
            </Button>
          </Dropdown>
        </div>
      </Tooltip>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, visible]);
};
