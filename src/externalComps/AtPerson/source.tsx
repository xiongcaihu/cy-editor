/* eslint-disable jsx-a11y/anchor-is-valid */
import { RenderElementProps } from "slate-react";
import { CypressFlagValues, CypressTestFlag } from "../../components/RichEditor/common/Defines";

export type PersonShape = {
  name: string;
  id: number | string; // 工号
  moreInfo?: {
    org?: string; // 组织
    avatarSrc?: string; // 头像链接
    [key: string]: any;
  };
};

export const Source: (props: RenderElementProps) => JSX.Element = ({
  attributes,
  children,
}) => {
  return (
    <a
      {...attributes}
      className={CypressFlagValues.AT_PERSON_TEXT}
      {...{
        [CypressTestFlag]: CypressFlagValues.AT_PERSON_TEXT,
      }}
      style={{ margin: "0 0.2em" }}
    >
      {children}
    </a>
  );
};
