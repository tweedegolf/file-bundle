import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const deleteFolder = (fileId, resolve, reject) => {
    const tree = store.getState().tree;
    const {
        currentFolder,
        filesById,
        foldersById,
    } = tree;

    api.deleteFolder(fileId,
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
        (messages) => {
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

export default (fileId) => {
    dispatch({
        type: Constants.DELETE_FILE,
        payload: { fileId },
    });

    deleteFile(
        fileId,
        (payload) => {
            dispatch({
                type: Constants.FILE_DELETED,
                payload,
            });
        },
        (payload) => {
            dispatch({
                type: Constants.ERROR_DELETING_FILE,
                payload,
            });
        },
    );
};
