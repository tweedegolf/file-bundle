import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';
import { getFileById, replaceFolderById } from '../util/traverse';

const store = getStore();
const dispatch = store.dispatch;

const deleteFile = (fileId, resolve, reject) => {
    const state = store.getState().tree;
    const rootFolder = R.clone(state.rootFolder);
    const currentFolder = R.clone(state.currentFolder);
    const folderId = currentFolder.id;

    api.deleteFile(fileId,
        () => {
            const file = getFileById({ fileId, rootFolder });
            file.isTrashed = true;
            currentFolder.file_count -= 1;
            const index = R.findIndex(R.propEq('id', fileId))(currentFolder.files);
            currentFolder.files = R.update(index, file, currentFolder.files);

            resolve({
                rootFolder: replaceFolderById({ folderId, folder: currentFolder, rootFolder }),
                currentFolder,
            });
        },
        (messages) => {
            const file = getFileById({ fileId, rootFolder });
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
