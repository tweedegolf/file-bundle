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
    const tmp1 = R.clone(tree.currentFolder);
    const tmp2 = R.clone(tree.foldersById);
    if (tmp1 === null || tmp2 === null) {
        reject(createError(folderName, ['invalid state']));
        return;
    }

    const currentFolder: FolderType = tmp1;
    const foldersById: FoldersByIdType = tmp2;

    api.addFolder(folderName, currentFolder.id,
        (folders: Array<FolderType>) => {
            folders.forEach((f: FolderType) => {
                foldersById[f.id] = f;
                if (typeof currentFolder.folders !== 'undefined') {
                    currentFolder.folders.push(R.merge(f, { new: true }));
                }
            });

            currentFolder.folder_count = R.length(folders);
            foldersById[currentFolder.id] = currentFolder;

            const payload: PayloadFolderAddedType = {
                currentFolder,
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
            // const a: ActionFolderAddedType = {
            const a = {
                type: Constants.FOLDER_ADDED,
                payload,
            };
            dispatch(a);
        },
        (payload: PayloadErrorType) => {
            const a: ActionErrorType = {
            // const a = {
                type: Constants.ERROR_ADDING_FOLDER,
                payload,
            };
            dispatch(a);
        },
    );
};
