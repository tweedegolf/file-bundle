// @flow
import R from 'ramda';
import { createSelector } from 'reselect';

type ReturnType = {
    rootFolderId: null | string,
    currentFolderId: string,
    parentFolder: null | FolderType,
    folders: FolderType[],
    files: FileType[],
};

type ItemType = FolderType | FileType;

const getUI = (state: StateType): UIStateType => state.ui;
const getTree = (state: StateType): TreeStateType => state.tree;

// const resetNew = array => R.map(f => ({ ...f, isNew: false }), array);
const filterTrashed = (array: ItemType[]): ItemType[] =>
    R.filter((f: ItemType): boolean => (f.isTrashed !== true), array);
const filterTrashedInverted = (array: ItemType[]): ItemType[] =>
    R.filter((f: ItemType): boolean => (f.isTrashed === true), array);
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
            showingRecycleBin,
        } = ui;
        const {
            currentFolderId,
            filesById,
            foldersById,
        } = tree;

        if (filesById === null || foldersById === null || currentFolderId === null) {
            console.error('invalid state');
            return {
                currentFolderId: '-1',
                rootFolderId: '-1',
                parentFolder: null,
                folders: [],
                files: [],
            };
        }
        // const sortBy: ((FileType[] | FolderType[])) =>
        //    (FileType[] | FolderType[]) = ascending ? sortAscendingBy : sortDescendingBy;
        const sortBy = ascending ? sortAscendingBy : sortDescendingBy;
        const currentFolder = foldersById[currentFolderId];

        let files: FileType[] = R.map((fileId: string): FileType =>
            filesById[fileId], currentFolder.fileIds || []);
        let folders: FolderType[] = R.map((folderId: string): FolderType =>
            foldersById[folderId], currentFolder.folderIds || []);
        const sortFunc = R.curry(sortBy)(sort);
        const filterFunc = showingRecycleBin ? filterTrashedInverted : filterTrashed;
        if (typeof currentFolder.files !== 'undefined') {
            files = R.compose(sortFunc, filterFunc)(currentFolder.fileIds);
        }
        if (typeof currentFolder.folders !== 'undefined') {
            folders = R.compose(sortFunc, filterFunc)(currentFolder.folderIds);
        }

        let parentFolder = null;
        if (currentFolder.parent !== null) {
            parentFolder = foldersById[currentFolder.parent];
        }

        return {
            files,
            folders,
            parentFolder,
            currentFolderId: currentFolder.id,
            rootFolderId: tree.rootFolderId,
        };
    },
);
