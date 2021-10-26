import { NodeEntry } from "slate";
import { ReactEditor } from "slate-react";
import { EditorType } from "../../src/components/RichEditor/common/Defines";

export function doSyncFn(fn: Function, timeout?: number) {
  return cy
    .wrap({
      fn: () =>
        new Promise((rel) => {
          if (timeout) {
            setTimeout(() => {
              rel(fn());
            }, timeout);
          } else rel(fn());
        }),
    })
    .invoke("fn");
}

export const getSlateNodeEntry = (
  editor: EditorType,
  jqEl: JQuery<HTMLElement>
): NodeEntry => {
  try {
    const node = ReactEditor.toSlateNode(editor, jqEl.get(0));
    const nodePath = ReactEditor.findPath(editor, node);
    return [node, nodePath];
  } catch (error) {
    console.error("get slate node error");
    console.error(error);
    // eslint-disable-next-line no-throw-literal
    throw "li is null";
  }
};
