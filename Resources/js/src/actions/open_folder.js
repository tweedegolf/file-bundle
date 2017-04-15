// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

// optimistic update
const fromCache = (folderId: number): PayloadFolderOpenedType | null => {
    const tree = store.getState().tree;
    const filesById: FilesByIdType = R.clone(tree.filesById);
    const foldersById: FoldersByIdType = R.clone(tree.foldersById);
    const rootFolderId: number = tree.rootFolderId;

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

const createError = (currentFolder: null | FolderType, messages: Array<string>): PayloadErrorType => {
    const data: string = currentFolder === null ? 'no name' : currentFolder.name;
    const errors = [{
        id: getUID(),
        data,
        type: Constants.ERROR_OPENING_FOLDER,
        messages,
    }];
    return { errors };
};

const loadFolder = (folderId: number, checkRootFolder: boolean,
    resolve: (payload: PayloadFolderOpenedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree: TreeStateType = store.getState().tree;
    const filesById: FilesByIdType = R.clone(tree.filesById);
    const foldersById: FoldersByIdType = R.clone(tree.foldersById);
    const rootFolderId: number = tree.rootFolderId;

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
            reject(createError(currentFolder, messages));
        },
    );
};

export default (data: { id: number, checkRootFolder?: boolean, forceLoad?: boolean }) => {
    const { id, checkRootFolder = false, forceLoad = false } = data;
    dispatch({
        type: Constants.OPEN_FOLDER,
        payload: { id },
    });

    if (forceLoad !== true && R.isNil(checkRootFolder)) {
        const payload: PayloadFolderOpenedType | null = fromCache(id);
        // console.log('cache', payload);
        if (payload !== null) {
            const a: ActionFolderOpenedType = {
                type: Constants.FOLDER_OPENED,
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
            dispatch({
                type: Constants.FOLDER_OPENED,
                payload,
            });
        },
        (payload: PayloadErrorType) => {
            dispatch({
                type: Constants.ERROR_OPENING_FOLDER,
                payload,
            });
        },
    );
};
