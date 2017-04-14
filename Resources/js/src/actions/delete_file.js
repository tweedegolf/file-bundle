// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const createError = (messages: Array<string>, file: null | FileType = null) => {
    const data: string = file !== null ? file.name : 'no name';
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
    const currentFolder: null | FolderType = R.clone(tree.currentFolder);
    const filesById: null | FilesByIdType = R.clone(tree.filesById);
    const foldersById: null | FoldersByIdType = R.clone(tree.foldersById);

    api.deleteFile(fileId,
        () => {
            if (filesById !== null && foldersById !== null) {
                const file = filesById[fileId];
                file.isTrashed = true;
                if (currentFolder !== null) {
                    if (typeof currentFolder.files !== 'undefined') {
                        const files: Array<FileType> = currentFolder.files;
                        const index = R.findIndex(R.propEq('id', fileId))(files);
                        currentFolder.files = R.update(index, file, files);
                        currentFolder.file_count = R.length(currentFolder.files);
                        foldersById[currentFolder.id] = currentFolder;
                    }
                    resolve({
                        currentFolder,
                        filesById,
                        foldersById,
                    });
                }
            } else {
                reject(createError(['FilesById and foldersById can not by null']));
            }
        },
        (messages: Array<string>) => {
            let file: null | FileType = null;
            if (filesById !== null) {
                file = filesById[fileId];
            }
            reject(createError(messages, file));
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
