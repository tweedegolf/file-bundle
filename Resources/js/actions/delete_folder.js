// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { createError } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const getItemIds = (folderId: string,
    collectedItemIds: { files: string[], folders: string[] },
    tree: TreeType,
) => {
    const folder: TreeFolderType = tree[folderId];
    if (typeof folder === 'undefined') {
        return;
    }
    collectedItemIds.files.push(...folder.fileIds);
    const subFolderIds = folder.folderIds;
    collectedItemIds.folders.push(folderId, ...subFolderIds);
    subFolderIds.forEach((id: string) => {
        getItemIds(id, collectedItemIds, tree);
    });
};

const deleteFolder = (folderId: string,
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const state = store.getState();
    const treeState: TreeStateType = state.tree;
    const tmp1 = state.ui.currentFolderId;
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        const err = createError(Constants.ERROR_DELETING_FOLDER, ['invalid state'], { id: `"${folderId}"` });
        reject({ errors: [err] });
        return;
    }
    const currentFolderId: string = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const tree: TreeType = R.clone(treeState.tree);

    api.deleteFolder(
        folderId,
        (error: boolean | string) => {
            const errors = [];

            if (error === false) {
                const collectedItemIds = {
                    files: [],
                    folders: [],
                };
                getItemIds(folderId, collectedItemIds, tree);
                collectedItemIds.files.forEach((id: string) => {
                    const file = filesById[id];
                    filesById[id] = { ...file, isTrashed: true };
                });

                collectedItemIds.folders.forEach((id: string) => {
                    const folder = foldersById[id];
                    foldersById[id] = { ...folder, isTrashed: true };
                });

                const currentFolder: FolderType = foldersById[currentFolderId];
                if (typeof currentFolder.file_count !== 'undefined') {
                    currentFolder.file_count -= R.length(tree[currentFolderId].fileIds);
                }
                if (typeof currentFolder.folder_count !== 'undefined') {
                    currentFolder.folder_count -= R.length(tree[currentFolderId].folderIds);
                }
                foldersById[currentFolderId] = currentFolder;

                const deletedFolder = foldersById[folderId];
                // deletedFolder.parent = Constants.RECYCLE_BIN_ID;
                deletedFolder.isTrashed = true;
                foldersById[folderId] = deletedFolder;

                if (typeof tree[Constants.RECYCLE_BIN_ID] !== 'undefined') {
                    tree[Constants.RECYCLE_BIN_ID] = {
                        fileIds: tree[Constants.RECYCLE_BIN_ID].fileIds,
                        folderIds: [...tree[Constants.RECYCLE_BIN_ID].folderIds, folderId],
                    };
                }
            } else {
                const messages = [];
                if (typeof error === 'string') {
                    messages.push(error);
                }
                const folder = foldersById[folderId];
                const interpolation = {};
                if (typeof folder === 'undefined') {
                    interpolation.id = `"${folderId}"`;
                } else {
                    interpolation.name = `"${folder.name}"`;
                }
                const err = createError(Constants.ERROR_DELETING_FOLDER, messages, interpolation);
                errors.push(err);
            }

            resolve({
                tree,
                errors,
                filesById,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            const folder = foldersById[folderId];
            const name = typeof folder === 'undefined' ? `"${folderId}"` : `"${folder.name}"`;
            const err = createError(Constants.ERROR_DELETING_FOLDER, messages, { name });
            reject({ errors: [err] });
        },
    );
};

export default (folderId: string) => {
    const a: ActionDeleteType = {
        type: Constants.DELETE_FOLDER,
        payload: { id: folderId },
    };
    dispatch(a);

    deleteFolder(
        folderId,
        (payload: PayloadDeletedType) => {
            const a1: ActionDeletedType = {
                type: Constants.FOLDER_DELETED,
                payload,
            };
            dispatch(a1);
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: Constants.ERROR_DELETING_FILE,
                payload,
            };
            dispatch(a1);
        },
    );
};
