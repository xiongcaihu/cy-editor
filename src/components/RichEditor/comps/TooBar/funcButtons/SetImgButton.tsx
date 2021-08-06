import { PictureOutlined } from "@ant-design/icons";
import { message } from "antd";
import { InputHTMLAttributes } from "react";
import { useRef } from "react";
import { Element, Range, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET, EditorType } from "../../../common/Defines";
import { ReactButton } from "../common/ReactButton";

const acceptImgTypes = [
  "image/apng",
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
];

const maxSize = 1024 * 1024 * 5; // 5M

function delay(url: string): Promise<string> {
  return new Promise((rel) => {
    setTimeout(() => {
      rel(url);
    }, 2000);
  });
}

const valideImg: (param: FileList | File[] | null) => File[] = (files) => {
  if (!files) return [];
  // all img types https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  return Array.from(files).filter((file) => {
    return !acceptImgTypes.includes(file.type) || file.size > maxSize;
  });
};

const uploadImg = async (file: File): Promise<string> => {
  return await delay(URL.createObjectURL(file));
};

const insertImgToEditor = (
  editor: EditorType,
  url: string,
  id: number,
  callback: Function
) => {
  if (editor.selection && Range.isExpanded(editor.selection)) {
    Transforms.collapse(editor, { edge: "end" });
  }
  Transforms.insertNodes(editor, {
    type: CET.IMG,
    url,
    id,
    children: [
      {
        text: "",
      },
    ],
  });
  Transforms.move(editor);
  callback(id);
};

export const insertImg = (editor: EditorType, files: FileList | File[]) => {
  const illegalFiles = valideImg(files);
  if (illegalFiles.length > 0) {
    message.error(
      illegalFiles.map((file) => file.name).join("，") +
        `，文件格式非法（或超过最大限制${maxSize / 1024 / 1024}M）`
    );
    return;
  }

  for (const file of files) {
    insertImgToEditor(
      editor,
      URL.createObjectURL(file),
      new Date().getTime(),
      async (id: number) => {
        const url = await uploadImg(file);
        Transforms.setNodes(
          editor,
          {
            id: null,
            url,
          },
          {
            at: [],
            match(n) {
              return Element.isElement(n) && n.id === id;
            },
          }
        );
      }
    );
  }
};

export const SetImgButton = () => {
  const editor = useSlateStatic();
  const fileRef = useRef<any>();

  const chooseImg = () => {
    if (fileRef.current) {
      fileRef.current.click();
      return;
    }
  };

  const afterChooseImg: InputHTMLAttributes<HTMLInputElement>["onChange"] = (
    e
  ) => {
    const files = e.target.files;
    if (!files) return;

    insertImg(editor, files);
  };

  return (
    <ReactButton
      title={`插入图片（支持格式：${acceptImgTypes
        .join("，")
        .replace(/image\//gi, ".")}）`}
      mousedownFunc={() => {
        chooseImg();
      }}
      disabledCondition={(editor) => {
        return editor.selection == null;
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={afterChooseImg}
      ></input>
      <PictureOutlined />
    </ReactButton>
  );
};
