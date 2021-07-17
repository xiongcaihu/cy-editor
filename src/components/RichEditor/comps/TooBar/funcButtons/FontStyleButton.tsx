import { ItalicOutlined } from "@ant-design/icons";
import { Marks } from "../../../common/Defines";
import { MarkButton } from "../common/MarkButton";

export const FontStyleButton = () => {
  return (
    <MarkButton title="斜体" mark={Marks.ITALIC}>
      <ItalicOutlined />
    </MarkButton>
  );
};
