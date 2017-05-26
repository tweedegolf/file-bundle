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
    const state = store.getState();
    const treeState: TreeStateType = state.tree;
    const tmp1 = state.ui.currentFolderId;
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        reject({ errors: [createError('uploading files', ['invalid state'])] });
        return;
    }
    const currentFolderId: string = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const currentFolder: FolderType = foldersById[currentFolderId];
    const tree: TreeType = treeState.tree;

    api.upload(files, currentFolder.id,
        (newFiles: FileType[], rejected: { [id: string]: string }) => {
            R.forEach((f: FileType) => {
                const f1: FileType = { ...f, isNew: true };
                filesById[f1.id] = f1;
                tree[currentFolderId].fileIds.push(f1.id);
            }, newFiles);

            currentFolder.file_count = R.length(tree[currentFolderId].fileIds);
            foldersById[currentFolderId] = currentFolder;

            const errors = R.map((key: string): ErrorType =>
                createError(key, [rejected[key]]), R.keys(rejected));

            resolve({
                foldersById,
                filesById,
                errors,
                tree,
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
