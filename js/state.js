// State Management
export let trees = [];
export let editingTreeIndex = null;

export function setTrees(newTrees) {
    trees = newTrees;
}

export function setEditingTreeIndex(index) {
    editingTreeIndex = index;
}

export function addTree(tree) {
    trees.push(tree);
}

export function updateTree(index, tree) {
    trees[index] = tree;
}

export function deleteTreeAtIndex(index) {
    trees.splice(index, 1);
}

export function clearAllTrees() {
    trees = [];
}
