// @flow
import R from 'ramda';
import { persistStore } from 'redux-persist';
import { getStore } from '../reducers/store';
import { INIT } from '../util/constants';
import { openFolder } from '../actions';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: Dispatch = store.dispatch;

const init = (options: OptionsType) => {
    const rootFolderId: string = options.rootFolderId;
    const rootFolder: FolderType = {
        id: rootFolderId,
        name: '..',
        file_count: 0,
        folder_count: 0,
        parent: null,
    };
    const tree: TreeStateType = store.getState().tree;
    let foldersById = tree.foldersById;
    if (foldersById === null) {
        foldersById = {};
    }
    if (R.isNil(foldersById[rootFolderId])) {
        foldersById = { ...foldersById, [rootFolderId]: rootFolder };
    }

    const noCache = rootFolderId !== tree.rootFolderId;
    // console.log(noCache, rootFolderId, store.getState().tree.rootFolderId);
/*
        const action: ActionInitType = {
        type: INIT,
        payload: {
            selected: options.selected || [],
            rootFolderId,
            foldersById,
        },
    };
    dispatch(action);
*/
    dispatch({
        type: INIT,
        payload: {
            selected: options.selected || [],
            rootFolderId,
            foldersById,
        },
    });

    let currentFolderId: string = rootFolderId;
    if (tree.currentFolder !== null) {
        currentFolderId = tree.currentFolder.id;
    }

    if (noCache === true) {
        openFolder({ id: currentFolderId, checkRootFolder: true });
    } else {
        openFolder({ id: currentFolderId });
    }
};

export default (options: OptionsType) => {
    init(options);
    // persistStore(store, {}, options => init(options));
};
