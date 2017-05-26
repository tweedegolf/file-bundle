// @flow
/* eslint no-param-reassignment: 0 */
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import {
    getUID,
    getItemIds,
    getFileCount,
    getFolderCount,
} from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): { errors: ErrorType[] } => {
    const errors = [{
        id: getUID(),
        type: Constants.ERROR_MOVING_ITEMS,
        data,
        messages,
    }];
    return { errors };
};

const moveFiles = (
    resolve: (payload: PayloadFilesMovedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const ui: UIStateType = store.getState().ui;
    const state = store.getState();
    const treeState: TreeStateType = state.tree;
    const tmp1 = state.ui.currentFolderId;
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        reject(createError('moving files', ['invalid state']));
        return;
    }
    const currentFolderId: string = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const currentFolder: FolderType = foldersById[currentFolderId];
    const tree: TreeType = R.clone(treeState.tree);

    const fileIds: string[] = ui.clipboard.fileIds;
    const folderIds: string[] = ui.clipboard.folderIds;

    api.moveItems(fileIds, folderIds, currentFolderId,
        () => {
            const collectedItemIds = {
                files: [],
                folders: [],
            };

            fileIds.forEach((id: string) => {
                tree[currentFolderId].fileIds.push(id);
            });

            folderIds.forEach((id: string) => {
                tree[currentFolderId].folderIds.push(id);
                getItemIds(id, collectedItemIds, tree);
            });

            tree[currentFolderId].fileIds = R.uniq(tree[currentFolderId].fileIds);
            tree[currentFolderId].folderIds = R.uniq(tree[currentFolderId].folderIds);

            // set isTrashed flag to false
            R.forEach((id: string) => {
                const file = filesById[id];
                filesById[id] = { ...file, isTrashed: false };
            }, [...fileIds, ...R.uniq(collectedItemIds.files)]);
            currentFolder.file_count = getFileCount(tree[currentFolderId].fileIds, filesById);

            R.forEach((id: string) => {
                const folder = foldersById[id];
                foldersById[id] = { ...folder, parent: currentFolderId, isTrashed: false };
            }, [...folderIds, ...R.uniq(collectedItemIds.folders)]);
            currentFolder.folder_count = getFolderCount(tree[currentFolderId].folderIds, foldersById);

            foldersById[currentFolderId] = currentFolder;

            // remove files and folders from original location
            const removeCurrentFolder = ([key]: [string]): boolean => key !== currentFolderId;
            R.forEach(([key, treeFolder]: [string, TreeFolderType]) => {
                tree[key].fileIds = R.without(fileIds, treeFolder.fileIds);
                tree[key].folderIds = R.without(folderIds, treeFolder.folderIds);
            }, R.compose(R.filter(removeCurrentFolder), R.toPairs)(tree));

            resolve({
                foldersById,
                filesById,
                tree,
            });
        },
        (messages: string[]) => {
            const errors = fileIds.map((id: string): ErrorType => {
                const file = filesById[id];
                return {
                    id: getUID(),
                    data: file.name,
                    type: Constants.ERROR_MOVING_ITEMS,
                    messages,
                };
            });
            reject({ errors });
        },
    );
};

export default () => {
    // dispatch ui state action here?
    moveFiles(
        (payload: PayloadFilesMovedType) => {
            dispatch({
                type: Constants.ITEMS_MOVED,
                payload,
            });
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: Constants.ERROR_MOVING_ITEMS,
                payload,
            };
            dispatch(a1);
        },
    );
};
