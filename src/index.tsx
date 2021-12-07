import ReactDOM from "react-dom";
import Editor from "./components/RichEditor/RichEditor";
import "./components/RichEditor/RichEditor.css";

ReactDOM.render(
  <Editor
    customUploadImg={{
      verifyImg: (p) => Array.from(p),
      uploadImg: async (file) => {
        return await URL.createObjectURL(file);
      },
    }}
    customUploadFile={{
      verifyFile: (p) => Array.from(p),
      uploadFile: async (file) => {
        return await URL.createObjectURL(file);
      },
    }}
  />,
  document.getElementById("root")
);
