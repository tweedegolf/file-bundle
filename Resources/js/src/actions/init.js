import R from 'ramda';
import { persistStore } from 'redux-persist';
import { getStore } from '../reducers/store';
import * as Constants from '../util/constants';
import { openFolder } from '../actions';

const store = getStore();
const dispatch = store.dispatch;

export default (options) => {
    persistStore(store, {}, () => {
        const rootFolderId = options.root_folder_id;
        const foldersById = store.getState().tree.foldersById;

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
            [R.T, cf => cf.id],
        ])(store.getState().tree.currentFolder);

        if (noCache === true) {
            openFolder({ id: currentFolderId, checkRootFolder: true });
        } else {
            openFolder({ id: currentFolderId });
        }
    });
};
