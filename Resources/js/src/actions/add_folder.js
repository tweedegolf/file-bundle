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
    const tmp1 = state.ui.currentFolderId;
    const tmp2 = R.clone(treeState.foldersById);
    if (tmp1 === null || tmp2 === null) {
        const error: ErrorType = createError(Constants.ERROR_ADDING_FOLDER, ['invalid state'], { folder: folderName });
        reject({ errors: [error] });
        return;
    }
    const currentFolderId: string = tmp1;
    const foldersById: FoldersByIdType = tmp2;
    const tree: TreeType = R.clone(treeState.tree);

    api.addFolder(
        folderName,
        currentFolderId,
        (folders: FolderType[], errorMessages: string[]) => {
            if (folders.length > 0) {
                folders.forEach((f: FolderType) => {
                    foldersById[f.id] = R.merge(f, { isNew: true });
                });
                const newFolderIds = R.map((f: FolderType): string => f.id, folders);
                tree[currentFolderId].folderIds.push(...newFolderIds);
                const currentFolder = foldersById[currentFolderId];
                currentFolder.folder_count = getFolderCount(tree[currentFolderId].folderIds, foldersById);
                foldersById[currentFolderId] = currentFolder;
            }

            // const errors = errorMessages.map((msg: string): ErrorType =>
            //     createError(Constants.ERROR_ADDING_FOLDER, [msg], folderName),
            // );
            const errors = [];
            if (errorMessages.length > 0) {
                errors.push(createError(Constants.ERROR_ADDING_FOLDER, errorMessages, { folder: folderName }));
            }

            const payload: PayloadFolderAddedType = {
                foldersById,
                errors,
                tree,
            };
            resolve(payload);
        },
        (messages: string[]) => {
            const error: ErrorType = createError(Constants.ERROR_ADDING_FOLDER, messages, { folder: folderName });
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
