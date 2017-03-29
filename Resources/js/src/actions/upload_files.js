import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const uploadFiles = (fileList, folderId, resolve, reject) => {
    const state = store.getState().tree;
    // should we actually bother cloning these? we will clone them
    // again as we create a new state in the tree reducer
    const files = [...state.files];
    const allFilesById = { ...state.allFilesById };
    const allFoldersById = { ...state.allFoldersById };
    const currentFolder = allFoldersById[folderId];

    api.upload(fileList, folderId,
        (rejected, newFiles) => {
            R.forEach((f) => {
                const f1 = { ...f, new: true };
                files.push(f1);
                allFilesById[f1.id] = f1;
                currentFolder.fileIds.push(f1.id);
            }, newFiles);

            const errors = R.map(key => ({
                id: getUID(),
                type: Constants.ERROR_UPLOADING_FILE,
                data: key,
                messages: rejected[key],
            }), R.keys(rejected));

            allFoldersById[folderId].file_count = currentFolder.fileIds.length;

            resolve({
                allFilesById,
                allFoldersById,
                currentFolder,
                files,
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
