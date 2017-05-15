// @flow
import R from 'ramda';
import { persistStore } from 'redux-persist';
import { getStore } from '../reducers/store';
import { INIT } from '../util/constants';
import { openFolder } from '../actions';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: Dispatch = store.dispatch;

const init = (options: OptionsType, browser: boolean) => {
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
    let filesById = tree.filesById;
    if (filesById === null) {
        filesById = {};
    }

    const {
        imagesOnly = false,
        allowNewFolder = true,
        allowUpload = true,
        allowDelete = true,
        allowEdit = true,
    } = options;

    const noCache = rootFolderId !== tree.rootFolderId;
    const action: ActionInitType = {
        type: INIT,
        payload: {
            browser,
            selected: options.selected || [],
            multiple: options.multiple || true,
            language: options.language,
            imagesOnly,
            allowNewFolder,
            allowUpload,
            allowDelete,
            allowEdit,
            rootFolderId,
            foldersById,
            filesById,
        },
    };
    dispatch(action);

    let currentFolderId: string = rootFolderId;
    if (tree.currentFolderId !== null) {
        currentFolderId = tree.currentFolderId;
    }

    if (noCache === true) {
        openFolder({ id: currentFolderId, checkRootFolder: true });
    } else {
        openFolder({ id: currentFolderId });
    }
};

export default (options: OptionsType, browser: boolean) => {
    init(options, browser);
    // persistStore(store, {}, options => init(options));
};
