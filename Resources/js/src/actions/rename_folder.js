// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
// import * as Constants from '../util/constants';
import {
    RENAME_FOLDER,
    FOLDER_RENAMED,
    ERROR_RENAMING_FOLDER,

} from '../util/constants';
// import actions from '../util/actions';
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

export default (folderId: string, newName: string) => {
    dispatch({
        type: RENAME_FOLDER,
        payload: { id: folderId },
    });

    const tree: TreeStateType = store.getState().tree;
    const foldersById = { ...tree.foldersById };

    const tmp1: null | FolderType = R.clone(tree.currentFolder);

    if (tmp1 === null) {
        // reject({ errors: [createError('uploading files', ['invalid state'])] });
        return;
    }
    const currentFolder: FolderType = tmp1;

    api.renameFolder(
        folderId,
        newName,
        (folder: FolderType) => {
            foldersById[folder.id] = folder;
            if (typeof currentFolder.folders !== 'undefined') {
                const cloneFolders = R.map((f: FolderType): FolderType => {
                    if (f.id === folderId) {
                        return {
                            ...f,
                            name: newName,
                        };
                    }
                    return f;
                }, currentFolder.folders);
                currentFolder.folders = cloneFolders;
            }

            const a: ActionFolderRenamedType = {
                type: FOLDER_RENAMED,
                payload: {
                    foldersById,
                    currentFolder,
                },
            };
            dispatch(a);
        },
        (payload: PayloadErrorType) => {
            const a: ActionErrorType = {
                type: ERROR_RENAMING_FOLDER,
                payload,
            };
            dispatch(a);
        },
    );
};
