import { Button, Tooltip } from "antd";
import _ from "lodash";
import { useState, useRef, useEffect } from "react";
import { useSlate } from "slate-react";
import { CypressFlagValues, EditorType } from "../../../common/Defines";
import { utils } from "../../../common/utils";
import { ToolBarConfig } from "./config";

var isMounted = false;

export const ReactButton: React.FC<{
  title: string;
  mousedownFunc: (e: any) => void;
  disabledCondition?: (editor: EditorType) => boolean;
  cypressId?: CypressFlagValues;
}> = (props) => {
  const editor = useSlate();
  const { mousedownFunc, title, disabledCondition = () => false } = props;
  const [disabled, setDisabled] = useState(false);
  const ref = useRef({
    _isDisabled: _.debounce(() => {
      isMounted && setDisabled(disabledCondition(editor));
    }, ToolBarConfig.calcStatusDelay),
  });
  const buttonRef = useRef(null);
  useEffect(() => {
    isMounted = true;
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ref.current._isDisabled = (() => {}) as any;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    ref.current._isDisabled();
  });
  return (
    <div ref={buttonRef}>
      <Tooltip title={title} mouseEnterDelay={0} mouseLeaveDelay={0}>
        <Button
          className="cyEditor__toolbar__button"
          type={"text"}
          disabled={disabled}
          onMouseDown={(e) => {
            e.preventDefault();
            mousedownFunc(e);
          }}
          {...utils.insertCypressId(props, "cypressId")}
        >
          {props.children}
        </Button>
      </Tooltip>
    </div>
  );
};
