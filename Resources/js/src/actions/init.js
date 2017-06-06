// @flow
import R from 'ramda';
import { persistStore } from 'redux-persist';
import i18next from 'i18next';
import { getStore } from '../reducers/store';
import { INIT, RECYCLE_BIN_ID } from '../util/constants';
import { openFolder, getMetaData } from '../actions';

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
    const recycleBin: FolderType = {
        id: RECYCLE_BIN_ID,
        name: i18next.getResource(i18next.language, 'common', 'recycleBin'),
        file_count: 0,
        folder_count: 0,
        parent: null,
    };
    const state = store.getState();
    const uiState = state.ui;
    const treeState = state.tree;
    let foldersById = treeState.foldersById;
    if (foldersById === null) {
        foldersById = {};
    }
    if (R.isNil(foldersById[rootFolderId])) {
        foldersById = { ...foldersById, [rootFolderId]: rootFolder };
    }
    if (R.isNil(foldersById[RECYCLE_BIN_ID])) {
        foldersById = { ...foldersById, [RECYCLE_BIN_ID]: recycleBin };
    }
    let filesById = treeState.filesById;
    if (filesById === null) {
        filesById = {};
    }

    const selected = { ...uiState.selected };
    const s = options.selected;
    if (typeof s !== 'undefined' && s.length > 0) {
        s.forEach((f: FileType) => {
            filesById[f.id] = f;
            selected.fileIds.push(f.id);
        });
    }

    const {
        imagesOnly = false,
        allowNewFolder = true,
        allowUpload = true,
        allowDelete = true,
        allowEdit = true,
    } = options;

    const noCache = rootFolderId !== uiState.rootFolderId;
    const action: ActionInitType = {
        type: INIT,
        payload: {
            browser,
            selected,
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
            tree: treeState.tree,
        },
    };
    dispatch(action);

    let currentFolderId: string = rootFolderId;
    if (uiState.currentFolderId !== null) {
        currentFolderId = uiState.currentFolderId;
    }

    if (noCache === true) {
        openFolder({ id: currentFolderId, checkRootFolder: true });
    } else {
        openFolder({ id: currentFolderId });
    }

    if (selected.fileIds.length + selected.folderIds.length > 0) {
        getMetaData();
    }
};

export default (options: OptionsType, browser: boolean) => {
    // init(options, browser);
    persistStore(store, {}, () => {
        init(options, browser);
    });
};
