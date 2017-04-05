import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const loadFolder = (folderId, forceLoad, resolve, reject) => {
    const tree = store.getState().tree;
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);
    const rootFolderId = tree.rootFolderId;
    const currentFolder = foldersById[folderId];
    // console.log(currentFolder);

    let fromCache = true;
    if (forceLoad === true) {
        fromCache = false;
    } else if (R.isNil(currentFolder)) {
        fromCache = false;
    } else if (R.isNil(currentFolder.files)) {
        fromCache = false;
    }

    let pf;
    if (currentFolder.id !== rootFolderId) {
        pf = foldersById[currentFolder.parent];
    }

    if (R.isNil(currentFolder.id)) {
        currentFolder.id = rootFolderId;
        currentFolder.name = '..';
    }

    if (fromCache) {
        resolve({
            parentFolder: pf,
            currentFolder,
            foldersById,
            filesById,
        });
    } else {
        api.openFolder(
            folderId,
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
                    parentFolder: pf,
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
