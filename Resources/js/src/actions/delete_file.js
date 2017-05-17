// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID, getFileCount } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): { errors: ErrorType[] } => {
    const errors = [{
        id: getUID(),
        type: Constants.ERROR_DELETING_FILE,
        data,
        messages,
    }];
    return { errors };
};

const deleteFile = (fileId: string, purge: boolean = false,
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const state = store.getState();
    const treeState: TreeStateType = state.tree;
    const tmp1 = state.ui.currentFolderId;
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        reject(createError(`file with id ${fileId}`, ['invalid state']));
        return;
    }

    const currentFolderId: string = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const tree: TreeType = R.clone(treeState.tree);

    api.deleteFile(fileId, purge,
        () => {
            if (purge === true) {
                const fileIds = tree[currentFolderId].fileIds;
                tree[currentFolderId].fileIds = R.without([fileId], fileIds);
                delete filesById[fileId];
            } else {
                const file = filesById[fileId];
                filesById[fileId] = R.merge(file, { isTrashed: true });
            }
            const currentFolder: FolderType = foldersById[currentFolderId];
            currentFolder.file_count = getFileCount(tree[currentFolderId].fileIds, filesById);
            foldersById[currentFolderId] = currentFolder;

            resolve({
                tree,
                filesById,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            const f: null | FileType = filesById[fileId];
            const n: string = f === null ? 'no name' : f.name;
            reject(createError(n, messages));
        },
    );
};

export default (fileId: string, purge: boolean = false) => {
    const a: ActionDeleteType = {
        type: Constants.DELETE_FILE,
        payload: { id: fileId },
    };
    dispatch(a);

    deleteFile(
        fileId,
        purge,
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
