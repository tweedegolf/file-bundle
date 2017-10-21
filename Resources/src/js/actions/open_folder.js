// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    OPEN_FOLDER,
    FOLDER_OPENED,
    FOLDER_FROM_CACHE,
    ERROR_OPENING_FOLDER,
    RECYCLE_BIN_ID,
} from '../util/constants';
import {
    createError,
    getFileCount,
    getFolderCount,
} from '../util/util';

type PayloadFolderOpenedType = {
    currentFolderId: string,
    foldersById: FoldersByIdType,
    filesById: FilesByIdType,
    tree: TreeType,
};

type PayloadErrorOpenFolderType = {
    errors: ErrorType[],
    currentFolderId: string,
};

export type ActionOpenFolderType = {
    type: 'OPEN_FOLDER',
    payload: {
        id: string,
    },
};

export type ActionFolderFromCacheType = {
    type: 'FOLDER_FROM_CACHE',
    payload: {
        currentFolderId: string,
    },
};

export type ActionFolderOpenedType = {
    type: 'FOLDER_OPENED',
    payload: PayloadFolderOpenedType,
};

export type ActionErrorOpenFolderType = {
    type: 'ERROR_OPENING_FOLDER',
    payload: PayloadErrorOpenFolderType,
};


const DELAY: number = 0; // 100

const optimisticUpdate = (
    store: StoreType<StateType, GenericActionType>,
    folderId: string
): boolean => {
    const treeState: TreeStateType = store.getState().tree;
    if (typeof treeState.foldersById[folderId] === 'undefined') {
        // folder has not yet been opened before
        return false;
    }
    const a: ActionFolderFromCacheType = {
        type: FOLDER_FROM_CACHE,
        payload: {
            currentFolderId: folderId,
        },
    };
    store.dispatch(a);
    return true;
};

const openFolder = (
    store: StoreType<StateType, GenericActionType>,
    folderId: string,
    resolve: (PayloadFolderOpenedType) => mixed,
    reject: (PayloadErrorOpenFolderType) => mixed,
) => {
    const {
        tree: treeState,
    } = store.getState();
    const tree: TreeType = R.clone(treeState.tree);
    const filesById: FilesByIdType = R.clone(treeState.filesById);
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const currentFolder = foldersById[folderId];

    api.openFolder(
        folderId,
        (folders: Array<FolderType>, files: Array<FileType>) => {
            // remove possibly deleted files and folders
            if (typeof tree[folderId] !== 'undefined') {
                tree[folderId].fileIds = [];
                tree[folderId].folderIds = [];
            }
            // create empty folder object for this folder
            tree[folderId] = {
                fileIds: [],
                folderIds: [],
            };
            // populate folder with files and sub-folders
            R.forEach((f: FolderType) => {
                foldersById[f.id] = R.merge(f, { parent: folderId });
                tree[folderId].folderIds.push(f.id);
            }, folders);

            R.forEach((f: FileType) => {
                filesById[f.id] = f;
                tree[folderId].fileIds.push(f.id);
            }, files);

            if (folderId !== RECYCLE_BIN_ID) {
                currentFolder.file_count = getFileCount(tree[folderId].fileIds, filesById);
                currentFolder.folder_count = getFolderCount(tree[folderId].folderIds, foldersById);
                foldersById[currentFolder.id] = currentFolder;
            }

            resolve({
                currentFolderId: folderId,
                foldersById,
                filesById,
                tree,
            });
        },
        (messages: Array<string>) => {
            const rootFolder = store.getState().ui.rootFolderId;
            const fallback = currentFolder.parent === null ? rootFolder : currentFolder.parent;
            const err = createError(ERROR_OPENING_FOLDER, messages, { id: folderId });
            reject({
                errors: [err],
                currentFolderId: fallback,
            });
        },
    );
};


export default (storeId: string, id: string, forceLoad: boolean = false) => {
    const store = getStore(storeId);
    const dispatch: DispatchType = store.dispatch;
    let delay = 0;
    dispatch({
        type: OPEN_FOLDER,
        payload: { id },
    });
    if (forceLoad === false) {
        const fromCache = optimisticUpdate(store, id);
        if (fromCache) {
            delay = DELAY;
        }
    }

    setTimeout(() => {
        dispatch({
            type: OPEN_FOLDER,
            payload: { id },
        });
        openFolder(
            store,
            id,
            (payload: PayloadFolderOpenedType) => {
                dispatch({
                    type: FOLDER_OPENED,
                    payload,
                });
            },
            (payload: PayloadErrorOpenFolderType) => {
                dispatch({
                    type: ERROR_OPENING_FOLDER,
                    payload,
                });
            },
        );
    }, delay);
};

