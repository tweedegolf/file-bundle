// @flow
/* eslint no-param-reassignment: 0 */
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import {
    createError,
    getItemIds,
    getFileCount,
    getFolderCount,
} from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const excludeIds = (arr: string[], exclude: string[]): string[] => {
    const filtered = arr.filter(
        (id: string): boolean => {
            const index = exclude.findIndex((e: string): boolean => e === id);
            return index === -1;
        });
    return filtered;
};

const moveFiles = (
    resolve: (payload: PayloadItemsMovedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const ui: UIStateType = store.getState().ui;
    const state = store.getState();
    const treeState: TreeStateType = state.tree;
    const tmp1 = state.ui.currentFolderId;
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        const err = createError(Constants.ERROR_MOVING_ITEMS, ['invalid state']);
        reject({ errors: [err] });
        return;
    }
    const currentFolderId: string = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const currentFolder: FolderType = foldersById[currentFolderId];
    const tree: TreeType = R.clone(treeState.tree);

    let fileIds: string[] = ui.clipboard.fileIds;
    let folderIds: string[] = ui.clipboard.folderIds;

    api.moveItems(fileIds, folderIds, currentFolderId,
        (fileErrors: string[], folderErrors: string[]) => {
            const fileNames = fileErrors.map((id: string): string => filesById[id].name);
            const folderNames = folderErrors.map((id: string): string => foldersById[id].name);

            const err = createError(Constants.ERROR_MOVING_ITEMS, [], {
                files: fileNames.join(', '),
                folders: folderNames.join(', '),
            });

            const collectedItemIds = {
                files: [],
                folders: [],
            };

            fileIds = excludeIds(fileIds, fileErrors);
            folderIds = excludeIds(folderIds, folderErrors);

            fileIds.forEach((id: string) => {
                tree[currentFolderId].fileIds.push(id);
            });

            folderIds.forEach((id: string) => {
                tree[currentFolderId].folderIds.push(id);
                getItemIds(id, collectedItemIds, tree);
            });

            tree[currentFolderId].fileIds = R.uniq(tree[currentFolderId].fileIds);
            tree[currentFolderId].folderIds = R.uniq(tree[currentFolderId].folderIds);

            // set is_trashed flag to false
            R.forEach((id: string) => {
                const file = filesById[id];
                filesById[id] = { ...file, is_trashed: false };
            }, [...fileIds, ...R.uniq(collectedItemIds.files)]);
            currentFolder.file_count = getFileCount(tree[currentFolderId].fileIds, filesById);

            R.forEach((id: string) => {
                const folder = foldersById[id];
                foldersById[id] = { ...folder, parent: currentFolderId, is_trashed: false };
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
                errors: [err],
            });
        },
        (messages: string[]) => {
            const fileNames = fileIds.map((id: string): string => filesById[id].name);
            const folderNames = folderIds.map((id: string): string => foldersById[id].name);

            const err = createError(Constants.ERROR_MOVING_ITEMS, messages, {
                files: fileNames.join(', '),
                folders: folderNames.join(', '),
            });
            reject({ errors: [err] });
        },
    );
};

export default () => {
    // dispatch ui state action here?
    moveFiles(
        (payload: PayloadItemsMovedType) => {
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
