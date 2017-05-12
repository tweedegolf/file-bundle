// @flow
import R from 'ramda';
import { createSelector } from 'reselect';

type ReturnType = {
    rootFolderId: null | string,
    currentFolderId: string,
    folders: FolderType[],
    files: FileType[],
};

type ItemType = FolderType | FileType;

const getUI = (state: StateType): UIStateType => state.ui;
const getTree = (state: StateType): TreeStateType => state.tree;

// const resetNew = array => R.map(f => ({ ...f, new: false }), array);
const filterTrashed = (array: ItemType[]): ItemType[] =>
    R.filter((f: ItemType): boolean => (f.isTrashed !== true), array);
const sortAscendingBy = (key: string, array: ItemType[]): ItemType[] =>
    R.sort(R.ascend(R.prop(key)), array);
const sortDescendingBy = (key: string, array: ItemType[]): ItemType[] =>
    R.sort(R.descend(R.prop(key)), array);

export default createSelector(
    [getUI, getTree],
    (ui: UIStateType, tree: TreeStateType): ReturnType => {
        const {
            sort,
            ascending,
        } = ui;

        // const sortBy: ((FileType[] | FolderType[])) =>
        //    (FileType[] | FolderType[]) = ascending ? sortAscendingBy : sortDescendingBy;
        const sortBy = ascending ? sortAscendingBy : sortDescendingBy;
        const currentFolder = tree.currentFolder;

        if (currentFolder === null) {
            console.error('no currentFolder, this should not happen!');
            return {
                files: [],
                folders: [],
                currentFolderId: '',
                rootFolderId: '',
            };
        }
        let files: FileType[] = [];
        let folders: FolderType[] = [];
        if (typeof currentFolder.files !== 'undefined') {
            files = R.compose(R.curry(sortBy)(sort), filterTrashed)(currentFolder.files);
        }
        if (typeof currentFolder.folders !== 'undefined') {
            folders = R.compose(R.curry(sortBy)(sort), filterTrashed)(currentFolder.folders);
        }

        return {
            files,
            folders,
            currentFolderId: currentFolder.id,
            rootFolderId: tree.rootFolderId,
        };
    },
);
