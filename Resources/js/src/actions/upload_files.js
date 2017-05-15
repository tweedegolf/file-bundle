// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): ErrorType => ({
    id: getUID(),
    type: Constants.ERROR_UPLOADING_FILE,
    data,
    messages,
});

const uploadFiles = (files: Array<File>,
    resolve: (payload: PayloadUploadDoneType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree: TreeStateType = store.getState().tree;
    const tmp1: null | FilesByIdType = R.clone(tree.filesById);
    const tmp2: null | FoldersByIdType = R.clone(tree.foldersById);

    if (tmp1 === null || tmp2 === null) {
        reject({ errors: [createError('uploading files', ['invalid state'])] });
        return;
    }
    const filesById: FilesByIdType = tmp1;
    const foldersById: FoldersByIdType = tmp2;
    const currentFolderId: string = tree.currentFolderId;
    const currentFolder: FolderType = foldersById[currentFolderId];

    api.upload(files, currentFolder.id,
        (newFiles: FileType[], rejected: { [id: string]: string }) => {
            R.forEach((f: FileType) => {
                const f1: FileType = { ...f, isNew: true };
                if (typeof currentFolder.fileIds !== 'undefined') {
                    currentFolder.fileIds.push(f1.id);
                }
                filesById[f1.id] = f1;
            }, newFiles);

            if (typeof currentFolder.fileIds !== 'undefined') {
                currentFolder.file_count = R.length(currentFolder.fileIds);
            }
            foldersById[currentFolderId] = currentFolder;

            const errors = R.map((key: string): ErrorType =>
                createError(key, [rejected[key]]), R.keys(rejected));

            resolve({
                foldersById,
                filesById,
                errors,
            });
        },
        (errorMessages: string[]) => {
            // console.log(error)
            const errors = R.map((file: File): ErrorType =>
                createError(file.name, errorMessages), files);
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
