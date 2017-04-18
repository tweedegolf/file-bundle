// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const deleteFolder = (folderId: number,
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const filesById = R.clone(tree.filesById);
    const foldersById = R.clone(tree.foldersById);

    api.deleteFolder(folderId,
        () => {
            const folder = foldersById[folderId];
            if (typeof folder.files !== 'undefined') {
                folder.files = R.map((f: FileType): FileType =>
                    ({ ...f, isTrashed: true }), folder.files);
                R.forEach((f: FileType) => { filesById[f.id] = f; }, folder.files);
                folder.isTrashed = true;
            }

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

export default (folderId: number) => {
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
