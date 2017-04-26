// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
// import * as Constants from '../util/constants';
import {
    OPEN_FOLDER,
    FOLDER_OPENED,
    ERROR_OPENING_FOLDER,

} from '../util/constants';
// import actions from '../util/actions';
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
    const tree: TreeStateType = store.getState().tree;
    const rootFolderId: string = tree.rootFolderId;
    const tmp1 = R.clone(tree.filesById);
    const tmp2 = R.clone(tree.foldersById);

    // state has not been fully initialized yet
    if (tmp1 === null || tmp2 === null) {
        return null;
    }
    const filesById: FilesByIdType = tmp1;
    const foldersById: FoldersByIdType = tmp2;

    // folder not in cache
    if (foldersById[folderId] === null || typeof foldersById[folderId].files === 'undefined') {
        return null;
    }

    let parentFolder: null | FolderType = null;
    const currentFolder: FolderType = foldersById[folderId];
    if (currentFolder.id !== rootFolderId && currentFolder.parent !== null) {
        parentFolder = foldersById[currentFolder.parent];
    }

    return {
        parentFolder,
        currentFolder,
        foldersById,
        filesById,
    };
};

const loadFolder = (folderId: string, checkRootFolder: boolean,
    resolve: (payload: PayloadFolderOpenedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree: TreeStateType = store.getState().tree;
    let tmp1 = R.clone(tree.filesById);
    const tmp2 = R.clone(tree.foldersById);
    if (tmp1 === null) {
        tmp1 = {};
    }
    if (tmp2 === null) {
        reject(createError(`opening folder with id ${folderId}`, ['invalid state']));
        return;
    }
    const rootFolderId: string = tree.rootFolderId;
    const filesById: FilesByIdType = tmp1;
    const foldersById: FoldersByIdType = tmp2;

    const currentFolder: FolderType = foldersById[folderId];
    let parentFolder: null | FolderType = null;
    if (currentFolder.parent !== null) {
        parentFolder = foldersById[currentFolder.parent];
    }

    let rfCheck;
    if (checkRootFolder === true) {
        rfCheck = rootFolderId;
    }

    api.openFolder(
        folderId,
        rfCheck,
        (folders: Array<FolderType>, files: Array<FileType>) => {
            currentFolder.files = [];
            currentFolder.folders = [];

            R.forEach((f: FolderType) => {
                foldersById[f.id] = f;
                if (typeof currentFolder.folders !== 'undefined') {
                    currentFolder.folders.push(f);
                }
            }, folders);

            R.forEach((f: FileType) => {
                filesById[f.id] = f;
                if (typeof currentFolder.files !== 'undefined') {
                    currentFolder.files.push(f);
                }
            }, files);

            currentFolder.file_count = files.length;
            currentFolder.folder_count = folders.length;
            foldersById[folderId] = currentFolder;

            resolve({
                parentFolder,
                currentFolder,
                foldersById,
                filesById,
            });
        },
        (messages: Array<string>) => {
            reject(createError(currentFolder.name, messages));
        },
    );
};

export default (data: { id: string, checkRootFolder?: boolean, forceLoad?: boolean }) => {
    const { id, checkRootFolder = false, forceLoad = false } = data;
    dispatch({
        type: OPEN_FOLDER,
        payload: { id },
    });

    if (forceLoad !== true && R.isNil(checkRootFolder)) {
        const payload: PayloadFolderOpenedType | null = fromCache(id);
        // console.log('cache', payload);
        if (payload !== null) {
            const a: ActionFolderOpenedType = {
                type: FOLDER_OPENED,
                payload,
            };
            dispatch(a);
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
