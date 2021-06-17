import React from "react";
import Editor from "./components/RichEditor/RichEditor";
import "./App.css";

function App() {
  return (
    <div
      style={{ width: "100%", height: 'auto', padding:12 }}
    >
      <Editor></Editor>
    </div>
  );
}

export default App;
