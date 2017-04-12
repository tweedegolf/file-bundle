// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType = getStore();
const dispatch: DispatchType = store.dispatch;

// optimistic update
const fromCache = (folderId: number): PayloadFolderOpenedType | null => {
    const tree = store.getState().tree;
    const filesById: {id?: FileType} = R.clone(tree.filesById);
    const foldersById: {id?: FolderType} = R.clone(tree.foldersById);
    const rootFolderId: number | null = tree.rootFolderId;
    const currentFolder: FolderType = foldersById[folderId];

    if (R.isNil(currentFolder) || R.isNil(currentFolder.files)) {
        return null;
    }

    const parentFolder: (FolderType | null) = (currentFolder.id === rootFolderId) ?
        null : foldersById[currentFolder.parent];

    return {
        parentFolder,
        currentFolder,
        foldersById,
        filesById,
    };
};

const loadFolder = (folderId: number, checkRootFolder: boolean,
    resolve: (payload: PayloadFolderOpenedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree = store.getState().tree;
    const filesById: {id?: FileType} = R.clone(tree.filesById);
    const foldersById: {id?: FolderType} = R.clone(tree.foldersById);
    const rootFolderId: number | null = tree.rootFolderId;
    const currentFolder: FolderType = foldersById[folderId];

    const parentFolder: (FolderType | null) = (currentFolder.id === rootFolderId) ?
        null : foldersById[currentFolder.parent];

    if (R.isNil(currentFolder.id) && rootFolderId !== null) {
        currentFolder.id = rootFolderId;
        currentFolder.name = '..';
    }

    let rfCheck;
    if (checkRootFolder === true) {
        rfCheck = rootFolderId;
    }

    api.openFolder(
        folderId,
        rfCheck,
        (folders: Array<FolderType>, files: Array<FileType>) => {
            currentFolder.folders = [];
            currentFolder.files = [];

            R.forEach((f: FolderType) => {
                foldersById[f.id] = f;
                currentFolder.folders.push(f);
            }, folders);

            R.forEach((f: FileType) => {
                filesById[f.id] = f;
                currentFolder.files.push(f);
            }, files);

            currentFolder.file_count = currentFolder.files.length;
            currentFolder.folder_count = currentFolder.folders.length;
            foldersById[folderId] = currentFolder;

            resolve({
                parentFolder,
                currentFolder,
                foldersById,
                filesById,
            });
        },
        (messages: Array<string>) => {
            const errors = [{
                id: getUID(),
                data: currentFolder.name,
                type: Constants.ERROR_OPENING_FOLDER,
                messages,
            }];
            reject({ errors });
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
            dispatch({
                type: Constants.FOLDER_OPENED,
                payload,
            });
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
