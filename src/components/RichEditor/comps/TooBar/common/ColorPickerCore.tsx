import { DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";
import { CompactPicker } from "react-color";

export const ColorPickerCore: React.FC<{
  value: string;
  onChange?: (color?: string) => void;
}> = (props) => {
  const [color, setColor] = useState<{ hex: any }>({
    hex: props.value,
  });

  return (
    <div
      style={{
        padding: 8,
        display: "flex",
        justifyContent: "flex-start",
        backgroundColor: "white",
        flexDirection: "column",
      }}
      className="cyEditor__toolbar__colorPanelWrapper"
    >
      <CompactPicker
        color={color.hex}
        onChange={(color) => {
          setColor(color);
          props?.onChange?.(color.hex);
        }}
      ></CompactPicker>
      <Button
        icon={<DeleteOutlined></DeleteOutlined>}
        size="small"
        onClick={() => {
          props?.onChange?.("unset");
          setColor({ hex: "" });
        }}
      >
        重置
      </Button>
    </div>
  );
};
