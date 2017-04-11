// @flow
import R from 'ramda';
import { persistStore } from 'redux-persist';
import { getStore } from '../reducers/store';
import * as Constants from '../util/constants';
import { openFolder } from '../actions';

const store: StoreType = getStore();
const dispatch: DispatchType = store.dispatch;

export default (options: { root_folder_id: number, selected: ?Array<FileType> }) => {
    persistStore(store, {}, () => {
        const rootFolderId: number = options.root_folder_id;
        const foldersById: { id?: FolderType } = store.getState().tree.foldersById;

        foldersById[rootFolderId] = {
            id: rootFolderId,
            name: '..',
            file_count: 0,
            folder_count: 0,
        };

        const noCache = rootFolderId !== store.getState().tree.rootFolderId;
        // console.log(noCache, rootFolderId, store.getState().tree.rootFolderId);

        dispatch({
            type: Constants.INIT,
            payload: {
                selected: options.selected || [],
                rootFolderId,
                foldersById,
            },
        });

        const currentFolderId = R.cond([
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
