import { Editor } from "slate";
import { EditorType } from "./Defines";

type preSelectedTdPosShape = {
  row: number;
  col: number;
} | null;

type globalStoreShape = {
  selectedTds: Set<string>;
  editingTdsPath: Set<string>;
  preSelectedTdPos: preSelectedTdPosShape;
};
const globalStore: globalStoreShape = {
  selectedTds: new Set<string>(),
  editingTdsPath: new Set<string>(),
  preSelectedTdPos: {
    row: 0,
    col: 0,
  },
};

export const getPreSelectedTdPos = () => {
  return globalStore.preSelectedTdPos;
};

export const setPreSelectedTdPos = (value: preSelectedTdPosShape) => {
  globalStore.preSelectedTdPos = value;
};

export const getStrPathSetOfSelectedTds = (editor: EditorType) => {
  filterPath(editor, globalStore.selectedTds);
  return globalStore.selectedTds;
};

export const setStrPathSetOfSelectedTds = (
  selectedTds: globalStoreShape["selectedTds"]
) => {
  globalStore.selectedTds = selectedTds;
};

const filterPath = (editor: EditorType, paths: Set<string>): void => {
  for (const p of paths) {
    const path = p.split(",").map((o) => +o);
    if (!Editor.hasPath(editor, path)) {
      paths.delete(p);
      filterPath(editor, paths);
      return;
    }
  }
};

export const getEditingTdsPath = (editor: EditorType) => {
  filterPath(editor, globalStore.editingTdsPath);
  return globalStore.editingTdsPath;
};

export const setEditingTdsPath = (
  editingTdPath: globalStoreShape["editingTdsPath"]
) => {
  globalStore.editingTdsPath = editingTdPath;
};
