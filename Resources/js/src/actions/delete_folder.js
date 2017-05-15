// @flow
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
        type: Constants.ERROR_DELETING_FOLDER,
        data,
        messages,
    }];
    return { errors };
};

const deleteFolder = (folderId: string,
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree: TreeStateType = store.getState().tree;
    const tmp1 = R.clone(tree.filesById);
    const tmp2 = R.clone(tree.foldersById);

    if (tmp1 === null || tmp2 === null) {
        reject(createError(`folder with id ${folderId}`, ['invalid state']));
        return;
    }
    const filesById: FilesByIdType = tmp1;
    const foldersById: FoldersByIdType = tmp2;

    api.deleteFolder(folderId,
        () => {
            const folder = foldersById[folderId];
            folder.isTrashed = true;
            console.log(folder);

            if (typeof folder.folderIds !== 'undefined') {
                R.forEach((id: string) => {
                    const f: FolderType = foldersById[id];
                    console.log('deleting folder', f);
                    foldersById[id] = R.merge(f, { isTrashed: true });
                }, folder.folderIds);
            }

            if (typeof folder.fileIds !== 'undefined') {
                R.forEach((id: string) => {
                    const f: FileType = filesById[id];
                    console.log('deleting file', f);
                    filesById[id] = R.merge(f, { isTrashed: true });
                }, folder.fileIds);
            }

            resolve({
                filesById,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            const folder = foldersById[folderId];
            reject(createError(folder.name, messages));
        },
    );
};

export default (folderId: string) => {
    const a: ActionDeleteType = {
        type: Constants.DELETE_FOLDER,
        payload: { id: folderId },
    };
    dispatch(a);

    deleteFolder(
        folderId,
        (payload: PayloadDeletedType) => {
            const a1: ActionDeletedType = {
                type: Constants.FOLDER_DELETED,
                payload,
            };
            dispatch(a1);
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: Constants.ERROR_DELETING_FILE,
                payload,
            };
            dispatch(a1);
        },
    );
};
