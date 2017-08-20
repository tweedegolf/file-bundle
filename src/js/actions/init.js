// @flow
import R from 'ramda';
import { persistStore } from 'redux-persist';
import i18next from 'i18next';
import { getStore } from '../reducers/store';
import { INIT, RECYCLE_BIN_ID } from '../util/constants';
import { openFolder, getMetaData } from '../actions';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: Dispatch = store.dispatch;
const defaultOptions: OptionsType = {
    language: 'nl',
    multiple: true,
    rootFolderId: 'null',
    imagesOnly: false,
    allowEdit: true,
    allowUpload: true,
    allowDelete: true,
    allowNewFolder: true,
    selected: [],
};

const init = (options: OptionsType = defaultOptions, browser: boolean = true) => {
    const {
        language = 'nl',
        multiple = true,
        rootFolderId = 'null',
        imagesOnly = false,
        allowEdit = true,
        allowUpload = true,
        allowDelete = true,
        allowNewFolder = true,
    } = options;

    const rfId = rootFolderId === null ? 'null' : rootFolderId;
    const rootFolder: FolderType = {
        id: rfId,
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
    if (typeof foldersById[rfId] === 'undefined') {
        foldersById = {
            ...foldersById,
            [rfId]: rootFolder,
        };
    }
    if (typeof foldersById[RECYCLE_BIN_ID] === 'undefined') {
        foldersById = {
            ...foldersById,
            [RECYCLE_BIN_ID]: recycleBin,
        };
    }

    const filesById = treeState.filesById;
    const selected = { ...uiState.selected };
    if (typeof options.selected !== 'undefined') {
        const s: FileType[] = options.selected;
        s.forEach((f: FileType) => {
            filesById[f.id] = f;
            selected.fileIds.push(f.id);
        });
    }

    let currentFolderId = rfId;
    if (uiState.currentFolderId !== null) {
        currentFolderId = uiState.currentFolderId;
    }

    const action: ActionInitType = {
        type: INIT,
        payload: {
            browser,
            expanded: browser === true,
            selected,
            multiple,
            language,
            imagesOnly,
            allowNewFolder,
            allowUpload,
            allowDelete,
            allowEdit,
            rootFolderId,
            foldersById,
            filesById,
            isUploadingFile: false,
            isAddingFolder: false,
            loadingFolderWithId: null,
            currentFolderId,
            errors: [],
            tree: treeState.tree,
        },
    };
    dispatch(action);

    openFolder({ id: currentFolderId });

    if (selected.fileIds.length + selected.folderIds.length > 0) {
        getMetaData();
    }
};

export default (options: OptionsType, browser: boolean) => {
    init(options, browser);
    persistStore(store, {}, () => {
        init(options, browser);
    });
};
