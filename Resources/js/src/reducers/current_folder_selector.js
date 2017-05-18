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
            };
        }
        // const sortBy: ((FileType[] | FolderType[])) =>
        //    (FileType[] | FolderType[]) = ascending ? sortAscendingBy : sortDescendingBy;
        const sortBy = ascending ? sortAscendingBy : sortDescendingBy;
        const sortFunc = R.curry(sortBy)(sort);

        const currentFolder = foldersById[currentFolderId];
        let parentFolder = null;
        let files: FileType[] = [];
        let folders: FolderType[] = [];

        if (showingRecycleBin === true) {
            files = R.map((file: FileType): null | FileType => {
                if (file.isTrashed === true) {
                    return file;
                }
                return null;
            }, R.values(filesById));
            files = R.reject(R.isNil, files);
            folders = R.map((folder: FolderType): null | FolderType => {
                if (folder.isTrashed === true) {
                    return folder;
                }
                return null;
            }, R.values(foldersById));
            folders = R.reject(R.isNil, folders);
        } else {
            files = R.map((fileId: string): FileType =>
                filesById[fileId], tree[currentFolderId].fileIds);
            files = R.compose(sortFunc, filterTrashed)(files);

            folders = R.map((folderId: string): FolderType =>
                foldersById[folderId], tree[currentFolderId].folderIds);
            folders = R.compose(sortFunc, filterTrashed)(folders);

            if (currentFolder.parent !== null) {
                parentFolder = foldersById[currentFolder.parent];
            }
            // console.log('parent', parentFolder, currentFolder.parent);
        }

        return {
            files,
            folders,
            parentFolder,
            rootFolderId,
        };
    },
);
