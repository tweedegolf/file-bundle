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
        type: Constants.ERROR_EMPTY_RECYCLE_BIN,
        data,
        messages,
    }];
    return { errors };
};

const emptyRecycleBin = (
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const state = store.getState();
    const treeState: TreeStateType = state.tree;
    const tmp1 = R.clone(treeState.filesById);
    const tmp2 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null) {
        reject(createError('empty recycle bin', ['invalid state']));
        return;
    }

    const filesById: FilesByIdType = tmp1;
    const foldersById: FoldersByIdType = tmp2;
    const tree: TreeType = R.clone(treeState.tree);

    api.emptyRecycleBin(
        () => {
            const fileIds = R.filter((id: string): boolean =>
                filesById[id].isTrashed === true, R.keys(filesById));

            const folderIds = R.filter((id: string): boolean =>
                foldersById[id].isTrashed === true, R.keys(foldersById));

            R.forEach((id: string) => {
                delete filesById[id];
            }, fileIds);

            R.forEach((id: string) => {
                delete tree[id];
                delete foldersById[id];
            }, folderIds);

            // clean up tree, this cleans up the recycle bin as well
            R.forEach((id: string) => {
                tree[id].fileIds = R.without(fileIds, tree[id].fileIds);
                tree[id].folderIds = R.without(folderIds, tree[id].folderIds);
            }, R.keys(tree));

            resolve({
                tree,
                filesById,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            reject(createError('Empty recycle bin', messages));
        },
    );
};

export default () => {
    const a: ActionSimpleType = {
        type: Constants.EMPTY_RECYCLE_BIN,
    };
    dispatch(a);

    emptyRecycleBin(
        (payload: PayloadDeletedType) => {
            const a1: ActionDeletedType = {
                type: Constants.RECYCLE_BIN_EMPTIED,
                payload,
            };
            dispatch(a1);
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: Constants.ERROR_EMPTY_RECYCLE_BIN,
                payload,
            };
            dispatch(a1);
        },
    );
};
