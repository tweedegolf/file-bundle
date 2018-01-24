// @flow
import R from 'ramda';
import api from '../util/api';
import {
    ADD_FOLDER,
    FOLDER_ADDED,
    ERROR_ADDING_FOLDER,
} from '../util/constants';
import { getFolderCount, createError } from '../util/util';

// START FLOW TYPES

type PayloadFolderAddedType = {
    tree: TreeType,
    foldersById: FoldersByIdType,
};

export type ActionAddFolderType = {
    type: 'ADD_FOLDER',
};

export type ActionFolderAddedType = {
    type: 'FOLDER_ADDED',
    payload: PayloadFolderAddedType,
};

// END FLOW TYPES

const addFolder = (
    apiUrl: string,
    state: StateType,
    folderName: string,
    resolve: (payload: PayloadFolderAddedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = state;
    const currentFolderId: string = uiState.currentFolderId;
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const tree: TreeType = R.clone(treeState.tree);

    api.addFolder(
        apiUrl,
        folderName,
        currentFolderId,
        (newFolder: FolderType, errors: string[]) => {
            if (errors.length > 0) {
                const error = createError(ERROR_ADDING_FOLDER, errors, { name: `${folderName}` });
                reject({ errors: [error] });
                return;
            }
            // add new folder
            tree[currentFolderId].folderIds.push(newFolder.id);
            const parent = newFolder.parent === null ? 'null' : newFolder.parent;
            foldersById[newFolder.id] = { ...newFolder, parent, is_new: true };
            // update current folder
            const currentFolder = foldersById[currentFolderId];
            currentFolder.folder_count = getFolderCount(tree[currentFolderId].folderIds, foldersById);
            foldersById[currentFolderId] = currentFolder;

            const payload: PayloadFolderAddedType = {
                tree,
                foldersById,
            };
            resolve(payload);
        },
        (messages: string[]) => {
            const error: ErrorType = createError(ERROR_ADDING_FOLDER, messages, { name: `${folderName}` });
            reject({ errors: [error] });
        },
    );
};

export default (apiUrl: string, folderName: string): ReduxThunkType => {
    return (dispatch: DispatchType, getState: () => StateType) => {
        const state = getState();
        const a: ActionAddFolderType = {
            type: ADD_FOLDER,
        };
        dispatch(a);

        addFolder(
            apiUrl,
            state,
            folderName,
            (payload: PayloadFolderAddedType) => {
                const a1: ActionFolderAddedType = {
                    type: FOLDER_ADDED,
                    payload,
                };
                dispatch(a1);
            },
            (payload: PayloadErrorType) => {
                const a1: ActionErrorType = {
                    type: ERROR_ADDING_FOLDER,
                    payload,
                };
                dispatch(a1);
            },
        );
    };
};
