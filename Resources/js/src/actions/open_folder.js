import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

// optimistic update
const fromCache = (folderId) => {
    const tree = store.getState().tree;
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);
    const rootFolderId = tree.rootFolderId;
    const currentFolder = foldersById[folderId];

    if (R.isNil(currentFolder) || R.isNil(currentFolder.files)) {
        return null;
    }

    const parentFolder = (currentFolder.id === rootFolderId) ?
        null : foldersById[currentFolder.parent];

    return {
        parentFolder,
        currentFolder,
        foldersById,
        filesById,
    };
};

const loadFolder = (folderId, checkRootFolder = false, resolve, reject) => {
    const tree = store.getState().tree;
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);
    const rootFolderId = tree.rootFolderId;
    const currentFolder = foldersById[folderId];
    // console.log(currentFolder);

    const parentFolder = (currentFolder.id === rootFolderId) ?
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
        (folders, files) => {
            currentFolder.folders = [];
            currentFolder.files = [];

            R.forEach((f) => {
                foldersById[f.id] = f;
                currentFolder.folders.push(f);
            }, folders);

            R.forEach((f) => {
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
        (messages) => {
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

export default ({ id, checkRootFolder, forceLoad }) => {
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
        (payload) => {
            dispatch({
                type: Constants.FOLDER_OPENED,
                payload,
            });
        },
        (payload) => {
            dispatch({
                type: Constants.ERROR_OPENING_FOLDER,
                payload,
            });
        },
    );
};
