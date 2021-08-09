import Icon from "@ant-design/icons";
import { Transforms, Editor } from "slate";
import { useSlateStatic } from "slate-react";
import { EditorType, Marks } from "../../../common/Defines";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { StaticButton } from "../common/StaticButton";

export const cleanFormat = (editor: EditorType) => {
  const tds = TableLogic.getSelectedTds(editor);
  if (tds.length > 0) {
    for (const td of tds) {
      Transforms.unsetNodes(editor, Object.values(Marks), { at: td[1] });
    }
    return;
  }

  const all = Editor.nodes(editor, {
    mode: "lowest",
    match(n) {
      return utils.isTextWrapper(n);
    },
  });
  for (const el of all) {
    Transforms.unsetNodes(editor, Object.values(Marks), { at: el[1] });
  }

  for (const mark of Object.values(Marks)) {
    Editor.removeMark(editor, mark);
  }
};

export const CleanFormatButton: React.FC<{}> = () => {
  const editor = useSlateStatic();
  return (
    <StaticButton
      title="清除格式"
      mousedownFunc={() => {
        cleanFormat(editor);
      }}
    >
      <Icon
        component={() => (
          <svg
            viewBox="0 0 1084 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="853"
            width="14"
            height="14"
          >
            <defs>
              <style type="text/css"></style>
            </defs>
            <path
              d="M719.329882 422.249412l-255.578353 255.578353 234.315295 234.315294 255.518117-255.638588-234.315294-234.255059zM59.151059 315.813647l298.164706-298.164706a60.235294 60.235294 0 0 1 85.172706 0l596.329411 596.329412a60.235294 60.235294 0 0 1 0 85.172706l-298.164706 298.164706a60.235294 60.235294 0 0 1-85.232941 0l-596.329411-596.329412a60.235294 60.235294 0 0 1 0-85.172706z"
              fill="#333333"
              p-id="854"
            ></path>
          </svg>
        )}
      ></Icon>
    </StaticButton>
  );
};
