import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const uploadFiles = (fileList, resolve, reject) => {
    const tree = store.getState().tree;
    const {
        currentFolder,
        filesById,
        foldersById,
    } = tree;

    api.upload(fileList, currentFolder.id,
        (rejected, newFiles) => {
            R.forEach((f) => {
                const f1 = { ...f, new: true };
                currentFolder.files.push(f1);
                filesById[f1.id] = f1;
            }, newFiles);

            currentFolder.file_count = R.length(currentFolder.files);
            foldersById[currentFolder.id] = currentFolder;

            const errors = R.map(key => ({
                id: getUID(),
                type: Constants.ERROR_UPLOADING_FILE,
                data: key,
                messages: rejected[key],
            }), R.keys(rejected));

            resolve({
                currentFolder,
                foldersById,
                filesById,
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

export default (fileList) => {
    const files = Array.from(fileList);
    dispatch({
        type: Constants.UPLOAD_START,
        payload: { files },
    });

    uploadFiles(
        files,
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
