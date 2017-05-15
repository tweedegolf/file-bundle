// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    RENAME_FOLDER,
    FOLDER_RENAMED,
    ERROR_RENAMING_FOLDER,

} from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): PayloadErrorType => {
    const errors = [{
        id: getUID(),
        data,
        type: ERROR_RENAMING_FOLDER,
        messages,
    }];
    return { errors };
};

const renameFolder = (folderId: string,
    newName: string,
    resolve: (payload: PayloadFolderRenamedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree: TreeStateType = store.getState().tree;
    const tmp1 = tree.foldersById;

    if (tmp1 === null) {
        reject({ errors: [createError(`renaming file with id "${folderId}" to ${newName}`, ['invalid state'])] });
        return;
    }
    const foldersById: FoldersByIdType = tmp1;

    api.renameFolder(
        folderId,
        newName,
        (folder: FolderType) => {
            foldersById[folder.id] = folder;
            const a: ActionFolderRenamedType = {
                type: FOLDER_RENAMED,
                payload: {
                    foldersById,
                },
            };
            dispatch(a);
        },
        (errorMessages: string[]) => {
            reject(createError(newName, errorMessages));
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
