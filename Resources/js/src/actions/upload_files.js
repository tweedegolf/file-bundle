// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (message: string, data: string): ErrorType => ({
    id: getUID(),
    type: Constants.ERROR_UPLOADING_FILE,
    data,
    messages: [message],
});

const uploadFiles = (files: Array<File>,
    resolve: (payload: PayloadUploadDoneType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);

    api.upload(files, currentFolder.id,
        (rejected: { [id: string]: string }, newFiles: FileType[]) => {
            R.forEach((f: FileType) => {
                const f1: FileType = { ...f, new: true };
                currentFolder.files.push(f1);
                filesById[f1.id] = f1;
            }, newFiles);

            currentFolder.file_count = R.length(currentFolder.files);
            foldersById[currentFolder.id] = currentFolder;

            const errors = R.map((key: string): ErrorType =>
                createError(rejected[key], key), R.keys(rejected));

            resolve({
                currentFolder,
                foldersById,
                filesById,
                errors,
            });
        },
        (error: string) => {
            // console.log(error)
            const errors = R.map((file: File): ErrorType =>
                createError(file.name, error), files);
            reject({ errors });
        },
    );
};

export default (fileList: global.FileList) => {
    const files: File[] = Array.from(fileList);
    const a: ActionUploadStartType = {
        type: Constants.UPLOAD_START,
        payload: { files },
    };
    dispatch(a);

    uploadFiles(
        files,
        (payload: PayloadUploadDoneType) => {
            const a1: ActionUploadDoneType = {
                type: Constants.UPLOAD_DONE,
                payload,
            };
            dispatch(a1);
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: Constants.ERROR_UPLOADING_FILE,
                payload,
            };
            dispatch(a1);
        },
    );
};
