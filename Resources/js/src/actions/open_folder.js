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
    const filesById: null | FilesByIdType = R.clone(tree.filesById);
    const foldersById: null | FoldersByIdType = R.clone(tree.foldersById);
    const rootFolderId: number | null = tree.rootFolderId;

    let currentFolder = null;
    let parentFolder = null;

    if (foldersById === null) {
        return null;
    }

    currentFolder = foldersById[folderId];
    if (currentFolder !== null) {
        if (currentFolder.id !== rootFolderId && typeof R.isNil(currentFolder.parent) === false) {
            parentFolder = foldersById[currentFolder.parent];
        }
    }

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
    const filesById: null | FilesByIdType = R.clone(tree.filesById);
    const foldersById: null | FoldersByIdType = R.clone(tree.foldersById);
    const rootFolderId: number | null = tree.rootFolderId;

    let parentFolder: null | FolderType = null;
    let currentFolder: null | FolderType = null;

    if (foldersById === null) {
        if (rootFolderId !== null) {
            currentFolder = {
                id: rootFolderId,
                name: '..',
            };
        }
    } else {
        currentFolder = foldersById[folderId];
        if (currentFolder.id !== rootFolderId && typeof currentFolder.parent !== 'undefined') {
            parentFolder = foldersById[currentFolder.parent];
        }
    }

    let rfCheck;
    if (checkRootFolder === true) {
        rfCheck = rootFolderId;
    }

    api.openFolder(
        folderId,
        rfCheck,
        (folders: Array<FolderType>, files: Array<FileType>) => {
            if (currentFolder !== null && foldersById !== null && filesById !== null) {
                const tmp: FolderType = currentFolder;
                tmp.files = [];
                tmp.folders = [];

                R.forEach((f: FolderType) => {
                    foldersById[f.id] = f;
                    tmp.folders.push(f);
                }, folders);

                R.forEach((f: FileType) => {
                    filesById[f.id] = f;
                    tmp.files.push(f);
                }, files);

                tmp.file_count = tmp.files.length;
                tmp.folder_count = tmp.folders.length;
                foldersById[folderId] = tmp;

                resolve({
                    parentFolder,
                    currentFolder: tmp,
                    foldersById,
                    filesById,
                });
            } else {
                console.error('big phat error bro!');
            }



        },
        (messages: Array<string>) => {
            const data: string = currentFolder === null ? 'no name' : currentFolder.name;
            const errors = [{
                id: getUID(),
                data,
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
