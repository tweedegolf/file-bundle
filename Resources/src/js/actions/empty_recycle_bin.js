// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    EMPTY_RECYCLE_BIN,
    RECYCLE_BIN_EMPTIED,
    RECYCLE_BIN_FROM_CACHE,
    ERROR_EMPTY_RECYCLE_BIN,
} from '../util/constants';
import { createError } from '../util/util';

// START FLOW TYPES

type PayloadEmptyRecycleBinType = {
    tree: TreeType,
    filesById: FilesByIdType,
    recycleBin: RecycleBinType,
    foldersById: FoldersByIdType,
    selected: ClipboardType,
};

export type ActionEmptyRecycleBinType = {
    type: 'EMPTY_RECYCLE_BIN'
};

export type ActionRecycleBinEmptiedType = {
    type: 'RECYCLE_BIN_EMPTIED',
    payload: PayloadEmptyRecycleBinType
};

// END FLOW TYPES

// @TODO: clear selected files and folders that were in the recycle bin!

const emptyRecycleBin = (
    store: StoreType<StateType, GenericActionType>,
    resolve: (payload: PayloadEmptyRecycleBinType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
     } = store.getState();

    const filesById: FilesByIdType = R.clone(treeState.filesById);
    const foldersById: FoldersByIdType = R.clone(treeState.foldersById);
    const tree: TreeType = R.clone(treeState.tree);
    const {
        files,
        folders,
    } = R.clone(treeState.recycleBin);
    const recycleBin = {
        files: [],
        folders: [],
    };
    const {
        fileIds: selectedFileIds,
        folderIds: selectedFolderIds,
    } = { ...uiState.selected };

    api.emptyRecycleBin(
        (errors: string[]) => {
            if (errors.length > 0) {
                const err = createError(ERROR_EMPTY_RECYCLE_BIN, errors);
                reject({
                    errors: [err],
                });
                return;
            }
            const fileIds = R.map((file: FileType): string => file.id, files);
            const folderIds = R.map((folder: FolderType): string => folder.id, folders);

            R.forEach((id: string) => {
                delete filesById[id];
            }, fileIds);

            R.forEach((id: string) => {
                delete tree[id];
                delete foldersById[id];
            }, folderIds);

            // clean up tree
            R.forEach((id: string) => {
                tree[id].fileIds = R.without(fileIds, tree[id].fileIds);
                tree[id].folderIds = R.without(folderIds, tree[id].folderIds);
            }, R.keys(tree));

            // remove the items that were selected in the recycle bin from the
            // selected object in the uiState
            const selected = {
                fileIds: R.without(fileIds, selectedFileIds),
                folderIds: R.without(folderIds, selectedFolderIds),
            };

            resolve({
                tree,
                filesById,
                recycleBin,
                foldersById,
                selected,
            });
        },
        (messages: string[]) => {
            const err = createError(ERROR_EMPTY_RECYCLE_BIN, messages);
            reject({ errors: [err] });
        },
    );
};

export default (storeId: string) => {
    const store = getStore(storeId);
    const dispatch: DispatchType = store.dispatch;
    const a: ActionEmptyRecycleBinType = {
        type: EMPTY_RECYCLE_BIN,
    };
    dispatch(a);

    emptyRecycleBin(
        store,
        (payload: PayloadEmptyRecycleBinType) => {
            const a1: ActionRecycleBinEmptiedType = {
                type: RECYCLE_BIN_EMPTIED,
                payload,
            };
            dispatch(a1);
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: ERROR_EMPTY_RECYCLE_BIN,
                payload,
            };
            dispatch(a1);
        },
    );
};
