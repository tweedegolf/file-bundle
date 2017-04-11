// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

type OpenFolderType = ({
    parentFolder: TypeFolder,
    currentFolder: TypeFolder,
    foldersById: {
        id: TypeFolder,
    },
    filesById: {
        id: TypeFile,
    }
} | null);

// optimistic update
const fromCache = (folderId: number): OpenFolderType => {
    const tree = store.getState().tree;
    const filesById: {id: TypeFile} = R.clone(tree.filesById);
    const foldersById: {id: TypeFolder} = R.clone(tree.foldersById);
    const rootFolderId: number = tree.rootFolderId;
    const currentFolder: TypeFolder = foldersById[folderId];

    if (R.isNil(currentFolder) || R.isNil(currentFolder.files)) {
        return null;
    }

    const parentFolder: TypeFolder = (currentFolder.id === rootFolderId) ?
        null : foldersById[currentFolder.parent];

    return {
        parentFolder,
        currentFolder,
        foldersById,
        filesById,
    };
};

const loadFolder = (folderId: number, checkRootFolder: boolean,
    resolve: () => OpenFolderType, reject: () => mixed) => {
    const tree = store.getState().tree;
    const filesById: {id: TypeFile} = R.clone(tree.filesById);
    const foldersById: {id: TypeFolder} = R.clone(tree.foldersById);
    const rootFolderId: number = tree.rootFolderId;
    const currentFolder: TypeFolder = foldersById[folderId];

    const parentFolder: TypeFolder = (currentFolder.id === rootFolderId) ?
        null : foldersById[currentFolder.parent];

    if (R.isNil(currentFolder.id)) {
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

            R.forEach((f: TypeFolder) => {
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
        const payload = fromCache(id);
        // console.log('cache', payload);
        if (R.isNil(payload) === false) {
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
        (payload: TypePayload) => {
            dispatch({
                type: Constants.FOLDER_OPENED,
                payload,
            });
        },
        (payload: TypePayload) => {
            dispatch({
                type: Constants.ERROR_OPENING_FOLDER,
                payload,
            });
        },
    );
};
