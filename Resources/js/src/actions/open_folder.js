// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    OPEN_FOLDER,
    FOLDER_OPENED,
    ERROR_OPENING_FOLDER,

} from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): PayloadErrorType => {
    const errors = [{
        id: getUID(),
        data,
        type: ERROR_OPENING_FOLDER,
        messages,
    }];
    return { errors };
};

// optimistic update
const fromCache = (folderId: string): PayloadFolderOpenedType | null => {
    const treeState: TreeStateType = store.getState().tree;
    const tmp1 = R.clone(treeState.tree);
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    // state has not been fully initialized yet
    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        return null;
    }
    const tree: TreeType = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;

    // folder has not been loaded earlier so not in cache
    if (typeof tree[folderId] === 'undefined') {
        return null;
    }

    return {
        currentFolderId: folderId,
        foldersById,
        filesById,
        tree,
    };
};

const loadFolder = (folderId: string, checkRootFolder: boolean,
    resolve: (payload: PayloadFolderOpenedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const treeState: TreeStateType = store.getState().tree;
    const tmp1 = R.clone(treeState.filesById);
    const tmp2 = R.clone(treeState.foldersById);
    const tmp3 = treeState.rootFolderId;

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        reject(createError(`opening folder with id ${folderId}`, ['invalid state']));
        return;
    }
    const filesById: FilesByIdType = tmp1;
    const foldersById: FoldersByIdType = tmp2;
    const rootFolderId: string = tmp3;
    const tree: TreeType = R.clone(treeState.tree);

    if (typeof tree[folderId] === 'undefined') {
        tree[folderId] = {
            fileIds: [],
            folderIds: [],
        };
    }

    // check if the current user is allowed to open this folder
    // -> happens only during initialization
    let rfCheck = '';
    if (checkRootFolder === true) {
        rfCheck = rootFolderId;
    }

    api.openFolder(
        folderId,
        rfCheck,
        (folders: Array<FolderType>, files: Array<FileType>) => {
            R.forEach((f: FolderType) => {
                foldersById[f.id] = f;
                tree[folderId].folderIds.push(f.id);
            }, folders);

            R.forEach((f: FileType) => {
                filesById[f.id] = f;
                tree[folderId].fileIds.push(f.id);
            }, files);

            resolve({
                currentFolderId: folderId,
                foldersById,
                filesById,
                tree,
            });
        },
        (messages: Array<string>) => {
            reject(createError(`Error opening folder with id "${folderId}"`, messages));
        },
    );
};

export default (data: { id: string, checkRootFolder?: boolean, forceLoad?: boolean }) => {
    const { id, checkRootFolder = false, forceLoad = false } = data;
    dispatch({
        type: OPEN_FOLDER,
        payload: { id },
    });

    if (forceLoad === false || checkRootFolder !== false) {
        const payload: PayloadFolderOpenedType | null = fromCache(id);
        // console.log('cache', payload);
        if (payload !== null) {
            const a: ActionFolderOpenedType = {
                type: FOLDER_OPENED,
                payload,
            };
            dispatch(a);
            return;
        }
    }

    // setTimeout(() => {
    // }, 1000);
    loadFolder(
        id,
        checkRootFolder,
        (payload: PayloadFolderOpenedType) => {
            const a: ActionFolderOpenedType = {
                type: FOLDER_OPENED,
                payload,
            };
            dispatch(a);
        },
        (payload: PayloadErrorType) => {
            const a: ActionErrorType = {
                type: ERROR_OPENING_FOLDER,
                payload,
            };
            dispatch(a);
        },
    );
};
