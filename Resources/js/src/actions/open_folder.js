import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const traverseTree = (tree, id, path) => {
    if (R.isNil(tree.folders) === false) {
        return R.map(folder => traverseTree(folder, id, path), tree.folders);
    }
};

const findInTree = (tree, id) => {
    if (id === null) {
        return tree[id];
    }
    const rootFolderId = null;
    const path = [null];
    return traverseTree(tree[rootFolderId], id, path);
};

const loadFolder = (folderId, forceLoad, resolve, reject) => {
    const state = store.getState().tree;
    // should we actually bother cloning these? we will clone them
    // again as we create a new state in the tree reducer
    const tree = { ...state.tree };
    const allFilesById = { ...state.allFilesById };
    const allFoldersById = { ...state.allFoldersById };
    const currentFolder = allFoldersById[folderId];

    let fromCache = true;
    if (forceLoad === true) {
        fromCache = false;
    } else if (R.isNil(currentFolder)) {
        fromCache = false;
    } else if (R.isNil(currentFolder.fileIds)) {
        fromCache = false;
    }

    // console.log('loadFolder', folderId, fromCache, forceLoad, state);

    if (fromCache) {
        const files = R.map((id) => {
            const f = state.allFilesById[id];
            f.new = false;
            return f;
        }, currentFolder.fileIds);

        const folders = R.map((id) => {
            const f = allFoldersById[id];
            f.new = false;
            return f;
        }, currentFolder.folderIds);

        let parentFolder;
        if (folderId !== null) {
            parentFolder = allFoldersById[currentFolder.parent];
        }

        resolve({
            allFilesById,
            allFoldersById,
            currentFolderId: folderId,
            currentFolder,
            parentFolder,
            files,
            folders,
        });
    } else {
        api.openFolder(
            folderId,
            (folders, files) => {
                currentFolder.folderIds = [];
                currentFolder.fileIds = [];

                R.forEach((f) => {
                    currentFolder.folderIds.push(f.id);
                    allFoldersById[f.id] = f;
                }, folders);

                R.forEach((f) => {
                    currentFolder.fileIds.push(f.id);
                    allFilesById[f.id] = f;
                }, files);

                let parentFolder;
                if (folderId !== null) {
                    parentFolder = allFoldersById[currentFolder.parent];
                }

                currentFolder.file_count = files.length;
                currentFolder.folder_count = folders.length;

                allFoldersById[folderId] = currentFolder;

                resolve({
                    allFilesById,
                    allFoldersById,
                    currentFolderId: folderId,
                    currentFolder,
                    parentFolder,
                    files,
                    folders,
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
