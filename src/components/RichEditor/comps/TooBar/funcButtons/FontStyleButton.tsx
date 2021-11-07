import { ItalicOutlined } from "@ant-design/icons";
import { CypressFlagValues, Marks } from "../../../common/Defines";
import { MarkButton } from "../common/MarkButton";

export const FontStyleButton = () => {
  return (
    <MarkButton
      title="斜体"
      mark={Marks.ITALIC}
      cypressId={CypressFlagValues.SET_ITALIC}
    >
      <ItalicOutlined />
    </MarkButton>
  );
};
