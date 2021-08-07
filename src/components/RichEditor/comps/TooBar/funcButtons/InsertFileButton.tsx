import { FolderOpenOutlined } from "@ant-design/icons";
import { message } from "antd";
import { InputHTMLAttributes } from "react";
import { useRef } from "react";
import { Element, Range, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { CET, EditorType } from "../../../common/Defines";
import { ReactButton } from "../common/ReactButton";

const acceptFileTypes = [
  ".doc",
  ".docx",
  ".xlsx",
  ".csv",
  ".pdf",
  ".txt",
  ".zip",
  ".7z",
  ".ppt",
  ".pptx",
];

const maxSize = 1024 * 1024 * 10; // 10M

function delay(url: string): Promise<string> {
  return new Promise((rel) => {
    setTimeout(() => {
      rel(url);
    }, 2000);
  });
}

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

const uploadFile = async (file: File): Promise<string> => {
  return await delay(URL.createObjectURL(file));
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
      title={`插入文件（支持格式：${acceptFileTypes.join("，")}）`}
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
      <FolderOpenOutlined />
    </ReactButton>
  );
};
