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

/*
type SetTrashFlagType = {
    folder: FolderType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};
const recursivelySetTrashFlag = (data: SetTrashFlagType): SetTrashFlagType => {
    const {
        folder,
        filesById,
    } = data;

    folder.isTrashed = true;

    if (typeof folder.files !== 'undefined') {
        folder.files = R.map((f: FileType): FileType =>
            ({ ...f, isTrashed: true }), folder.files);
        R.forEach((f: FileType) => { filesById[f.id] = f; }, folder.files);
    }

    if (typeof folder.folders !== 'undefined') {
        folder.folders = R.map((f: FolderType): FolderType =>
            ({ ...f, isTrashed: true }), folder.folders);

        R.forEach((f: FolderType) => { foldersById[f.id] = f; }, folder.folders);
    }
};
*/

const deleteFolder = (folderId: string,
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree: TreeStateType = store.getState().tree;
    const tmp1 = R.clone(tree.currentFolder);
    const tmp2 = R.clone(tree.filesById);
    const tmp3 = R.clone(tree.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        reject(createError(`folder with id ${folderId}`, ['invalid state']));
        return;
    }
    const currentFolder: FolderType = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;

    api.deleteFolder(folderId,
        () => {
            const folder = foldersById[folderId];
            folder.isTrashed = true;

            if (typeof currentFolder.folders !== 'undefined') {
                const folders: FolderType[] = currentFolder.folders;
                const index = R.findIndex(R.propEq('id', folderId))(folders);
                currentFolder.folders = R.update(index, folder, folders);
                currentFolder.folder_count = R.length(folders);
                foldersById[currentFolder.id] = currentFolder;
            }

            resolve({
                currentFolder,
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
