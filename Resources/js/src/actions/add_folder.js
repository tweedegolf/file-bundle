import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';
import { replaceFolderById } from '../util/traverse';

const store = getStore();
const dispatch = store.dispatch;

const addFolder = (folderName, resolve, reject) => {
    const state = store.getState().tree;
    const rootFolder = R.clone(state.rootFolder);
    const currentFolder = R.clone(state.currentFolder);
    const currentFolderId = currentFolder.id;

    api.addFolder(folderName, currentFolderId,
        (folders, errorMessages) => {
            folders.forEach((f) => {
                currentFolder.folders.push(R.merge(f, { new: true }));
            });

            currentFolder.folder_count = R.length(currentFolder.folders);

            let errors = [];
            if (errorMessages.length > 0) {
                errors = [{
                    id: getUID(),
                    data: folderName,
                    type: Constants.ERROR_ADDING_FOLDER,
                    messages: errorMessages,
                }];
            }

            resolve({
                rootFolder: replaceFolderById({ folderId: currentFolderId, folder: currentFolder, rootFolder }),
                currentFolder,
                errors,
                //errors: [{id: 7777, type: 'generic', messages: ['oh my, this is an error!']}]
            });
        },
        (messages) => {
            const errors = [{
                id: getUID(),
                data: folderName,
                type: Constants.ERROR_ADDING_FOLDER,
                messages,
            }];
            reject({ errors });
        },
    );
};

export default (folderName) => {
    dispatch({
        type: Constants.ADD_FOLDER,
    });

    addFolder(
        folderName,
        (payload) => {
            dispatch({
                type: Constants.FOLDER_ADDED,
                payload,
            });
        },
        (payload) => {
            dispatch({
                type: Constants.ERROR_ADDING_FOLDER,
                payload,
            });
        },
    );
};
