import { OrderedListOutlined } from "@ant-design/icons";
import { useSlateStatic } from "slate-react";
import { CET, CypressFlagValues } from "../../../common/Defines";
import { ListLogic } from "../../ListComp";
import { ReactButton } from "../common/ReactButton";

export const OrderListButton = () => {
  const editor = useSlateStatic();

  const setNumberList = () => {
    ListLogic.toggleList(editor, CET.NUMBER_LIST);
  };

  return (
    <ReactButton
      title="有序列表"
      mousedownFunc={() => {
        setNumberList();
      }}
      disabledCondition={(editor) => {
        return editor.selection == null;
      }}
      cypressId={CypressFlagValues.ORDER_LIST}
    >
      <OrderedListOutlined />
    </ReactButton>
  );
};
