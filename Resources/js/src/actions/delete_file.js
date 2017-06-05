// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { createError, getFileCount } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const deleteFile = (fileId: string,
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const state = store.getState();
    const treeState: TreeStateType = state.tree;
    const tmp1 = state.ui.currentFolderId;
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        const error = createError(Constants.ERROR_DELETING_FILE, ['invalid state', `file with id ${fileId}`], 'huh');
        reject({ errors: [error] });
        return;
    }

    const currentFolderId: string = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const tree: TreeType = R.clone(treeState.tree);

    api.deleteFile(fileId,
        (error: boolean | string) => {
            const errors = { errors: [] };
            if (error === false) {
                const file = filesById[fileId];
                filesById[fileId] = R.merge(file, { isTrashed: true });

                const currentFolder: FolderType = foldersById[currentFolderId];
                currentFolder.file_count = getFileCount(tree[currentFolderId].fileIds, filesById);
                foldersById[currentFolderId] = currentFolder;

                if (typeof tree[Constants.RECYCLE_BIN_ID] !== 'undefined') {
                    tree[Constants.RECYCLE_BIN_ID] = {
                        fileIds: [...tree[Constants.RECYCLE_BIN_ID].fileIds, fileId],
                        folderIds: tree[Constants.RECYCLE_BIN_ID].folderIds,
                    };
                }
            } else {
                let messages = [];
                if (typeof error === 'string') {
                    messages = [error];
                }
                const err = createError(Constants.ERROR_DELETING_FILE, messages);
                errors.errors.push(err);
            }

            resolve({
                tree,
                errors,
                filesById,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            const f: null | FileType = filesById[fileId];
            const n: string = f === null ? 'no name' : f.name;
            const error = createError(Constants.ERROR_DELETING_FILE, messages, n);
            reject({ errors: [error] });
        },
    );
};

export default (fileId: string) => {
    const a: ActionDeleteType = {
        type: Constants.DELETE_FILE,
        payload: { id: fileId },
    };
    dispatch(a);

    deleteFile(
        fileId,
        (payload: PayloadDeletedType) => {
            const a1: ActionDeletedType = {
                type: Constants.FILE_DELETED,
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
