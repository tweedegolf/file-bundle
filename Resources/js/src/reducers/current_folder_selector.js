// @flow
import R from 'ramda';
import { createSelector } from 'reselect';
import {
    filterTrashed,
    filterTrashedInverted,
    sortAscendingBy,
    sortDescendingBy,
} from '../util/util';

type ReturnType = {
    rootFolderId: null | string,
    currentFolderId: string,
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

        if (tree === null ||
            filesById === null ||
            foldersById === null ||
            currentFolderId === null
        ) {
            return {
                files: [],
                folders: [],
                rootFolderId: null,
                parentFolder: null,
                currentFolderId: '-1',
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

        if (showingRecycleBin === true) {
            console.log(files, folders);
        }

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
        };
    },
);
