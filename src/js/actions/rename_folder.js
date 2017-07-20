// @flow
// import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    RENAME_FOLDER,
    FOLDER_RENAMED,
    ERROR_RENAMING_FOLDER,

} from '../util/constants';
import { createError } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const renameFolder = (folderId: string,
    newName: string,
    resolve: (payload: PayloadFolderRenamedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree: TreeStateType = store.getState().tree;
    const tmp1 = tree.foldersById;

    if (tmp1 === null) {
        const err = createError(ERROR_RENAMING_FOLDER, ['invalid state'], { folder: folderId, name: newName });
        reject({ errors: [err] });
        return;
    }
    const foldersById: FoldersByIdType = tmp1;
    const folder: FolderType = { ...foldersById[folderId], name: newName };

    api.renameFolder(
        folderId,
        newName,
        (error: boolean | string) => {
            if (error !== false) {
                const errors = [];
                const interpolation = { folder: folderId, name: newName };
                if (typeof error === 'string') {
                    errors.push(createError(ERROR_RENAMING_FOLDER, [error], interpolation));
                } else {
                    errors.push(createError(ERROR_RENAMING_FOLDER, [], interpolation));
                }
                reject({
                    errors,
                });
                return;
            }
            foldersById[folderId] = folder;
            const a: ActionFolderRenamedType = {
                type: FOLDER_RENAMED,
                payload: {
                    foldersById,
                },
            };
            dispatch(a);
        },
        (errorMessages: string[]) => {
            const err = createError(ERROR_RENAMING_FOLDER, errorMessages,
                { folder: folderId, name: newName });
            reject({
                errors: [err],
            });
        },
    );
};

export default (folderId: string, newName: string) => {
    const a: ActionRenameFolderType = {
        type: RENAME_FOLDER,
        payload: { id: folderId },
    };
    dispatch(a);

    renameFolder(
        folderId,
        newName,
        (payload: PayloadFolderRenamedType) => {
            const a1: ActionFolderRenamedType = {
                type: FOLDER_RENAMED,
                payload,
            };
            dispatch(a1);
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: ERROR_RENAMING_FOLDER,
                payload,
            };
            dispatch(a1);
        },
    );
};
