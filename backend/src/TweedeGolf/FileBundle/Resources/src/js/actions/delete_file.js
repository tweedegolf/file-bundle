// @flow
import R from 'ramda';
import api from '../util/api';
import {
    DELETE_FILE,
    FILE_DELETED,
    ERROR_DELETING_FILE,
    RECYCLE_BIN_ID,
} from '../util/constants';
import { createError, getFileCount } from '../util/util';

// START FLOW TYPES

export type PayloadFileDeletedType = {
    recycleBin: RecycleBinType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
    selectedFileIds: string[],
    clipboardFileIds: string[],
};

export type ActionDeleteFileType = {
    type: 'DELETE_FILE',
    payload: {
        id: string
    }
};

export type ActionFileDeletedType = {
    type: 'FILE_DELETED',
    payload: PayloadFileDeletedType,
};

// END FLOW TYPES

const deleteFile = (
    state: StateType,
    fileId: string,
    resolve: (payload: PayloadFileDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = state;
    const apiUrl: string = uiState.apiUrl;
    const currentFolderId: string = uiState.currentFolderId;
    const filesById: FilesByIdType = R.clone(treeState.filesById);
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    let recycleBin = { ...treeState[RECYCLE_BIN_ID] };

    const selectedFileIds = uiState.selected.fileIds;
    const clipboardFileIds = uiState.clipboard.fileIds;
    api.deleteFile(
        apiUrl,
        fileId,
        (error: string) => {
            if (error !== 'false') {
                const file = filesById[fileId];
                const interpolation = {};
                if (typeof file === 'undefined') {
                    interpolation.id = `${fileId}`;
                } else {
                    interpolation.name = `${file.name}`;
                }
                const err = createError(ERROR_DELETING_FILE, [error], interpolation);
                reject({ errors: [err] });
                return;
            }
            const file = filesById[fileId];
            filesById[fileId] = R.merge(file, { is_trashed: true });

            const currentFolder: FolderType = foldersById[currentFolderId];
            currentFolder.file_count = getFileCount(treeState.tree[currentFolderId].fileIds, filesById);
            foldersById[currentFolderId] = currentFolder;

            recycleBin = {
                files: [...recycleBin.files, file],
                folders: [...recycleBin.folders],
            };

            resolve({
                recycleBin,
                filesById,
                foldersById,
                selectedFileIds: R.without(fileId, selectedFileIds),
                clipboardFileIds: R.without(fileId, clipboardFileIds),
            });
        },
        (messages: Array<string>) => {
            const file: FileType = filesById[fileId];
            const name: string = typeof file === 'undefined' ? 'no name' : `${file.name}`;
            const error = createError(ERROR_DELETING_FILE, messages, { name });
            reject({ errors: [error] });
        },
    );
};

export default (fileId: string): ReduxThunkType => {
    return (dispatch: DispatchType, getState: () => StateType) => {
        const state = getState();
        const a: ActionDeleteFileType = {
            type: DELETE_FILE,
            payload: { id: fileId },
        };
        dispatch(a);

        deleteFile(
            state,
            fileId,
            (payload: PayloadFileDeletedType) => {
                const a1: ActionFileDeletedType = {
                    type: FILE_DELETED,
                    payload,
                };
                dispatch(a1);
            },
            (payload: PayloadErrorType) => {
                const a1: ActionErrorType = {
                    type: ERROR_DELETING_FILE,
                    payload,
                };
                dispatch(a1);
            },
        );
    };
};
