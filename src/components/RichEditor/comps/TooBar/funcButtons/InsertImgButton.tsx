import { PictureOutlined } from "@ant-design/icons";
import { message } from "antd";
import { InputHTMLAttributes } from "react";
import { useRef } from "react";
import { Element, Range, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET, EditorCompPropShape, EditorType } from "../../../common/Defines";
import { ReactButton } from "../common/ReactButton";
import axios from "axios";

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

const verifyImg: NonNullable<
  EditorCompPropShape["customUploadImg"]
>["verifyImg"] = (files) => {
  const legalFiles: File[] = [];
  const illegalFiles: File[] = [];
  // all img types https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  Array.isArray(files) &&
    Array.from(files).forEach((file) => {
      if (!acceptImgTypes.includes(file.type) || file.size > maxSize) {
        illegalFiles.push(file);
      } else {
        legalFiles.push(file);
      }
    });

  if (illegalFiles.length > 0) {
    message.error(
      illegalFiles.map((file) => file.name).join("，") +
        `，文件格式非法（或超过最大限制${maxSize / 1024 / 1024}M）`
    );
  }
  return legalFiles;
};

function sleep() {
  return new Promise<void>((rel) => {
    setTimeout(() => {
      rel();
    }, 300);
  });
}

const uploadImg: NonNullable<
  EditorCompPropShape["customUploadImg"]
>["uploadImg"] = async (file) => {
  try {
    let formData = new FormData();
    formData.append("file", file);
    const res = await axios({
      method: "post",
      url: "http://localhost:3001/uploadFile",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data;charset=UTF-8",
      },
      timeout: 1000,
    });
    return `http://localhost:3001/${res?.data?.[0]?.filename}`;
  } catch (error) {
    await sleep();
    return null;
  }
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

export const insertImg = (
  editor: EditorType,
  files: FileList | File[],
  customUploadImg: EditorCompPropShape["customUploadImg"] = {
    verifyImg,
    uploadImg,
  }
) => {
  files = Array.from(files);
  const legalFiles = customUploadImg.verifyImg(files);

  for (const file of legalFiles) {
    insertImgToEditor(
      editor,
      URL.createObjectURL(file),
      new Date().getTime(),
      async (id: number) => {
        const url = await customUploadImg.uploadImg(file);
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

export const InsertImgButton = () => {
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

    insertImg(editor, files, editor.customProps?.customUploadImg);
  };

  return (
    <ReactButton
      title={
        <span className="customToolBarTitle">
          插入图片
          <br />
          <span className="customToolBarTitle_subTitle">
            支持格式：{acceptImgTypes.join("，").replace(/image\//gi, ".")}
          </span>
        </span>
      }
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
