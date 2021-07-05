import { Editor, Path } from "slate";
import { EditorType } from "./Defines";

type preSelectedTdPosShape = {
  row: number;
  col: number;
} | null;

type globalStoreShape = {
  selectedTds: Set<string>;
  editingTdsPath: Set<string>;
  preSelectedTdPos: preSelectedTdPosShape;
  copyedCellsPath: Path[] | null;
  copyedMaxRow: number;
  copyedMaxCol: number;
};
const globalStore: globalStoreShape = {
  selectedTds: new Set<string>(),
  editingTdsPath: new Set<string>(),
  preSelectedTdPos: {
    row: 0,
    col: 0,
  },
  copyedCellsPath: null,
  copyedMaxRow: 0,
  copyedMaxCol: 0,
};

export const getCopyedMaxRowAndCol = () => {
  return {
    copyedMaxRow: globalStore.copyedMaxRow,
    copyedMaxCol: globalStore.copyedMaxCol,
  };
};

export const setCopyedMaxRowAndCol = (value: {
  copyedMaxRow: globalStoreShape["copyedMaxRow"];
  copyedMaxCol: globalStoreShape["copyedMaxCol"];
}) => {
  globalStore.copyedMaxRow = value.copyedMaxRow;
  globalStore.copyedMaxCol = value.copyedMaxCol;
};

export const setCopyedCellsPath = (
  value: globalStoreShape["copyedCellsPath"]
) => {
  globalStore.copyedCellsPath = value;
};

export const getCopyedCellsPath = () => {
  return globalStore.copyedCellsPath;
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
