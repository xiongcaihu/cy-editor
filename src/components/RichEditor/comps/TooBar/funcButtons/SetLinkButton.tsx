import { LinkOutlined } from "@ant-design/icons";
import { Editor, Element, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET } from "../../../common/Defines";
import { ReactButton } from "../common/ReactButton";

export const SetLinkButton = () => {
  const editor = useSlateStatic();

  const setLink = () => {
    const [isLinkActive] = Editor.nodes(editor, {
      match(n) {
        return Element.isElement(n) && n.type === CET.LINK;
      },
    });
    if (!isLinkActive) {
      Transforms.wrapNodes(
        editor,
        {
          type: CET.LINK,
          url: "http://www.baidu.com",
          children: [],
        },
        {
          split: true,
        }
      );
    }
  };

  return (
    <ReactButton
      title="设置链接"
      mousedownFunc={() => {
        setLink();
      }}
      disabledCondition={(editor) => {
        return editor.selection == null;
      }}
    >
      <LinkOutlined />
    </ReactButton>
  );
};
