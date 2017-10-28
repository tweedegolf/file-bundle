// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    DELETE_FILE,
    FILE_DELETED,
    ERROR_DELETING_FILE,
    RECYCLE_BIN_ID,
} from '../util/constants';
import { createError, getFileCount } from '../util/util';

// START FLOW TYPES

export type PayloadFileDeletedType = {
    tree: TreeType,
    recycleBin: RecycleBinType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};

export type ActionDeleteFileType = {
    type: 'DELETE_FILE',
    payload: {
        id: string
    }
};

export type ActionFileDeletedType = {
    type: 'FILE_DELETED',
    payload: PayloadFileDeletedType,
};

// END FLOW TYPES

const store: StoreType<StateType, GenericActionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const deleteFile = (fileId: string,
    resolve: (payload: PayloadFileDeletedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = store.getState();
    const currentFolderId: string = uiState.currentFolderId;
    const filesById: FilesByIdType = R.clone(treeState.filesById);
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const tree: TreeType = R.clone(treeState.tree);
    let recycleBin = { ...treeState[RECYCLE_BIN_ID] };

    api.deleteFile(fileId,
        (error: string) => {
            if (error !== 'false') {
                const file = filesById[fileId];
                const interpolation = {};
                if (typeof file === 'undefined') {
                    interpolation.id = `${fileId}`;
                } else {
                    interpolation.name = `${file.name}`;
                }
                const err = createError(ERROR_DELETING_FILE, [error], interpolation);
                reject({ errors: [err] });
                return;
            }
            const file = filesById[fileId];
            filesById[fileId] = R.merge(file, { is_trashed: true });

            const currentFolder: FolderType = foldersById[currentFolderId];
            currentFolder.file_count = getFileCount(tree[currentFolderId].fileIds, filesById);
            foldersById[currentFolderId] = currentFolder;

            recycleBin = {
                files: [...recycleBin.files, file],
                folders: [...recycleBin.folders],
            };

            resolve({
                tree,
                filesById,
                recycleBin,
                foldersById,
            });
        },
        (messages: Array<string>) => {
            const file: FileType = filesById[fileId];
            const name: string = typeof file === 'undefined' ? 'no name' : `${file.name}`;
            const error = createError(ERROR_DELETING_FILE, messages, { name });
            reject({ errors: [error] });
        },
    );
};

export default (fileId: string) => {
    const a: ActionDeleteFileType = {
        type: DELETE_FILE,
        payload: { id: fileId },
    };
    dispatch(a);

    deleteFile(
        fileId,
        (payload: PayloadFileDeletedType) => {
            const a1: ActionFileDeletedType = {
                type: FILE_DELETED,
                payload,
            };
            dispatch(a1);
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: ERROR_DELETING_FILE,
                payload,
            };
            dispatch(a1);
        },
    );
};
