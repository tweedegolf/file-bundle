// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { createError } from '../util/util';

// START FLOW TYPES

type PayloadUploadDoneType = {
    foldersById: FoldersByIdType,
    filesById: FilesByIdType,
    tree: TreeType,
    errors: ErrorType[],
};

export type ActionUploadStartType = {
    type: 'UPLOAD_START',
    payload: {
        files: File[],
    },
};

export type ActionUploadDoneType = {
    type: 'UPLOAD_DONE',
    payload: PayloadUploadDoneType,
};

// END FLOW TYPES

const uploadFiles = (
    store: StoreType<StateType, GenericActionType>,
    files: Array<File>,
    resolve: (payload: PayloadUploadDoneType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = store.getState();

    const tree: TreeType = R.clone(treeState.tree);
    const filesById: FilesByIdType = R.clone(treeState.filesById);
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const currentFolderId: string = uiState.currentFolderId;
    const currentFolder: FolderType = foldersById[currentFolderId];

    api.upload(files, currentFolder.id,
        (newFiles: FileType[], rejected: { [string]: string }) => {
            R.forEach((f: FileType) => {
                const fc: FileType = { ...f, is_new: true };
                filesById[fc.id] = fc;
                tree[currentFolderId].fileIds.push(fc.id);
            }, newFiles);

            currentFolder.file_count = R.length(tree[currentFolderId].fileIds);
            foldersById[currentFolderId] = currentFolder;

            const errors = R.map((key: string): ErrorType =>
                createError(Constants.ERROR_UPLOADING_FILE, [rejected[key]], { file: key }), R.keys(rejected));

            resolve({
                foldersById,
                filesById,
                errors,
                tree,
            });
        },
        (errors: string[]) => {
            const err = createError(Constants.ERROR_UPLOADING_FILE, errors);
            reject({ errors: [err] });
        },
    );
};

export default (storeId: string, fileList: global.FileList) => {
    const store = getStore(storeId);
    const dispatch: DispatchType = store.dispatch;
    const files: File[] = Array.from(fileList);
    const a: ActionUploadStartType = {
        type: Constants.UPLOAD_START,
        payload: { files },
    };
    dispatch(a);

    uploadFiles(
        store,
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
