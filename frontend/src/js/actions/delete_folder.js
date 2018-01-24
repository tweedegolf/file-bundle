// @flow
import R from 'ramda';
import api from '../util/api';
import {
    DELETE_FOLDER,
    FOLDER_DELETED,
    ERROR_DELETING_FOLDER,
    RECYCLE_BIN_ID,
} from '../util/constants';
import { createError, getItemIds } from '../util/util';

// START FLOW TYPES

type PayloadFolderDeletedType = {
    recycleBin: RecycleBinType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
    selectedFileIds: string[],
    clipboardFileIds: string[],
    selectedFolderIds: string[],
    clipboardFolderIds: string[],
};

export type ActionConfirmDeleteFolderType = {
    type: 'CONFIRM_DELETE_FOLDER',
    payload: {
        id: string,
    },
};

export type ActionDeleteFolderType = {
    type: 'DELETE_FOLDER',
    payload: {
        id: string
    }
};

export type ActionFolderDeletedType = {
    type: 'FOLDER_DELETED',
    payload: PayloadFolderDeletedType,
};

// END FLOW TYPES

const deleteFolder = (
    apiUrl: string,
    state: StateType,
    folderId: string,
    resolve: (payload: PayloadFolderDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = state;
    const currentFolderId: string = uiState.currentFolderId;
    const filesById: FilesByIdType = R.clone(treeState.filesById);
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const folder = foldersById[folderId];
    const {
        files: filesInRecycleBin,
        folders: foldersInRecycleBin,
    } = { ...treeState[RECYCLE_BIN_ID] };
    const selectedFileIds = uiState.selected.fileIds;
    const clipboardFileIds = uiState.clipboard.fileIds;
    const selectedFolderIds = uiState.selected.folderIds;
    const clipboardFolderIds = uiState.clipboard.folderIds;

    api.deleteFolder(
        apiUrl,
        folderId,
        (error: string) => {
            if (error !== 'false') {
                const interpolation = {};
                if (typeof folder === 'undefined') {
                    interpolation.id = `${folderId}`;
                } else {
                    interpolation.name = `${folder.name}`;
                }
                const err = createError(ERROR_DELETING_FOLDER, [error], interpolation);
                reject({ errors: [err] });
                return;
            }
            const collectedItemIds = {
                fileIds: [],
                folderIds: [],
            };
            getItemIds(folderId, collectedItemIds, treeState.tree);
            collectedItemIds.fileIds.forEach((id: string) => {
                const f = filesById[id];
                filesInRecycleBin.push(f);
                filesById[id] = { ...f, is_trashed: true };
            });

            collectedItemIds.folderIds.forEach((id: string) => {
                const f = foldersById[id];
                foldersInRecycleBin.push(f);
                foldersById[id] = { ...f, is_trashed: true };
            });

            const currentFolder: FolderType = foldersById[currentFolderId];
            if (typeof currentFolder.folder_count !== 'undefined') {
                currentFolder.folder_count -= 1;
            }
            foldersById[currentFolderId] = currentFolder;

            const deletedFolder = foldersById[folderId];
            deletedFolder.is_trashed = true;
            foldersById[folderId] = deletedFolder;

            resolve({
                filesById,
                foldersById,
                recycleBin: {
                    files: filesInRecycleBin,
                    folders: foldersInRecycleBin,
                },
                selectedFileIds: R.without(collectedItemIds.fileIds, selectedFileIds),
                clipboardFileIds: R.without(collectedItemIds.fileIds, clipboardFileIds),
                selectedFolderIds: R.without(collectedItemIds.folderIds, selectedFolderIds),
                clipboardFolderIds: R.without(collectedItemIds.folderIds, clipboardFolderIds),
            });
        },
        (messages: Array<string>) => {
            const name = typeof folder === 'undefined' ? `${folderId}` : `${folder.name}`;
            const err = createError(ERROR_DELETING_FOLDER, messages, { name });
            reject({ errors: [err] });
        },
    );
};

export default (apiUrl: string, folderId: string): ReduxThunkType => {
    return (dispatch: DispatchType, getState: () => StateType) => {
        const state = getState();
        const a: ActionDeleteFolderType = {
            type: DELETE_FOLDER,
            payload: { id: folderId },
        };
        dispatch(a);

        deleteFolder(
            apiUrl,
            state,
            folderId,
            (payload: PayloadFolderDeletedType) => {
                const a1: ActionFolderDeletedType = {
                    type: FOLDER_DELETED,
                    payload,
                };
                dispatch(a1);
            },
            (payload: PayloadErrorType) => {
                const a1: ActionErrorType = {
                    type: ERROR_DELETING_FOLDER,
                    payload,
                };
                dispatch(a1);
            },
        );
    };
};
