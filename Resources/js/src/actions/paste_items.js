// @flow
/* eslint no-param-reassignment: 0 */
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import {
    getUID,
    getFileCount,
    getFolderCount,
} from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): { errors: ErrorType[] } => {
    const errors = [{
        id: getUID(),
        type: Constants.ERROR_MOVING_FILES,
        data,
        messages,
    }];
    return { errors };
};

const moveFiles = (
    resolve: (payload: PayloadFilesMovedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const ui: UIStateType = store.getState().ui;
    const state = store.getState();
    const treeState: TreeStateType = state.tree;
    const tmp1 = state.ui.currentFolderId;
    const tmp2 = R.clone(treeState.filesById);
    const tmp3 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null || tmp3 === null) {
        reject(createError('moving files', ['invalid state']));
        return;
    }
    const currentFolderId: string = tmp1;
    const filesById: FilesByIdType = tmp2;
    const foldersById: FoldersByIdType = tmp3;
    const currentFolder: FolderType = foldersById[currentFolderId];
    const tree: TreeType = R.clone(treeState.tree);

    const fileIds: string[] = ui.clipboard.fileIds;
    const folderIds: string[] = ui.clipboard.folderIds;

    api.paste(fileIds, folderIds, currentFolderId,
        () => {
            // add files and folders to current folder
            R.forEach((id: string) => {
                tree[currentFolderId].fileIds.push(id);
            }, fileIds);
            currentFolder.file_count = getFileCount(tree[currentFolderId].fileIds, filesById);

            R.forEach((id: string) => {
                tree[currentFolderId].folderIds.push(id);
            }, folderIds);
            currentFolder.folder_count = getFolderCount(tree[currentFolderId].folderIds, foldersById);

            foldersById[currentFolderId] = currentFolder;

            // remove files and folders from original location
            const filtered = R.map(([key, treeFolder]: [string, TreeFolderType]): null | [string, string[], string[]] => {
                if (key !== currentFolderId) {
                    return [key,
                        R.without(fileIds, treeFolder.fileIds),
                        R.without(folderIds, treeFolder.folderIds),
                    ];
                }
                return null;
            }, R.toPairs(tree));

            // todo:
            // 2 check test server
            R.forEach(([key, idsFile, idsFolder]: [string, string[], string[]]) => {
                tree[key].fileIds = idsFile;
                tree[key].folderIds = idsFolder;
            }, R.reject(R.isNil, filtered));

            resolve({
                foldersById,
                filesById,
                tree,
            });
        },
        (messages: string[]) => {
            const errors = fileIds.map((id: string): ErrorType => {
                const file = filesById[id];
                return {
                    id: getUID(),
                    data: file.name,
                    type: Constants.ERROR_MOVING_FILES,
                    messages,
                };
            });
            reject({ errors });
        },
    );
};

export default () => {
    // dispatch ui state action here?
    moveFiles(
        (payload: PayloadFilesMovedType) => {
            dispatch({
                type: Constants.FILES_MOVED,
                payload,
            });
        },
        (payload: PayloadErrorType) => {
            const a1: ActionErrorType = {
                type: Constants.ERROR_MOVING_FILES,
                payload,
            };
            dispatch(a1);
        },
    );
};
