// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): { errors: ErrorType[] } => {
    const errors = [{
        id: getUID(),
        type: Constants.ERROR_DELETING_FOLDER,
        data,
        messages,
    }];
    return { errors };
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
        reject(createError(`folder with id ${folderId}`, ['invalid state']));
        return;
    }
    const currentFolderId: string = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const tree: TreeType = R.clone(treeState.tree);

    api.deleteFolder(
        folderId,
        () => {
            let fileIds = [];
            let folderIds = [];
            if (typeof tree[folderId] !== 'undefined') {
                folderIds = R.concat([folderId], tree[folderId].folderIds);
                fileIds = R.reduce((acc: string[], id: string): null | string[] => {
                    if (typeof tree[id] !== 'undefined') {
                        return R.concat(acc, tree[id].fileIds);
                    }
                    return R.concat(acc, [null]);
                }, [], folderIds);
                fileIds = R.reject(R.isNil, fileIds);
            }

            R.forEach((id: string) => {
                const f = foldersById[id];
                foldersById[id] = R.merge(f, { isTrashed: true });
            }, folderIds);

            R.forEach((id: string) => {
                const f = filesById[id];
                filesById[id] = R.merge(f, { isTrashed: true });
            }, fileIds);

            const currentFolder: FolderType = foldersById[currentFolderId];
            if (typeof currentFolder.file_count !== 'undefined') {
                currentFolder.file_count -= R.length(tree[currentFolderId].fileIds);
            }
            if (typeof currentFolder.folder_count !== 'undefined') {
                currentFolder.folder_count -= R.length(tree[currentFolderId].folderIds);
            }
            foldersById[currentFolderId] = currentFolder;

            const deletedFolder = foldersById[folderId];
            deletedFolder.parent = 'bin';
            deletedFolder.isTrashed = true;
            foldersById[folderId] = deletedFolder;

            if (typeof tree[Constants.RECYCLE_BIN_ID] !== 'undefined') {
                tree[Constants.RECYCLE_BIN_ID] = {
                    fileIds: tree[Constants.RECYCLE_BIN_ID].fileIds,
                    folderIds: [...tree[Constants.RECYCLE_BIN_ID].folderIds, folderId],
                };
            }

            resolve({
                tree,
                filesById,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            const folder = foldersById[folderId];
            reject(createError(folder.name, messages));
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
