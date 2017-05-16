// @flow
import R from 'ramda';
import { createSelector } from 'reselect';
import { getUID } from '../util/util';
import { ERROR_OPENING_FOLDER } from '../util/constants';

type ReturnType = {
    rootFolderId: null | string,
    currentFolderId: string,
    parentFolder: null | FolderType,
    folders: FolderType[],
    files: FileType[],
    errors: ErrorType[],
};

type ItemType = FolderType | FileType;

const getUI = (state: StateType): UIStateType => state.ui;
const getTree = (state: StateType): TreeStateType => state.tree;

const createError = (data: string, messages: string[]): ErrorType[] => {
    const errors = [{
        id: getUID(),
        data,
        type: ERROR_OPENING_FOLDER,
        messages,
    }];
    return errors;
};

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
    (uiState: UIStateType, treeState: TreeStateType): ReturnType => {
        const {
            sort,
            ascending,
            showingRecycleBin,
        } = uiState;
        const {
            tree,
            filesById,
            foldersById,
            rootFolderId,
            currentFolderId,
        } = treeState;

        if (tree === null || filesById === null || foldersById === null || currentFolderId === null) {
            return {
                currentFolderId: '-1',
                rootFolderId: '-1',
                parentFolder: null,
                folders: [],
                files: [],
                errors: createError('error opening folder', ['invalid state']),
            };
        }
        // const sortBy: ((FileType[] | FolderType[])) =>
        //    (FileType[] | FolderType[]) = ascending ? sortAscendingBy : sortDescendingBy;
        const sortBy = ascending ? sortAscendingBy : sortDescendingBy;

        let files: FileType[] = R.map((fileId: string): FileType =>
            filesById[fileId], tree[currentFolderId].fileIds);
        let folders: FolderType[] = R.map((folderId: string): FolderType =>
            foldersById[folderId], tree[currentFolderId].folderIds);

        // console.log('files', files);
        // console.log('folders', folders);

        const sortFunc = R.curry(sortBy)(sort);
        const filterFunc = showingRecycleBin ? filterTrashedInverted : filterTrashed;

        files = R.compose(sortFunc, filterFunc)(files);
        folders = R.compose(sortFunc, filterFunc)(folders);

        const currentFolder: FolderType = foldersById[currentFolderId];
        let parentFolder = null;
        if (currentFolder.parent !== null) {
            parentFolder = foldersById[currentFolder.parent];
        }
        return {
            files,
            folders,
            parentFolder,
            currentFolderId: currentFolder.id,
            rootFolderId,
            errors: [],
        };
    },
);
