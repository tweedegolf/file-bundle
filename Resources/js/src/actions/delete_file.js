// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const deleteFile = (fileId: number,
    resolve: (payload: PayloadDeleteFileType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);

    api.deleteFile(fileId,
        () => {
            const file = filesById[fileId];
            file.isTrashed = true;
            const index = R.findIndex(R.propEq('id', fileId))(currentFolder.files);
            currentFolder.files = R.update(index, file, currentFolder.files);
            currentFolder.file_count = R.length(currentFolder.files);
            foldersById[currentFolder.id] = currentFolder;

            resolve({
                currentFolder,
                filesById,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            const file = filesById[fileId];
            const errors = [{
                id: getUID(),
                data: file.name,
                type: Constants.ERROR_DELETING_FILE,
                messages,
            }];
            reject({ errors });
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
        (payload: PayloadDeleteFileType) => {
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
