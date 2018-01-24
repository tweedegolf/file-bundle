// @flow
import api from '../util/api';
import {
    RENAME_FOLDER,
    FOLDER_RENAMED,
    ERROR_RENAMING_FOLDER,

} from '../util/constants';
import { createError } from '../util/util';

// START FLOW TYPES

type PayloadFolderRenamedType = {
    foldersById: FoldersByIdType,
};

export type ActionRenameFolderType = {
    type: 'RENAME_FOLDER',
    payload: {
        id: string,
    },
};

export type ActionConfirmRenameFolderType = {
    type: 'CONFIRM_RENAME_FOLDER',
    payload: {
        id: string,
    },
};

export type ActionFolderRenamedType = {
    type: 'FOLDER_RENAMED',
    payload: PayloadFolderRenamedType,
};

// END FLOW TYPES

const renameFolder = (
    state: StateType,
    folderId: string,
    newName: string,
    resolve: (payload: PayloadFolderRenamedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = state;
    const apiUrl: string = uiState.apiUrl;
    const foldersById: FoldersByIdType = { ...treeState.foldersById };
    api.renameFolder(
        apiUrl,
        folderId,
        newName,
        (errors: string[]) => {
            if (errors.length > 0) {
                const interpolation = { folder: folderId, name: newName };
                const err = createError(ERROR_RENAMING_FOLDER, errors, interpolation);
                reject({
                    errors: [err],
                });
                return;
            }
            foldersById[folderId] = { ...foldersById[folderId], name: newName };
            resolve({ foldersById });
        },
        (errorMessages: string[]) => {
            const err = createError(ERROR_RENAMING_FOLDER, errorMessages, { folder: folderId, name: newName });
            reject({
                errors: [err],
            });
        },
    );
};

export default (folderId: string, newName: string): ReduxThunkType => {
    return (dispatch: DispatchType, getState: () => StateType) => {
        const state = getState();
        const a: ActionRenameFolderType = {
            type: RENAME_FOLDER,
            payload: { id: folderId },
        };
        dispatch(a);

        renameFolder(
            state,
            folderId,
            newName,
            (payload: PayloadFolderRenamedType) => {
                const a1: ActionFolderRenamedType = {
                    type: FOLDER_RENAMED,
                    payload,
                };
                dispatch(a1);
            },
            (payload: PayloadErrorType) => {
                const a1: ActionErrorType = {
                    type: ERROR_RENAMING_FOLDER,
                    payload,
                };
                dispatch(a1);
            },
        );
    };
};
