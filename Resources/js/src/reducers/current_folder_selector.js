import R from 'ramda';
import { createSelector } from 'reselect';

const getUI = state => state.ui;
const getTree = state => state.tree;

const resetNew = array => R.map(f => ({ ...f, new: false }), array);
const filterTrashed = array => R.filter(f => f.isTrashed !== true, array);
const sortAscendingBy = (key, array) => R.sort(R.ascend(R.prop(key)), array);
const sortDescendingBy = (key, array) => R.sort(R.descend(R.prop(key)), array);

export default createSelector(
    [getUI, getTree],
    (ui, tree) => {
        const {
            sort,
            ascending,
        } = ui;

        const sortBy = ascending ? sortAscendingBy : sortDescendingBy;
        const currentFolder = tree.currentFolder;
        const files = R.compose(R.curry(sortBy)(sort), filterTrashed)(currentFolder.files);
        const folders = R.compose(R.curry(sortBy)(sort), filterTrashed)(currentFolder.folders);

        return {
            files,
            folders,
            currentFolderId: currentFolder.id,
            rootFolderId: tree.rootFolderId,
        };
    },
);
