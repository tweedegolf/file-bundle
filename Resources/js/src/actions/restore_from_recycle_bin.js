// @flow
// NOT IN USE
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

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

const createError = (data: string, messages: string[]): { errors: ErrorType[] } => {
    const errors = [{
        id: getUID(),
        type: Constants.ERROR_EMPTY_RECYCLE_BIN,
        data,
        messages,
    }];
    return { errors };
};

const restoreFromRecycleBin = (
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const state = store.getState();
    const uiState: UIStateType = state.ui;
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
    const fileIds: string[] = uiState.selected.fileIds;
    const folderIds: string[] = uiState.selected.folderIds;

    const collectedItemIds = {
        files: [],
        folders: [],
    };
    folderIds.forEach((id: string) => {
        getItemIds(id, collectedItemIds, tree);
    });

    fileIds.push(...collectedItemIds.files);
    folderIds.push(...collectedItemIds.folders);

    const bin = { ...tree[Constants.RECYCLE_BIN_ID] };
    tree[Constants.RECYCLE_BIN_ID] = {
        fileIds: R.without(fileIds, bin.fileIds),
        folderIds: R.without(folderIds, bin.folderIds),
    };

    // console.log('restore', fileIds, folderIds);

    api.restoreFromRecycleBin(
        R.uniq(fileIds),
        R.uniq(folderIds),
        () => {
            fileIds.forEach((id: string) => {
                const file: FileType = filesById[id];
                filesById[id] = { ...file, isTrashed: false };
            });

            folderIds.forEach((id: string) => {
                const folder: FolderType = foldersById[id];
                foldersById[id] = { ...folder, isTrashed: false };
            });

            resolve({
                tree,
                filesById,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            reject(createError('Restore from recycle bin', messages));
        },
    );
};

export default () => {
    const a: ActionSimpleType = {
        type: Constants.RESTORE_FROM_RECYCLE_BIN,
    };
    dispatch(a);

    restoreFromRecycleBin(
        (payload: PayloadDeletedType) => {
            const a1: ActionDeletedType = {
                type: Constants.RESTORED_FROM_RECYCLE_BIN,
                payload,
            };
            dispatch(a1);
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: Constants.ERROR_RESTORE_FROM_RECYCLE_BIN,
                payload,
            };
            dispatch(a1);
        },
    );
};
