// @flow
import R from 'ramda';
import { createSelector } from 'reselect';
import {
    filterTrashed,
    sortAscendingBy,
    sortDescendingBy,
} from '../util/util';

type ReturnType = {
    rootFolderId: null | string,
    parentFolder: null | FolderType,
    folders: FolderType[],
    files: FileType[],
};

const getUI = (state: StateType): UIStateType => state.ui;
const getTree = (state: StateType): TreeStateType => state.tree;

export default createSelector(
    [getUI, getTree],
    (uiState: UIStateType, treeState: TreeStateType): ReturnType => {
        const {
            sort,
            ascending,
            rootFolderId,
            currentFolderId,
            showingRecycleBin,
        } = uiState;
        const {
            tree,
            filesById,
            foldersById,
        } = treeState;

        if (typeof tree[currentFolderId] === 'undefined') {
            return {
                files: [],
                folders: [],
                rootFolderId,
                parentFolder: null,
            };
        }
        // const sortBy: ((FileType[] | FolderType[])) =>
        //    (FileType[] | FolderType[]) = ascending ? sortAscendingBy : sortDescendingBy;
        const sortBy = ascending ? sortAscendingBy : sortDescendingBy;
        const sortFunc = R.curry(sortBy)(sort);
        const filterFunc = showingRecycleBin === true ? (items: ItemType[]): ItemType[] => items : filterTrashed;

        const currentFolder = foldersById[currentFolderId];
        let parentFolder = null;
        let files: FileType[] = [];
        let folders: FolderType[] = [];

        files = R.map((fileId: string): FileType => filesById[fileId], tree[currentFolderId].fileIds);
        files = R.compose(sortFunc, filterFunc)(files);

        folders = R.map((folderId: string): FolderType => foldersById[folderId], tree[currentFolderId].folderIds);
        folders = R.compose(sortFunc, filterFunc)(folders);

        if (currentFolder.parent !== null) {
            parentFolder = foldersById[currentFolder.parent];
        }
        return {
            files,
            folders,
            parentFolder,
            rootFolderId,
        };
    },
);
