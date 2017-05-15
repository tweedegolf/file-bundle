// @flow
/* eslint no-param-reassignment: 0 */
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): { errors: ErrorType[] } => {
    const errors = [{
        id: getUID(),
        type: Constants.ERROR_MOVING_FILES,
        data,
        messages,
    }];
    return { errors };
};

const moveFiles = (
    resolve: (payload: PayloadFilesMovedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const ui: UIStateType = store.getState().ui;
    const tree: TreeStateType = store.getState().tree;

    const tmp1 = tree.currentFolderId;
    const tmp2 = R.clone(tree.filesById);
    const tmp3 = R.clone(tree.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        reject(createError('moving files', ['invalid state']));
        return;
    }
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const currentFolder: FolderType = R.clone(foldersById[tmp1]);

    const files: FileType[] = R.map((id: string): FileType => filesById[id], ui.clipboard);
    console.log(files, ui.clipboard);
    const fileIds: string[] = ui.clipboard;

    api.paste(fileIds, currentFolder.id,
        () => {
            // add files to current folder
            R.forEach((f: FileType) => {
                filesById[f.id] = f;
                if (typeof currentFolder.fileIds !== 'undefined') {
                    currentFolder.fileIds.push(f.id);
                }
            }, files);
            if (typeof currentFolder.fileIds !== 'undefined') {
                currentFolder.file_count = R.length(currentFolder.fileIds);
            }
            foldersById[currentFolder.id] = currentFolder;

            // remove files from original location
            R.forEach((folder: FolderType) => {
                console.log(folder);
                if (folder.id !== currentFolder.id) {
                    R.forEach((fileId1: string) => {
                        if (typeof folder.fileIds !== 'undefined') {
                            // deliberately re-assign property though it is ugly
                            folder.fileIds = R.reject((fileId2: string): boolean =>
                                fileId1 === fileId2, folder.fileIds);
                            folder.file_count = R.length(folder.fileIds);
                        }
                    }, fileIds);
                }
            }, R.values(foldersById));

            resolve({
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
