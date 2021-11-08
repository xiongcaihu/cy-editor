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
      // 打开选人弹窗
      const openModal = () => {
        const [modalX, modalY] = utils.getCursorPos(editor);

        editor.setFixLayoutBox?.(
          {
            visible: true,
            left: modalX,
            top: modalY + 18,
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
        // 只有当用户mousedown和mouseup都在弹窗范围之外，才关闭
        const isMouseDownOutSide = (e: any) => {
          return !document
            .querySelector(`#${FixlayoutBoxId}`)
            ?.contains(e.target);
        };
        const handlePressEsc = (e: any) => {
          if (e.key === "Escape") {
            editor.setFixLayoutBox?.({ visible: false });
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("keydown", handlePressEsc);
          }
        };
        const handleMouseDown = (e: any) => {
          if (isMouseDownOutSide(e)) {
            editor.setFixLayoutBox?.({ visible: false });
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("keydown", handlePressEsc);
          }
        };
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("keydown", handlePressEsc);
      };
      setTimeout(() => {
        openModal();
      }, 0);
    }
  };

  return editor;
};
