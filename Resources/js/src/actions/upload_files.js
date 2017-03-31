import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';
import { getFolderById, replaceFolderById } from '../util/traverse';

const store = getStore();
const dispatch = store.dispatch;

const uploadFiles = (fileList, folderId, resolve, reject) => {
    const state = store.getState().tree;
    const rootFolder = R.clone(state.rootFolder);
    const currentFolder = getFolderById({ rootFolder, folderId });

    api.upload(fileList, folderId,
        (rejected, newFiles) => {
            R.forEach((f) => {
                const f1 = { ...f, new: true };
                currentFolder.files.push(f1);
            }, newFiles);

            const errors = R.map(key => ({
                id: getUID(),
                type: Constants.ERROR_UPLOADING_FILE,
                data: key,
                messages: rejected[key],
            }), R.keys(rejected));

            resolve({
                currentFolder,
                rootFolder: replaceFolderById({ folderId, folder: currentFolder, rootFolder }),
                errors,
            });
        },
        (error) => {
            // console.log(error)
            const errors = R.map(f => ({
                id: getUID(),
                type: Constants.ERROR_UPLOADING_FILE,
                data: f.name,
                messages: error,
            }), fileList);
            reject({ errors });
        },
    );
};

export default (fileList, currentFolder) => {
    const files = Array.from(fileList);
    dispatch({
        type: Constants.UPLOAD_START,
        payload: { files },
    });

    uploadFiles(
        files,
        currentFolder,
        (payload) => {
            dispatch({
                type: Constants.UPLOAD_DONE,
                payload,
            });
        },
        (payload) => {
            dispatch({
                type: Constants.ERROR_UPLOADING_FILE,
                payload,
            });
        },
    );
};
