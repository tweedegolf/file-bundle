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

    const tmp1 = R.clone(tree.currentFolder);
    const tmp2 = R.clone(tree.filesById);
    const tmp3 = R.clone(tree.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        reject(createError('moving files', ['invalid state']));
        return;
    }
    const currentFolder: FolderType = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;

    const files: FileType[] = ui.clipboard;
    const fileIds: string[] = R.map((f: FileType): string => f.id, files);

    api.paste(fileIds, currentFolder.id,
        () => {
            R.forEach((f: FileType) => {
                filesById[f.id] = f;
                if (typeof currentFolder.files !== 'undefined') {
                    currentFolder.files.push(R.merge(f, { isNew: true }));
                }
            }, files);
            if (typeof currentFolder.files !== 'undefined') {
                currentFolder.file_count = R.length(currentFolder.files);
            }
            foldersById[currentFolder.id] = currentFolder;

            R.forEach((folder: FolderType) => {
                if (folder.id !== currentFolder.id) {
                    R.forEach((fileId: string) => {
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
