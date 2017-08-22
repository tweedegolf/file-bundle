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

type PayloadItemsMovedType = {
    foldersById: FoldersByIdType,
    filesById: FilesByIdType,
    errors: ErrorType[],
    tree: TreeType,
};

export type ActionItemsMovedType = {
    type: 'ITEMS_MOVED',
    payload: PayloadItemsMovedType,
};

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
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = store.getState();

    const tree: TreeType = R.clone(treeState.tree);
    const filesById: FilesByIdType = R.clone(treeState.filesById);
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const currentFolderId: string = uiState.currentFolderId;
    const currentFolder: FolderType = foldersById[currentFolderId];

    // filter files and folders that have been pasted into their original folder
    let fileIds: string[] = R.filter((id: string): boolean =>
        !R.contains(id, tree[currentFolderId].fileIds), uiState.clipboard.fileIds);

    let folderIds: string[] = R.filter((id: string): boolean =>
        !R.contains(id, tree[currentFolderId].folderIds), uiState.clipboard.folderIds);

    if (fileIds.length === 0 && folderIds.length === 0) {
        resolve({
            foldersById,
            filesById,
            tree,
            errors: [],
        });
        return;
    }

    api.moveItems(fileIds, folderIds, currentFolderId,
        (error: string, errorFileIds: string[], errorFolderIds: string[]) => {
            if (error !== 'false') {
                const err = createError(Constants.ERROR_MOVING_ITEMS, [error]);
                reject({ errors: [err] });
                return;
            }

            const errorFileNames = errorFileIds.map((id: string): string => filesById[id].name);
            const errorFolderNames = errorFolderIds.map((id: string): string => foldersById[id].name);

            let err = null;
            if (errorFileNames.length > 0 || errorFolderNames.length > 0) {
                err = createError(Constants.ERROR_MOVING_ITEMS, [], {
                    files: errorFileNames.join(', '),
                    folders: errorFolderNames.join(', '),
                });
            }

            // exclude the file and folders that couldn't be moved for some reason
            fileIds = excludeIds(fileIds, errorFileIds);
            folderIds = excludeIds(folderIds, errorFolderIds);

            fileIds.forEach((id: string) => {
                tree[currentFolderId].fileIds.push(id);
            });

            folderIds.forEach((id: string) => {
                tree[currentFolderId].folderIds.push(id);
            });

            // set is_trashed flag to false and is_new flag to true
            R.forEach((id: string) => {
                const file = filesById[id];
                filesById[id] = { ...file, is_trashed: false, is_new: true };
            }, fileIds);

            R.forEach((id: string) => {
                const folder = foldersById[id];
                foldersById[id] = { ...folder, parent: currentFolderId, is_trashed: false, is_new: true };
            }, folderIds);

            // update count files and folders
            currentFolder.file_count = getFileCount(tree[currentFolderId].fileIds, filesById);
            currentFolder.folder_count = getFolderCount(tree[currentFolderId].folderIds, foldersById);
            foldersById[currentFolderId] = currentFolder;

            // remove files and folders from original location
            const removeCurrentFolder = ([key]: [string]): boolean => key !== `${currentFolderId}`;
            R.forEach(([key, treeFolder]: [string, TreeFolderType]) => {
                tree[key].fileIds = R.without(fileIds, treeFolder.fileIds);
                tree[key].folderIds = R.without(folderIds, treeFolder.folderIds);
            }, R.compose(R.filter(removeCurrentFolder), R.toPairs)(tree));

            resolve({
                foldersById,
                filesById,
                tree,
                errors: err === null ? [] : [err],
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
