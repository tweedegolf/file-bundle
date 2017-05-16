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

const deleteFolder = (folderId: string, purge: boolean,
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
        purge,
        () => {
            const folderIds = R.concat([folderId], tree[folderId].folderIds);
            const fileIds = R.reduce((acc: string[], id: string): string[] =>
                R.concat(acc, tree[id].fileIds), [], folderIds);

            if (purge === true) {
                R.forEach((id: string) => {
                    delete tree[id];
                    delete foldersById[id];
                }, folderIds);

                R.forEach((id: string) => {
                    delete filesById[id];
                }, fileIds);
            } else {
                R.forEach((id: string) => {
                    const f = foldersById[id];
                    foldersById[id] = R.merge(f, { isTrashed: true });
                }, folderIds);

                R.forEach((id: string) => {
                    const f = filesById[id];
                    filesById[id] = R.merge(f, { isTrashed: true });
                }, fileIds);
            }

            const currentFolder = foldersById[currentFolderId];
            currentFolder.file_count = R.length(tree[currentFolderId].fileIds);
            currentFolder.folder_count = R.length(tree[currentFolderId].folderIds);

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

export default (folderId: string, purge: boolean = false) => {
    const a: ActionDeleteType = {
        type: Constants.DELETE_FOLDER,
        payload: { id: folderId },
    };
    dispatch(a);

    deleteFolder(
        folderId,
        purge,
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
