type globalStoreShape = {
  selectedTds: Set<string>;
  editingTdsPath: Set<string>;
};
const globalStore: globalStoreShape = {
  selectedTds: new Set<string>(),
  editingTdsPath: new Set<string>(),
};

export const getStrPathSetOfSelectedTds = () => {
  return globalStore.selectedTds;
};

export const setStrPathSetOfSelectedTds = (
  selectedTds: globalStoreShape["selectedTds"]
) => {
  globalStore.selectedTds = selectedTds;
};

export const getEditingTdsPath = () => {
  return globalStore.editingTdsPath;
};

export const setEditingTdsPath = (
  editingTdPath: globalStoreShape["editingTdsPath"]
) => {
  globalStore.editingTdsPath = editingTdPath;
};
