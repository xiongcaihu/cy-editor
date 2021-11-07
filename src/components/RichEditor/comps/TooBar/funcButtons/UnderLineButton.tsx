import { UnderlineOutlined } from "@ant-design/icons";
import { CypressFlagValues, Marks } from "../../../common/Defines";
import { MarkButton } from "../common/MarkButton";

export const UnderLineButton = () => {
  return (
    <MarkButton
      title="下划线"
      mark={Marks.Underline}
      cypressId={CypressFlagValues.SET_UNDERLINE}
    >
      <UnderlineOutlined />
    </MarkButton>
  );
};
