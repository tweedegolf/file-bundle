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
        type: Constants.ERROR_DELETING_FILE,
        data,
        messages,
    }];
    return { errors };
};

const deleteFile = (fileId: string,
    resolve: (payload: PayloadDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree: TreeStateType = store.getState().tree;
    const tmp1: null | string = tree.currentFolderId;
    const tmp2: null | FilesByIdType = { ...tree.filesById };
    const tmp3: null | FoldersByIdType = { ...tree.foldersById };

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        reject(createError(`file with id ${fileId}`, ['invalid state']));
        return;
    }

    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const currentFolder: FolderType = R.clone(foldersById[tmp1]);

    api.deleteFile(fileId,
        () => {
            const file = filesById[fileId];
            file.isTrashed = true;
            if (typeof currentFolder.fileIds !== 'undefined') {
                const fileIds = currentFolder.fileIds;
                const index = R.findIndex(R.propEq('id', fileId))(fileIds);
                currentFolder.fileIds = R.update(index, file, fileIds);
                currentFolder.file_count = R.length(currentFolder.fileIds);
                foldersById[currentFolder.id] = currentFolder;
                resolve({
                    filesById,
                    foldersById,
                });
            } else {
                reject(createError(file.name, ['current folder has no files array']));
            }
        },
        (messages: Array<string>) => {
            const f: null | FileType = filesById[fileId];
            const n: string = f === null ? 'no name' : f.name;
            reject(createError(n, messages));
        },
    );
};

export default (fileId: string) => {
    const a: ActionDeleteType = {
        type: Constants.DELETE_FILE,
        payload: { id: fileId },
    };
    dispatch(a);

    deleteFile(
        fileId,
        (payload: PayloadDeletedType) => {
            const a1: ActionDeletedType = {
                type: Constants.FILE_DELETED,
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
