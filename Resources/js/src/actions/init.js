// @flow
import R from 'ramda';
import { persistStore } from 'redux-persist';
import { getStore } from '../reducers/store';
import * as Constants from '../util/constants';
import { openFolder } from '../actions';

const store: StoreType = getStore();
const dispatch: DispatchType = store.dispatch;

export default (options: OptionsType) => {
    persistStore(store, {}, () => {
        const rootFolderId: number = options.rootFolderId;
        const rootFolder: FolderType = {
            id: rootFolderId,
            name: '..',
            file_count: 0,
            folder_count: 0,
        };

        let foldersById: null | FoldersByIdType = store.getState().tree.foldersById;
        if (foldersById === null) {
            foldersById = {
                [rootFolderId]: rootFolder,
            };
        } else {
            foldersById = { ...foldersById, [rootFolderId]: rootFolder };
        }

        const noCache = rootFolderId !== store.getState().tree.rootFolderId;
        // console.log(noCache, rootFolderId, store.getState().tree.rootFolderId);
        const action: ActionInitType = {
            type: 'INIT',
            payload: {
                selected: options.selected || [],
                rootFolderId,
                foldersById,
            },
        };

        dispatch(action);

        const tmp: null | FolderType = store.getState().tree.currentFolder;
        const currentFolderId = tmp === null ? rootFolderId : tmp.id;

        if (noCache === true) {
            openFolder({ id: currentFolderId, checkRootFolder: true });
        } else {
            openFolder({ id: currentFolderId });
        }
    });
};
