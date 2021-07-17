import { Tooltip, Button } from "antd";

export const StaticButton: React.FC<{
  title: string;
  mousedownFunc: (e: any) => void;
  disabled?: boolean;
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
        {props.children}
      </Button>
    </Tooltip>
  );
};
