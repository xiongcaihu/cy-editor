import { Transforms } from "slate";
import { ReactEditor } from "slate-react";
import {
  EditorType,
  FixlayoutBoxId,
} from "../../components/RichEditor/common/Defines";
import { utils } from "../../components/RichEditor/common/utils";
import { ChoosePersonComp } from "./ChoosePersonComp";

export const type = "atPerson";

export const rule = (editor: EditorType) => {
  const { isInline, insertText } = editor;

  editor.isInline = (node) => {
    if ([type].includes(node.type)) {
      return true;
    }
    return isInline(node);
  };

  editor.insertText = (text) => {
    insertText(text);
    if (text === "@") {
      setTimeout(() => {
        const [modalX, modalY] = utils.getCursorPos(editor);

        editor.setFixLayoutBox?.(
          {
            visible: true,
            left: modalX,
            top: modalY + 16,
          },
          <ChoosePersonComp
            onChange={(persons) => {
              editor.setFixLayoutBox?.({ visible: false });
              ReactEditor.focus(editor);
              Transforms.delete(editor, { reverse: true });
              if (persons) {
                Transforms.insertNodes(
                  editor,
                  persons.map((person) => {
                    return {
                      type,
                      children: [
                        {
                          text: "@" + person.name + person.id,
                        },
                      ],
                    };
                  }) as any
                );
                setTimeout(() => {
                  Transforms.move(editor);
                  Transforms.move(editor, { reverse: true });
                }, 0);
              }
            }}
          ></ChoosePersonComp>
        );
        const handleClick = (e: any) => {
          if (
            !document.querySelector(`#${FixlayoutBoxId}`)?.contains(e.target)
          ) {
            editor.setFixLayoutBox?.({ visible: false });
            window.removeEventListener("click", handleClick);
          }
        };

        window.addEventListener("click", handleClick);
      }, 0);
    }
  };

  return editor;
};
