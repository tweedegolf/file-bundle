// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const addFolder = (folderName: string, resolve: Function, reject: Function) => {
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const foldersById = R.clone(tree.foldersById);

    api.addFolder(folderName, currentFolder.id,
        (folders, errorMessages) => {
            folders.forEach((f) => {
                foldersById[f.id] = f;
                currentFolder.folders.push(R.merge(f, { new: true }));
            });

            currentFolder.folder_count = R.length(currentFolder.folders);
            foldersById[currentFolder.id] = currentFolder;

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
                currentFolder,
                foldersById,
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

export default (folderName: string) => {
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
