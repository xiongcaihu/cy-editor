import { BoldOutlined } from "@ant-design/icons";
import { CypressFlagValues, Marks } from "../../../common/Defines";
import { MarkButton } from "../common/MarkButton";

export const FontWeightButton = () => {
  return (
    <MarkButton
      title="加粗"
      mark={Marks.BOLD}
      cypressId={CypressFlagValues.SET_BOLD}
    >
      <BoldOutlined />
    </MarkButton>
  );
};
