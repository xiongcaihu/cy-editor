import { Tooltip, Button } from "antd";
import { CypressFlagValues } from "../../../common/Defines";
import { utils } from "../../../common/utils";

export const StaticButton: React.FC<{
  title: string;
  mousedownFunc: (e: any) => void;
  disabled?: boolean;
  cypressId?: CypressFlagValues;
}> = (props) => {
  return (
    <Tooltip title={props.title} mouseEnterDelay={0} mouseLeaveDelay={0}>
      <Button
        className="cyEditor__toolbar__button"
        type={"text"}
        disabled={props.disabled}
        onMouseDown={(e) => {
          e.preventDefault();
          props.mousedownFunc(e);
        }}
      >
        <span {...utils.insertCypressId(props, "cypressId")}>
          {props.children}
        </span>
      </Button>
    </Tooltip>
  );
};
