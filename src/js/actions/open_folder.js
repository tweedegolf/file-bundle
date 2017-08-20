// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    OPEN_FOLDER,
    FOLDER_OPENED,
    FOLDER_FROM_CACHE,
    ERROR_OPENING_FOLDER,
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

const openFolder = (folderId: string) => {
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
                currentFolderId: currentFolder.parent,
            });
        },
    );
};

export default (data: { id: string, forceLoad?: boolean }) => {
    const { id, forceLoad = false } = data;
    let delay = 0;
    dispatch({
        type: OPEN_FOLDER,
        payload: { id },
    });

    if (forceLoad === false) {
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
        openFolder(id);
    }, delay);
};

