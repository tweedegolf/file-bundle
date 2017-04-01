import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';
import { replaceFolderById, replaceFileById } from '../util/traverse';

const store = getStore();
const dispatch = store.dispatch;

const moveFiles = (files, resolve, reject) => {
    const state = store.getState().tree;
    const rootFolder = R.clone(state.rootFolder);
    const currentFolder = R.clone(state.currentFolder);
    const folderId = currentFolder.id;
    console.log(files);
    const fileIds = R.map(f => f.id, files);

    api.paste(fileIds, folderId,
        () => {
            files.forEach((f) => {
                currentFolder.files.push(R.merge(f, { new: true }));
            });
            currentFolder.file_count = R.length(currentFolder.files);
/*
            R.forEach((f) => {
                // TODO: implement a removeFileById function in traverse.js
                rootFolder = replaceFileById({ fileId: f.id, file: null, rootFolder });
            }, files);
*/
            resolve({
                rootFolder: replaceFolderById({ folderId: currentFolder.id, folder: currentFolder, rootFolder }),
                currentFolder,
            });
        },
        (messages) => {
            const errors = files.map(file => ({
                id: getUID(),
                data: file.name,
                type: Constants.ERROR_MOVING_FILES,
                messages,
            }));
            reject({ errors });
        },
    );
};

export default (files) => {
    // dispatch ui state action here?
    moveFiles(
        files,
        (payload) => {
            dispatch({
                type: Constants.FILES_MOVED,
                payload,
            });
        },
        (payload) => {
            dispatch({
                type: Constants.ERROR_MOVING_FILES,
                payload,
            });
        },
    );
};
