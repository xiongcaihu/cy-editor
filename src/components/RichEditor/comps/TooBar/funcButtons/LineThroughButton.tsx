import { StrikethroughOutlined } from "@ant-design/icons";
import { CypressFlagValues, Marks } from "../../../common/Defines";
import { MarkButton } from "../common/MarkButton";

export const LineThroughButton = () => {
  return (
    <MarkButton
      title="删除线"
      mark={Marks.LineThrough}
      cypressId={CypressFlagValues.SET_LINETHROUGH}
    >
      <StrikethroughOutlined />
    </MarkButton>
  );
};
