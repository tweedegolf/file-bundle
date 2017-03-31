import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';
import { getFolderById, replaceFolderById } from '../util/traverse';

const store = getStore();
const dispatch = store.dispatch;

const loadFolder = (folderId, forceLoad, resolve, reject) => {
    const state = store.getState().tree;
    let rootFolder = state.rootFolder;
    const rootFolderId = rootFolder.id;
    const currentFolder = getFolderById({ rootFolder, lookFor: folderId });

    let fromCache = true;
    if (forceLoad === true) {
        fromCache = false;
    } else if (R.isNil(currentFolder)) {
        fromCache = false;
    } else if (R.isNil(currentFolder.files)) {
        fromCache = false;
    }
    // console.log('loadFolder', folderId, fromCache, forceLoad, state);

    let parentFolder;
    if (folderId !== rootFolderId) {
        parentFolder = getFolderById({ rootFolder, lookFor: currentFolder.parent });
    }

    if (fromCache) {
        resolve({
            currentFolder,
            parentFolder,
            rootFolder,
        });
    } else {
        api.openFolder(
            folderId,
            (folders, files) => {
                currentFolder.folders = [];
                currentFolder.files = [];

                R.forEach((f) => {
                    currentFolder.folders.push(f);
                }, folders);

                R.forEach((f) => {
                    currentFolder.files.push(f);
                }, files);

                currentFolder.file_count = currentFolder.files.length;
                currentFolder.folder_count = currentFolder.folders.length;

                rootFolder = replaceFolderById({ folderId, folder: currentFolder, rootFolder });

                resolve({
                    currentFolder,
                    parentFolder,
                    rootFolder,
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
    }
};


export default (id, forceLoad = false) => {
    dispatch({
        type: Constants.OPEN_FOLDER,
        payload: { id },
    });

    loadFolder(
        id,
        forceLoad,
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
