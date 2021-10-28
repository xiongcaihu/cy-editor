import ReactDOM from "react-dom";
import Editor from "./components/RichEditor/RichEditor";
import codeComp from "./externalComps/Code/index";
import atPerson from "./externalComps/AtPerson/index";

ReactDOM.render(
  <Editor plugins={[codeComp, atPerson]} />,
  document.getElementById("root")
);
