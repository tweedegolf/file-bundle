// @flow
import R from 'ramda';
import api from '../util/api';
import * as Constants from '../util/constants';
import {
    createError,
    getFileCount,
    getFolderCount,
    excludeIds,
    getItemIds,
} from '../util/util';

// START FLOW TYPES

type PayloadItemsMovedType = {
    foldersById: FoldersByIdType,
    filesById: FilesByIdType,
    errors: ErrorType[],
    tree: TreeType,
};

export type ActionItemsMovedType = {
    type: 'ITEMS_MOVED',
    payload: PayloadItemsMovedType,
};

// END FLOW TYPES

const moveFiles = (
    state: StateType,
    resolve: (payload: PayloadItemsMovedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = state;

    const apiUrl: string = uiState.apiUrl;
    const tree: TreeType = R.clone(treeState.tree);
    const filesById: FilesByIdType = R.clone(treeState.filesById);
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const currentFolderId: string = uiState.currentFolderId;
    const currentFolder: FolderType = foldersById[currentFolderId];

    let fileIds = [...uiState.clipboard.fileIds];
    let folderIds = [...uiState.clipboard.folderIds];

    if (fileIds.length === 0 && folderIds.length === 0) {
        resolve({
            foldersById,
            filesById,
            tree,
            errors: [],
        });
        return;
    }

    api.moveItems(
        apiUrl,
        fileIds,
        folderIds,
        currentFolderId,
        (error: string, errorFileIds: string[], errorFolderIds: string[]) => {
            if (error !== 'false') {
                const err = createError(Constants.ERROR_MOVING_ITEMS, [error]);
                reject({ errors: [err] });
                return;
            }

            const errorFileNames = errorFileIds.map((id: string): string => filesById[id].name);
            const errorFolderNames = errorFolderIds.map((id: string): string => foldersById[id].name);

            let err = null;
            if (errorFileNames.length > 0 || errorFolderNames.length > 0) {
                err = createError(Constants.ERROR_MOVING_ITEMS, [], {
                    files: errorFileNames.join(', '),
                    folders: errorFolderNames.join(', '),
                });
            }

            // exclude the file and folders that couldn't be moved for some reason
            fileIds = excludeIds(fileIds, errorFileIds);
            folderIds = excludeIds(folderIds, errorFolderIds);

            // add the ids of the moved files to the current folder
            fileIds.forEach((id: string) => {
                tree[currentFolderId].fileIds.push(id);
            });
            // get the unique ids in case files are moved to their current parent
            tree[currentFolderId].fileIds = R.uniq(tree[currentFolderId].fileIds);

            const collectedItemIds = {
                fileIds: [],
                folderIds: [],
            };

            // get the ids of the files and subfolders inside all folders that have been moved
            folderIds.forEach((id: string) => {
                tree[currentFolderId].folderIds.push(id);
                getItemIds(id, collectedItemIds, tree);
            });
            // get the unique ids in case folder are moved to their current parent
            tree[currentFolderId].folderIds = R.uniq(tree[currentFolderId].folderIds);

            // set is_trashed flag to false and is_new flag to true
            R.forEach((id: string) => {
                const file = filesById[id];
                filesById[id] = { ...file, is_trashed: false, is_new: true };
            }, [...fileIds, ...collectedItemIds.fileIds]);

            R.forEach((id: string) => {
                const folder = foldersById[id];
                foldersById[id] = { ...folder, parent: currentFolderId, is_trashed: false, is_new: true };
            }, folderIds);

            R.forEach((id: string) => {
                const folder = foldersById[id];
                foldersById[id] = { ...folder, is_trashed: false, is_new: true };
            }, collectedItemIds.folderIds);

            // update count files and folders
            currentFolder.file_count = getFileCount(tree[currentFolderId].fileIds, filesById);
            currentFolder.folder_count = getFolderCount(tree[currentFolderId].folderIds, foldersById);
            foldersById[currentFolderId] = currentFolder;

            // remove files and folders from original location
            const removeCurrentFolder = ([key]: [string]): boolean => key !== `${currentFolderId}`;
            R.forEach(([key, treeFolder]: [string, TreeFolderType]) => {
                tree[key].fileIds = R.without(fileIds, treeFolder.fileIds);
                tree[key].folderIds = R.without(folderIds, treeFolder.folderIds);
            }, R.compose(R.filter(removeCurrentFolder), R.toPairs)(tree));

            resolve({
                foldersById,
                filesById,
                tree,
                errors: err === null ? [] : [err],
            });
        },
        (messages: string[]) => {
            const fileNames = fileIds.map((id: string): string => filesById[id].name);
            const folderNames = folderIds.map((id: string): string => foldersById[id].name);

            const err = createError(Constants.ERROR_MOVING_ITEMS, messages, {
                files: fileNames.join(', '),
                folders: folderNames.join(', '),
            });
            reject({ errors: [err] });
        },
    );
};

export default (): ReduxThunkType => {
    return (dispatch: DispatchType, getState: () => StateType) => {
        const state = getState();
        moveFiles(
            state,
            (payload: PayloadItemsMovedType) => {
                dispatch({
                    type: Constants.ITEMS_MOVED,
                    payload,
                });
            },
            (payload: PayloadErrorType) => {
                const a1: ActionErrorType = {
                    type: Constants.ERROR_MOVING_ITEMS,
                    payload,
                };
                dispatch(a1);
            },
        );
    };
};
