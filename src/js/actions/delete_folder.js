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
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = store.getState();
    const currentFolderId: string = uiState.currentFolderId;
    const filesById: FilesByIdType = R.clone(treeState.filesById);
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const tree: TreeType = R.clone(treeState.tree);
    let recycleBin = { ...tree[Constants.RECYCLE_BIN_ID] };

    api.deleteFolder(
        folderId,
        (error: string) => {
            if (error !== 'false') {
                const folder = foldersById[folderId];
                const interpolation = {};
                if (typeof folder === 'undefined') {
                    interpolation.id = `${folderId}`;
                } else {
                    interpolation.name = `${folder.name}`;
                }
                const err = createError(Constants.ERROR_DELETING_FOLDER, [error], interpolation);
                reject({ errors: [err] });
                return;
            }

            const collectedItemIds = {
                files: [],
                folders: [],
            };
            getItemIds(folderId, collectedItemIds, tree);
            collectedItemIds.files.forEach((id: string) => {
                const file = filesById[id];
                filesById[id] = { ...file, is_trashed: true };
            });

            collectedItemIds.folders.forEach((id: string) => {
                const folder = foldersById[id];
                foldersById[id] = { ...folder, is_trashed: true };
            });

            const currentFolder: FolderType = foldersById[currentFolderId];
            if (typeof currentFolder.folder_count !== 'undefined') {
                currentFolder.folder_count -= 1;
            }
            foldersById[currentFolderId] = currentFolder;

            const deletedFolder = foldersById[folderId];
            deletedFolder.is_trashed = true;
            foldersById[folderId] = deletedFolder;

            recycleBin = {
                ...recycleBin,
                folderIds: [...recycleBin.folderIds, folderId],
            };

            resolve({
                tree,
                filesById,
                recycleBin,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            const folder = foldersById[folderId];
            const name = typeof folder === 'undefined' ? `${folderId}` : `${folder.name}`;
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
