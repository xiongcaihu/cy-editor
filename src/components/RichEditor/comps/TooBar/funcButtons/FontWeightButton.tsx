import { BoldOutlined } from "@ant-design/icons";
import { Marks } from "../../../common/Defines";
import { MarkButton } from "../common/MarkButton";

export const FontWeightButton = () => {
  return (
    <MarkButton title="加粗" mark={Marks.BOLD}>
      <BoldOutlined />
    </MarkButton>
  );
};
