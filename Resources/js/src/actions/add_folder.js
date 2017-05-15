// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): PayloadErrorType => {
    const errors = [{
        id: getUID(),
        data,
        type: Constants.ERROR_ADDING_FOLDER,
        messages,
    }];
    return { errors };
};

const addFolder = (folderName: string,
    resolve: (payload: PayloadFolderAddedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree: TreeStateType = store.getState().tree;
    const tmp1 = R.clone(tree.foldersById);
    const tmp2 = tree.currentFolderId;
    if (tmp1 === null || tmp2 === null) {
        reject(createError(folderName, ['invalid state']));
        return;
    }
    const foldersById: FoldersByIdType = tmp1;
    const currentFolderId: string = tmp2;
    const currentFolder: FolderType = R.clone(foldersById[currentFolderId]);

    api.addFolder(folderName, currentFolderId,
        (folders: Array<FolderType>) => {
            folders.forEach((f: FolderType) => {
                foldersById[f.id] = R.merge(f, { isNew: true });
            });
            const newFolderIds = R.map((f: FolderType): string => f.id, folders);
            if (typeof currentFolder.folderIds !== 'undefined') {
                currentFolder.folderIds.push(...newFolderIds);
            }
            foldersById[currentFolderId] = currentFolder;

            const payload: PayloadFolderAddedType = {
                foldersById,
            };
            resolve(payload);
        },
        (messages: Array<string>) => {
            reject(createError(folderName, messages));
        },
    );
};

export default (folderName: string) => {
    dispatch({
        type: Constants.ADD_FOLDER,
    });

    addFolder(
        folderName,
        (payload: PayloadFolderAddedType) => {
            const a: ActionFolderAddedType = {
                type: Constants.FOLDER_ADDED,
                payload,
            };
            dispatch(a);
        },
        (payload: PayloadErrorType) => {
            const a: ActionErrorType = {
                type: Constants.ERROR_ADDING_FOLDER,
                payload,
            };
            dispatch(a);
        },
    );
};
