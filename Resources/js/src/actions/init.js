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

        let foldersById = store.getState().tree.foldersById;
        if (foldersById[rootFolderId] === null) {
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

        const tmp: number = store.getState().tree.currentFolder.id;
        const currentFolderId: number = tmp === -1 ? rootFolderId : tmp;

        if (noCache === true) {
            openFolder({ id: currentFolderId, checkRootFolder: true });
        } else {
            openFolder({ id: currentFolderId });
        }
    });
};
