import { Descendant, Editor, NodeEntry, Path } from "slate";
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
  copyedAreaHeight: number; // 复制的区域的高度
  copyedAreaWidth: number; // 复制的区域的宽度
  copyedCells: NodeEntry[] | null;
  copyedContent: Descendant[] | null;
};
const globalStore: globalStoreShape = {
  selectedTds: new Set<string>(),
  editingTdsPath: new Set<string>(),
  preSelectedTdPos: {
    row: 0,
    col: 0,
  },
  copyedCellsPath: null,
  copyedAreaHeight: 0,
  copyedAreaWidth: 0,
  copyedCells: null,
  copyedContent: null,
};

export const getCopyedContent = () => {
  return globalStore.copyedContent;
};

export const setCopyedContent = (value: globalStoreShape["copyedContent"]) => {
  globalStore.copyedContent = value;
};

export const setCopyedCells = (value: globalStoreShape["copyedCells"]) => {
  globalStore.copyedCells = value;
};

export const getCopyedCells = () => {
  return globalStore.copyedCells;
};

export const getCopyedMaxRowAndCol = () => {
  return {
    copyedAreaHeight: globalStore.copyedAreaHeight,
    copyedAreaWidth: globalStore.copyedAreaWidth,
  };
};

export const setCopyedMaxRowAndCol = (value: {
  copyedAreaHeight: globalStoreShape["copyedAreaHeight"];
  copyedAreaWidth: globalStoreShape["copyedAreaWidth"];
}) => {
  globalStore.copyedAreaHeight = value.copyedAreaHeight;
  globalStore.copyedAreaWidth = value.copyedAreaWidth;
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
