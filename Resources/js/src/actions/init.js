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
        const tmp: null | FoldersByIdType = store.getState().tree.foldersById;
        const rootFolder: FolderType = {
            id: rootFolderId,
            name: '..',
            file_count: 0,
            folder_count: 0,
        };

        let foldersById: FoldersByIdType = {
            [rootFolderId]: rootFolder,
        };

        if (tmp !== null) {
            foldersById = { ...tmp, ...foldersById };
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

        const currentFolderId: number = R.cond([
            [R.isNil, R.always(rootFolderId)],
            [R.isEmpty, R.always(rootFolderId)],
            [R.T, (cf: FolderType): number => cf.id],
        ])(store.getState().tree.currentFolder);

        if (noCache === true) {
            openFolder({ id: currentFolderId, checkRootFolder: true });
        } else {
            openFolder({ id: currentFolderId });
        }
    });
};
