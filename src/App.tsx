import React from "react";
import Editor from "./components/RichEditor/RichEditor";
import "./App.css";

function App() {
  return (
    <div
      style={{ border: "1px solid", width: "100%", height: 300, margin: 12 }}
    >
      <Editor></Editor>
    </div>
  );
}

export default App;
