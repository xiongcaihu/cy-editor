import { Button, Tooltip } from "antd";
import _ from "lodash";
import { useState, useRef, useEffect } from "react";
import { useSlate } from "slate-react";
import { EditorType } from "../../../common/Defines";
import { ToolBarConfig } from "./config";

export const ReactButton: React.FC<{
  title: string;
  mousedownFunc: (e: any) => void;
  disabledCondition?: (editor: EditorType) => boolean;
}> = (props) => {
  const editor = useSlate();
  const { mousedownFunc, title, disabledCondition = () => false } = props;
  const [disabled, setDisabled] = useState(false);
  const ref = useRef({
    _isDisabled: _.debounce(() => {
      setDisabled(disabledCondition(editor));
    }, ToolBarConfig.calcStatusDelay),
  });
  useEffect(() => {
    ref.current._isDisabled();
  });
  return (
    <Tooltip title={title} mouseEnterDelay={0} mouseLeaveDelay={0}>
      <Button
        className="cyEditor__toolbar__button"
        type={"text"}
        disabled={disabled}
        onMouseDown={(e) => {
          e.preventDefault();
          mousedownFunc(e);
        }}
      >
        {props.children}
      </Button>
    </Tooltip>
  );
};
