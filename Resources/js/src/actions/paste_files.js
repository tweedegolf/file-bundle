import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';
import { getFolderById, replaceFolderById, removeFiles } from '../util/traverse';

const store = getStore();
const dispatch = store.dispatch;

const moveFiles = (resolve, reject) => {
    const {
        tree: treeState,
        ui: uiState,
    } = store.getState();
    let rootFolder = R.clone(treeState.rootFolder);
    const currentFolder = R.clone(treeState.currentFolder);
    const folderId = currentFolder.id;
    const files = uiState.clipboard;
    const fileIds = R.map(f => f.id, files);

    api.paste(fileIds, folderId,
        () => {
            files.forEach((f) => {
                currentFolder.files.push(R.merge(f, { new: true }));
            });
            currentFolder.file_count = R.length(currentFolder.files);

            rootFolder = removeFiles({ rootFolder, files });

            resolve({
                rootFolder: replaceFolderById({ folderId: currentFolder.id, folder: currentFolder, rootFolder }),
                parentFolder: getFolderById({ rootFolder, folderId: currentFolder.parent }),
                currentFolder,
            });
        },
        (messages) => {
            const errors = files.map(file => ({
                id: getUID(),
                data: file.name,
                type: Constants.ERROR_MOVING_FILES,
                messages,
            }));
            reject({ errors });
        },
    );
};

export default () => {
    // dispatch ui state action here?
    moveFiles(
        (payload) => {
            dispatch({
                type: Constants.FILES_MOVED,
                payload,
            });
        },
        (payload) => {
            dispatch({
                type: Constants.ERROR_MOVING_FILES,
                payload,
            });
        },
    );
};
