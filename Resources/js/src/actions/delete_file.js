import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const deleteFile = (fileId, folderId, resolve, reject) => {
    const state = store.getState().tree;
    // should we actually bother cloning these? we will clone them
    // again as we create a new state in the tree reducer
    const allFilesById = { ...state.allFilesById };
    const allFoldersById = { ...state.allFoldersById };
    const currentFolder = { ...allFoldersById[folderId] };

    api.deleteFile(fileId,
        () => {
            const remainingFileIds = R.filter(id => id !== fileId, currentFolder.fileIds);
            const remainingFiles = R.map(id => allFilesById[id], remainingFileIds);
            currentFolder.fileIds = remainingFileIds;
            currentFolder.file_count = remainingFileIds.length;

            allFoldersById[folderId] = currentFolder;
            delete allFilesById[fileId];

            resolve({
                allFilesById,
                allFoldersById,
                currentFolder,
                files: remainingFiles,
            });
        },
        (messages) => {
            const file = allFilesById[fileId];
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

export default (currentFolderId, fileId) => {
    dispatch({
        type: Constants.DELETE_FILE,
        payload: { fileId },
    });

    deleteFile(
        fileId,
        currentFolderId,
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
