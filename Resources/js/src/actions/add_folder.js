// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import * as Constants from '../util/constants';
import { getUID } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const addFolder = (folderName: string,
    resolve: (payload: PayloadFolderAddedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed) => {
    const tree = store.getState().tree;
    const currentFolder = R.clone(tree.currentFolder);
    const foldersById = R.clone(tree.foldersById);

    api.addFolder(folderName, currentFolder.id,
        (folders: Array<FolderType>, errorMessages: Array<string>) => {
            folders.forEach((f: FolderType) => {
                foldersById[f.id] = f;
                if (typeof currentFolder.folders !== 'undefined') {
                    currentFolder.folders.push(R.merge(f, { new: true }));
                }
            });

            currentFolder.folder_count = R.length(folders);
            foldersById[currentFolder.id] = currentFolder;

            let errors = [];
            if (errorMessages.length > 0) {
                errors = [{
                    id: getUID(),
                    data: folderName,
                    type: Constants.ERROR_ADDING_FOLDER,
                    messages: errorMessages,
                }];
            }

            resolve({
                currentFolder,
                foldersById,
                errors,
                //errors: [{id: 7777, type: 'generic', messages: ['oh my, this is an error!']}]
            });
        },
        (messages: Array<string>) => {
            const errors = [{
                id: getUID(),
                data: folderName,
                type: Constants.ERROR_ADDING_FOLDER,
                messages,
            }];
            reject({ errors });
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
