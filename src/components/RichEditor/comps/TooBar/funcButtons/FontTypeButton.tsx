import { Editor, Element, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { EditorType, CET, CypressFlagValues } from "../../../common/Defines";
import { utils } from "../../../common/utils";
import { TableLogic } from "../../Table";
import { ToDoListLogic } from "../../TodoListComp";
import { ValueSelector } from "../common/ValueSelector";

export const FontTypeButton = () => {
  const editor = useSlateStatic();

  const setTextWrapper = (type: CET) => {
    const tds = TableLogic.getSelectedTds(editor);
    if (tds.length > 0) {
      tds.forEach((td) => {
        Transforms.setNodes(
          editor,
          {
            type,
          },
          {
            at: td[1],
            match(n) {
              return utils.isTextWrapper(n);
            },
          }
        );
      });
    } else {
      Transforms.setNodes(
        editor,
        { type: type },
        {
          hanging: true,
          mode: "lowest",
          match(n) {
            return utils.isTextWrapper(n);
          },
        }
      );

      const todos = Array.from(
        Editor.nodes(editor, { match: (n) => ToDoListLogic.isTodoList(n) })
      );
      if (todos) {
        todos.forEach((todo) => {
          const parent = Editor.parent(editor, todo[1]);
          if (utils.isTextWrapper(parent[0])) {
            Transforms.setNodes(
              editor,
              { type },
              {
                at: parent[1],
              }
            );
          } else
            Transforms.wrapNodes(
              editor,
              { type, children: [] },
              {
                at: todo[1],
              }
            );
        });
      }
    }
  };

  return (
    <ValueSelector
      getValue={(editor: EditorType) => {
        const [node] = Editor.nodes(editor, {
          match(n) {
            return utils.isTextWrapper(n);
          },
        });
        if (!node) return "正文";
        const type = Element.isElement(node[0]) && node[0].type;
        return type === "div" || type === false ? "正文" : type.toUpperCase();
      }}
      options={["H1", "H2", "H3", "H4", "正文"]}
      optionLabelRender={(value) => {
        return <span>{value}</span>;
      }}
      title="字体样式"
      cypressId={CypressFlagValues.WRAP_FONT_COMP}
      afterSelect={(value) => {
        if (value === "H1") setTextWrapper(CET.H1);
        if (value === "H2") setTextWrapper(CET.H2);
        if (value === "H3") setTextWrapper(CET.H3);
        if (value === "H4") setTextWrapper(CET.H4);
        if (value === "正文") setTextWrapper(CET.DIV);
      }}
    ></ValueSelector>
  );
};
