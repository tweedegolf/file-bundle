// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
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

const addFolder = (store: StoreType<StateType, GenericActionType>, folderName: string,
    resolve: (payload: PayloadFolderAddedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = store.getState();
    const currentFolderId: string = uiState.currentFolderId;
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const tree: TreeType = R.clone(treeState.tree);

    api.addFolder(
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

export default (storeId: string, folderName: string) => {
    const store = getStore(storeId);
    const dispatch: DispatchType = store.dispatch;
    const a: ActionAddFolderType = {
        type: ADD_FOLDER,
    };
    dispatch(a);

    addFolder(
        store,
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
