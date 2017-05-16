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
        type: Constants.ERROR_DELETING_FILE,
        data,
        messages,
    }];
    return { errors };
};

const deleteFile = (fileId: string,
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const treeState: TreeStateType = store.getState().tree;
    const tmp1 = R.clone(treeState.filesById);
    const tmp2 = treeState.currentFolderId;

    if (tmp1 === null || tmp2 === null) {
        reject(createError(`file with id ${fileId}`, ['invalid state']));
        return;
    }

    const filesById: FilesByIdType = tmp1;
    const currentFolderId: string = tmp2;
    const tree: TreeType = R.clone(treeState.tree);

    api.deleteFile(fileId,
        () => {
            const file = filesById[fileId];
            filesById[fileId] = R.merge(file, { isTrashed: true });
            const fileIds = tree[currentFolderId].fileIds;
            tree[currentFolderId].fileIds = R.without([file.id], fileIds);
            resolve({
                tree,
                filesById,
            });
        },
        (messages: Array<string>) => {
            const f: null | FileType = filesById[fileId];
            const n: string = f === null ? 'no name' : f.name;
            reject(createError(n, messages));
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
