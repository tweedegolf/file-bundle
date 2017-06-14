// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    OPEN_FOLDER,
    SHOW_RECYCLE_BIN,
    FOLDER_OPENED,
    ERROR_OPENING_FOLDER,
    RECYCLE_BIN_ID,
} from '../util/constants';
import {
    createError,
    getFileCount,
    getFolderCount,
} from '../util/util';

const DELAY: number = 100;
const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const optimisticUpdate = (folderId: string): boolean => {
    const treeState: TreeStateType = store.getState().tree;
    const tmp1 = R.clone(treeState.tree);
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    // state has not been fully initialized yet
    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        return false;
    }
    const tree: TreeType = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;

    // folder has not been loaded earlier so not in cache
    if (typeof tree[folderId] === 'undefined') {
        return false;
    }

    const a: ActionFolderOpenedType = {
        type: FOLDER_OPENED,
        payload: {
            currentFolderId: folderId,
            foldersById,
            filesById,
            tree,
        },
    };
    dispatch(a);
    return true;
};

const resolve = (payload: PayloadFolderOpenedType) => {
    const a: ActionFolderOpenedType = {
        type: FOLDER_OPENED,
        payload,
    };
    dispatch(a);
};

const reject = (payload: PayloadErrorOpenFolderType) => {
    const a: ActionErrorOpenFolderType = {
        type: ERROR_OPENING_FOLDER,
        payload,
    };
    dispatch(a);
};

const loadFolder = (
    folderId: string,
    checkRootFolder: boolean) => {
    const state = store.getState();
    const uiState: UIStateType = state.ui;
    const treeState: TreeStateType = state.tree;
    const tmp1 = state.ui.rootFolderId;
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        const err = createError(ERROR_OPENING_FOLDER, ['invalid state'], { id: folderId });
        const rootFolderId = uiState.rootFolderId !== null ? uiState.rootFolderId : folderId;
        reject({
            errors: [err],
            currentFolderId: rootFolderId,
        });
        return;
    }
    const rootFolderId: string = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const tree: TreeType = R.clone(treeState.tree);
    const currentFolder = foldersById[folderId];
    let parentFolderId = rootFolderId;
    if (currentFolder.parent !== null) {
        parentFolderId = currentFolder.parent;
    }

    // check if the current user is allowed to open this folder
    // -> happens only during initialization
    let rfCheck = 'null';
    // let rfCheck = rootFolderId;
    if (checkRootFolder === true) {
        rfCheck = rootFolderId;
    }

    api.openFolder(
        folderId,
        rfCheck,
        (error: boolean | string, folders: Array<FolderType>, files: Array<FileType>) => {
            if (error !== false) {
                const messages = [];
                if (typeof error === 'string') {
                    messages.push(error);
                }
                const err = createError(ERROR_OPENING_FOLDER, messages, { id: folderId });
                delete tree[folderId];
                delete foldersById[folderId];
                const folderIds = tree[parentFolderId].folderIds;
                tree[parentFolderId].folderIds = folderIds.filter((id: string): boolean => id !== folderId);
                reject({
                    errors: [err],
                    currentFolderId: parentFolderId,
                    foldersById,
                    tree,
                });
                return;
            }

            // remove deleted files and folders
            if (typeof tree[folderId] !== 'undefined') {
                tree[folderId].fileIds.forEach((id: string) => {
                    delete filesById[id];
                });
                tree[folderId].folderIds.forEach((id: string) => {
                    delete foldersById[id];
                });
            }

            tree[folderId] = {
                fileIds: [],
                folderIds: [],
            };

            R.forEach((f: FolderType) => {
                foldersById[f.id] = R.merge(f, { parent: folderId });
                tree[folderId].folderIds.push(f.id);
            }, folders);

            R.forEach((f: FileType) => {
                filesById[f.id] = f;
                tree[folderId].fileIds.push(f.id);
            }, files);

            currentFolder.file_count = getFileCount(tree[folderId].fileIds, filesById);
            currentFolder.folder_count = getFolderCount(tree[folderId].folderIds, foldersById);
            foldersById[currentFolder.id] = currentFolder;

            resolve({
                currentFolderId: folderId,
                foldersById,
                filesById,
                tree,
            });
        },
        (messages: Array<string>) => {
            const err = createError(ERROR_OPENING_FOLDER, messages, { id: folderId });
            reject({
                errors: [err],
                currentFolderId: parentFolderId,
                foldersById,
                tree,
            });
        },
    );
};

export const openFolder = (data: { id: string, checkRootFolder?: boolean, forceLoad?: boolean }) => {
    const { id, checkRootFolder = false, forceLoad = false } = data;
    let delay = 0;
    dispatch({
        type: OPEN_FOLDER,
        payload: { id },
    });

    if (forceLoad === false || checkRootFolder !== false) {
        const fromCache = optimisticUpdate(id);
        if (fromCache) {
            delay = DELAY;
        }
    }

    setTimeout(() => {
        dispatch({
            type: OPEN_FOLDER,
            payload: { id },
        });
        loadFolder(id, checkRootFolder);
    }, delay);
};

export const showRecycleBin = () => {
    const id = RECYCLE_BIN_ID;
    const forceLoad = false;
    const checkRootFolder = false;
    let delay = 0;
    dispatch({
        type: SHOW_RECYCLE_BIN,
        payload: { id },
    });

    if (forceLoad === false) {
        const fromCache = optimisticUpdate(id);
        if (fromCache) {
            delay = DELAY;
        }
    }

    setTimeout(() => {
        loadFolder(id, checkRootFolder);
    }, delay);
};
