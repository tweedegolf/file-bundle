// @flowoff
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const uploadFiles = (files: Array<string>, resolve: Function, reject: Function) => {
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);

    api.upload(files, currentFolder.id,
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
            }), files);
            reject({ errors });
        },
    );
};

export default (fileList: global.FileList) => {
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
