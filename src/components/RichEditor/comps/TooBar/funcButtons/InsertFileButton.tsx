import { PaperClipOutlined } from "@ant-design/icons";
import { message } from "antd";
import { InputHTMLAttributes } from "react";
import { useRef } from "react";
import { Element, Range, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET, EditorType } from "../../../common/Defines";
import { ReactButton } from "../common/ReactButton";
import axios from "axios";

const acceptFileTypes = [
  ".doc",
  ".docx",
  ".xlsx",
  ".xls",
  ".csv",
  ".pdf",
  ".txt",
  ".zip",
  ".7z",
  ".ppt",
  ".pptx",
];

const maxSize = 1024 * 1024 * 10; // 10M

const valideFile: (param: FileList | File[] | null) => {
  legalFiles: File[];
  illegalFiles: File[];
} = (files) => {
  const legalFiles: File[] = [];
  const illegalFiles: File[] = [];

  Array.isArray(files) &&
    Array.from(files).forEach((file) => {
      const type = file.name.match(/\.\w+$/g)?.[0];
      if (!type || !acceptFileTypes.includes(type) || file.size > maxSize) {
        illegalFiles.push(file);
      } else {
        legalFiles.push(file);
      }
    });

  return {
    legalFiles,
    illegalFiles,
  };
};

function sleep() {
  return new Promise<void>((rel) => {
    setTimeout(() => {
      rel();
    }, 2000);
  });
}

const uploadFile = async (file: File): Promise<string> => {
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
    });
    return `http://localhost:3001/${res?.data?.[0]?.filename}`;
  } catch (error) {
    await sleep();
    return URL.createObjectURL(file);
  }
};

const insertFileToEditor = (
  editor: EditorType,
  url: string,
  fileName: string,
  id: number,
  callback: Function
) => {
  if (editor.selection && Range.isExpanded(editor.selection)) {
    Transforms.collapse(editor, { edge: "end" });
  }
  Transforms.insertNodes(editor, {
    type: CET.FILE,
    url,
    fileName,
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

export const insertFile = (editor: EditorType, files: FileList | File[]) => {
  files = Array.from(files);
  const { illegalFiles, legalFiles } = valideFile(files);
  if (illegalFiles.length > 0) {
    message.error(
      illegalFiles.map((file) => file.name).join("，") +
        `，文件格式非法（或超过最大限制${maxSize / 1024 / 1024}M）`
    );
  }

  for (const file of legalFiles) {
    insertFileToEditor(
      editor,
      URL.createObjectURL(file),
      file.name,
      new Date().getTime(),
      async (id: number) => {
        const url = await uploadFile(file);
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

export const InsertFileButton = () => {
  const editor = useSlateStatic();
  const fileRef = useRef<any>();

  const chooseFile = () => {
    if (fileRef.current) {
      fileRef.current.click();
      return;
    }
  };

  const afterChooseFile: InputHTMLAttributes<HTMLInputElement>["onChange"] = (
    e
  ) => {
    const files = e.target.files;
    if (!files) return;

    insertFile(editor, files);
  };

  return (
    <ReactButton
      title={
        <span className="customToolBarTitle">
          插入附件
          <br />
          <span className="customToolBarTitle_subTitle">
            支持格式：{acceptFileTypes.join("，")}
          </span>
        </span>
      }
      mousedownFunc={() => {
        chooseFile();
      }}
      disabledCondition={(editor) => {
        return editor.selection == null;
      }}
    >
      <input
        ref={fileRef}
        type="file"
        multiple
        hidden
        onChange={afterChooseFile}
      ></input>
      <PaperClipOutlined />
    </ReactButton>
  );
};
