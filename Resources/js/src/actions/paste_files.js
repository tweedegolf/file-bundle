/* eslint no-param-reassignment: 0 */
// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const moveFiles = (
    resolve: (payload: PayloadFilesMovedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const ui = store.getState().ui;
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);

    const files = ui.clipboard;
    const fileIds = R.map((f: FileType): number => f.id, files);

    api.paste(fileIds, currentFolder.id,
        () => {
            R.forEach((f: FileType) => {
                filesById[f.id] = f;
                currentFolder.files.push(R.merge(f, { new: true }));
            }, files);
            currentFolder.file_count = R.length(currentFolder.files);
            foldersById[currentFolder.id] = currentFolder;

            R.forEach((folder: FolderType) => {
                if (folder.id !== currentFolder.id) {
                    R.forEach((fileId: number) => {
                        if (typeof folder.files !== 'undefined') {
                            // deliberately re-assign property though it is ugly
                            folder.files = R.reject((file: FileType): boolean =>
                                file.id === fileId, folder.files);
                            folder.file_count = R.length(folder.files);
                        }
                    }, fileIds);
                }
            }, R.values(foldersById));

            resolve({
                currentFolder,
                foldersById,
                filesById,
            });
        },
        (messages: string[]) => {
            const errors = files.map((file: FileType): ErrorType => ({
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
        (payload: PayloadFilesMovedType) => {
            dispatch({
                type: Constants.FILES_MOVED,
                payload,
            });
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: Constants.ERROR_MOVING_FILES,
                payload,
            };
            dispatch(a1);
        },
    );
};
