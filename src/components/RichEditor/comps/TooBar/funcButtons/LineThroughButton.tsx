import { StrikethroughOutlined } from "@ant-design/icons";
import { Marks } from "../../../common/Defines";
import { MarkButton } from "../common/MarkButton";

export const LineThroughButton = () => {
  return (
    <MarkButton title="删除线" mark={Marks.LineThrough}>
      <StrikethroughOutlined />
    </MarkButton>
  );
};
