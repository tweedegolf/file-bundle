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
    const tmp1 = R.clone(treeState.filesById);
    const tmp2 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null) {
        const error = createError(Constants.ERROR_DELETING_FILE, ['invalid state'], { id: `${fileId}` });
        reject({ errors: [error] });
        return;
    }

    const currentFolderId: string = state.ui.currentFolderId;
    const filesById: FilesByIdType = tmp1;
    const foldersById: FoldersByIdType = tmp2;
    const tree: TreeType = R.clone(treeState.tree);

    api.deleteFile(fileId,
        (error: boolean) => {
            const errors = [];
            if (error === 'false') {
                const file = filesById[fileId];
                filesById[fileId] = R.merge(file, { is_trashed: true });

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
                const messages = [];
                if (typeof error === 'string') {
                    messages.push(error);
                }
                const file = filesById[fileId];
                const interpolation = {};
                if (typeof file === 'undefined') {
                    interpolation.id = `${fileId}`;
                } else {
                    interpolation.name = `${file.name}`;
                }
                const err = createError(Constants.ERROR_DELETING_FILE, messages, interpolation);
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
            const file: FileType = filesById[fileId];
            const name: string = typeof file === 'undefined' ? 'no name' : `${file.name}`;
            const error = createError(Constants.ERROR_DELETING_FILE, messages, { name });
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
