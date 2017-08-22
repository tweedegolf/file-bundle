// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { createError } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;


type PayloadEmptyRecycleBinType = {
    tree: TreeType,
    filesById: FilesByIdType,
    recycleBin: RecycleBinType,
    foldersById: FoldersByIdType,
    currentFolderId: string,
};

const emptyRecycleBin = (
    resolve: (payload: PayloadEmptyRecycleBinType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
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

    api.emptyRecycleBin(
        (errors: string[]) => {
            if (errors.length > 0) {
                const err = createError(Constants.ERROR_EMPTY_RECYCLE_BIN, errors);
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

            resolve({
                tree,
                filesById,
                recycleBin,
                foldersById,
                currentFolderId: Constants.RECYCLE_BIN_ID,
            });
        },
        (messages: string[]) => {
            const err = createError(Constants.ERROR_EMPTY_RECYCLE_BIN, messages);
            reject({ errors: [err] });
        },
    );
};

export default () => {
    const a: ActionSimpleType = {
        type: Constants.EMPTY_RECYCLE_BIN,
    };
    dispatch(a);

    emptyRecycleBin(
        (payload: PayloadDeletedType) => {
            const a1: ActionDeletedType = {
                type: Constants.RECYCLE_BIN_EMPTIED,
                payload,
            };
            dispatch(a1);
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: Constants.ERROR_EMPTY_RECYCLE_BIN,
                payload,
            };
            dispatch(a1);
        },
    );
};
