// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const createError = (messages: Array<string>, file: null | FileType = null) => {
    const data = file !== null ? file.name : 'no name';
    const errors = [{
        id: getUID(),
        type: Constants.ERROR_DELETING_FILE,
        data,
        messages,
    }];
    return { errors };
};

const deleteFile = (fileId: number,
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);

    api.deleteFile(fileId,
        () => {
            const file = filesById[fileId];
            file.isTrashed = true;
            if (typeof currentFolder.files !== 'undefined') {
                const files = currentFolder.files;
                const index = R.findIndex(R.propEq('id', fileId))(files);
                currentFolder.files = R.update(index, file, files);
                currentFolder.file_count = R.length(currentFolder.files);
                foldersById[currentFolder.id] = currentFolder;
                resolve({
                    currentFolder,
                    filesById,
                    foldersById,
                });
            } else {
                reject(createError(['current folder has no files array'], file));
            }
        },
        (messages: Array<string>) => {
            reject(createError(messages, filesById[fileId]));
        },
    );
};

export default (fileId: number) => {
    dispatch({
        type: Constants.DELETE_FILE,
        payload: { fileId },
    });

    deleteFile(
        fileId,
        (payload: PayloadDeletedType) => {
            dispatch({
                type: Constants.FILE_DELETED,
                payload,
            });
        },
        (payload: PayloadErrorType) => {
            dispatch({
                type: Constants.ERROR_DELETING_FILE,
                payload,
            });
        },
    );
};
