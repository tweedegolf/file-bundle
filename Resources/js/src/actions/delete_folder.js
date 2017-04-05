import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const deleteFolder = (folderId, resolve, reject) => {
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);

    api.deleteFolder(folderId,
        () => {
            const folder = foldersById[folderId];
            if (R.isNil(folder.files) === false) {
                folder.files = R.map(f => ({ ...f, isTrashed: true }), folder.files);
                R.forEach((f) => { filesById[f.id] = f; }, folder.files);
            }
            folder.isTrashed = true;

            const index = R.findIndex(R.propEq('id', folderId))(currentFolder.folders);
            currentFolder.folders = R.update(index, folder, currentFolder.folders);
            currentFolder.folder_count = R.length(currentFolder.folders);
            foldersById[currentFolder.id] = currentFolder;

            resolve({
                currentFolder,
                filesById,
                foldersById,
            });
        },
        (messages) => {
            const folder = foldersById[folderId];
            const errors = [{
                id: getUID(),
                data: folder.name,
                type: Constants.ERROR_DELETING_FOLDER,
                messages,
            }];
            reject({ errors });
        },
    );
};

export default (folderId) => {
    dispatch({
        type: Constants.DELETE_FOLDER,
        payload: { folderId },
    });

    deleteFolder(
        folderId,
        (payload) => {
            dispatch({
                type: Constants.FOLDER_DELETED,
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