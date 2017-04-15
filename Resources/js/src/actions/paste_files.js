// @flowoff
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store = getStore();
const dispatch = store.dispatch;

const moveFiles = (resolve: Function, reject: Function) => {
    const ui = store.getState().ui;
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);

    const files = ui.clipboard;
    const fileIds = R.map(f => f.id, files);

    api.paste(fileIds, currentFolder.id,
        () => {
            files.forEach((f) => {
                filesById[f.id] = f;
                currentFolder.files.push(R.merge(f, { new: true }));
            });
            currentFolder.file_count = R.length(currentFolder.files);
            foldersById[currentFolder.id] = currentFolder;

            R.forEach((folder) => {
                if (folder.id !== currentFolder.id) {
                    R.forEach((fileId) => {
                        folder.files = R.reject(file => file.id === fileId, folder.files);
                        folder.file_count = R.length(folder.files);
                    }, fileIds);
                }
            }, R.values(foldersById));

            resolve({
                currentFolder,
                foldersById,
                filesById,
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
