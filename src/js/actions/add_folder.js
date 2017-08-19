// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getFolderCount, createError } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const addFolder = (folderName: string,
    resolve: (payload: PayloadFolderAddedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const state = store.getState();
    const treeState: TreeStateType = state.tree;
    const tmp = R.clone(treeState.foldersById);
    if (tmp === null) {
        const error: ErrorType = createError(Constants.ERROR_ADDING_FOLDER, ['invalid state'], { name: `${folderName}` });
        reject({ errors: [error] });
        return;
    }
    const currentFolderId: null | string = state.ui.currentFolderId;
    const foldersById: FoldersByIdType = tmp;
    const tree: TreeType = R.clone(treeState.tree);

    api.addFolder(
        folderName,
        currentFolderId,
        (newFolder: FolderType | null, errors: string[]) => {
            let error = null;
            if (newFolder !== null) {
                // add new folder
                tree[currentFolderId].folderIds.push(newFolder.id);
                foldersById[newFolder.id] = { ...newFolder, isNew: true };
                // update current folder
                const currentFolder = foldersById[currentFolderId];
                currentFolder.folder_count = getFolderCount(tree[currentFolderId].folderIds, foldersById);
                foldersById[currentFolderId] = currentFolder;
            } else {
                error = createError(Constants.ERROR_ADDING_FOLDER, errors, { name: `${folderName}` });
            }

            const payload: PayloadFolderAddedType = {
                foldersById,
                errors: error === null ? [] : [error],
                tree,
            };
            resolve(payload);
        },
        (messages: string[]) => {
            const error: ErrorType = createError(Constants.ERROR_ADDING_FOLDER, messages, { name: `${folderName}` });
            reject({ errors: [error] });
        },
    );
};

export default (folderName: string) => {
    dispatch({
        type: Constants.ADD_FOLDER,
    });

    addFolder(
        folderName,
        (payload: PayloadFolderAddedType) => {
            const a: ActionFolderAddedType = {
                type: Constants.FOLDER_ADDED,
                payload,
            };
            dispatch(a);
        },
        (payload: PayloadErrorType) => {
            const a: ActionErrorType = {
                type: Constants.ERROR_ADDING_FOLDER,
                payload,
            };
            dispatch(a);
        },
    );
};
