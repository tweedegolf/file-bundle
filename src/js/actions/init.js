// @flow
import { persistStore } from 'redux-persist';
import { getStore } from '../reducers/store';
import { INIT, RECYCLE_BIN_ID } from '../util/constants';
import { openFolder, openRecycleBin, getMetaData } from '../actions';

// START FLOW TYPES

type PayloadInitType = {
    // ui reducer
    browser: boolean,
    rootFolderId: string,
    currentFolderId: string,
    selected: Array<FileType>,
    language: string,
    multiple: boolean,
    expanded: boolean,
    imagesOnly: boolean,
    allowNewFolder: boolean,
    allowUpload: boolean,
    allowDelete: boolean,
    allowEdit: boolean,
    selected: ClipboardType,
    errors: ErrorType[],
    isUploadingFile: boolean,
    isAddingFolder: boolean,
    loadingFolderWithId: null | string,
    // tree reducer
    tree: TreeType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};

export type ActionInitType = {
    type: 'INIT',
    payload: PayloadInitType,
};

export type OptionsType = {
    language: string,
    multiple: boolean,
    selected: FileType[],
    imagesOnly: boolean,
    allowEdit: boolean, // rename and cut & paste
    allowUpload: boolean,
    allowDelete: boolean,
    allowNewFolder: boolean,
    rootFolderId: string,
};

// END FLOW TYPES

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: Dispatch = store.dispatch;
const defaultOptions: OptionsType = {
    language: 'nl',
    multiple: true,
    selected: [],
    imagesOnly: false,
    allowEdit: true,
    allowUpload: true,
    allowDelete: true,
    allowNewFolder: true,
    rootFolderId: 'null',
};

const init = (options: OptionsType = defaultOptions, browser: boolean = true) => {
    const {
        language = defaultOptions.language,
        multiple = defaultOptions.multiple,
        selected = defaultOptions.selected,
        imagesOnly = defaultOptions.imagesOnly,
        allowEdit = defaultOptions.allowEdit,
        allowUpload = defaultOptions.allowUpload,
        allowDelete = defaultOptions.allowDelete,
        allowNewFolder = defaultOptions.allowNewFolder,
        rootFolderId = defaultOptions.rootFolderId,
    } = options;

    const {
        ui: uiState,
        tree: treeState,
    } = store.getState();

    const rfId = rootFolderId === null ? 'null' : rootFolderId;
    let foldersById = { ...treeState.foldersById };
    if (typeof foldersById[rfId] === 'undefined') {
        const rootFolder: FolderType = {
            id: rfId,
            name: '..',
            file_count: 0,
            folder_count: 0,
            parent: null,
        };
        foldersById = {
            ...foldersById,
            [rfId]: rootFolder,
        };
    }

    const filesById = treeState.filesById;
    const allSelected: ClipboardType = { ...uiState.selected };
    if (selected.length > 0) {
        selected.forEach((f: FileType) => {
            filesById[f.id] = f;
            allSelected.fileIds.push(f.id);
        });
    }

    let currentFolderId = rfId;
    if (uiState.currentFolderId !== null) {
        currentFolderId = uiState.currentFolderId;
    }

    const action: ActionInitType = {
        type: INIT,
        payload: {
            // ui reducer
            browser,
            expanded: browser === true,
            selected: allSelected,
            multiple,
            language,
            imagesOnly,
            allowNewFolder,
            allowUpload,
            allowDelete,
            allowEdit,
            rootFolderId,
            isUploadingFile: false,
            isAddingFolder: false,
            loadingFolderWithId: null,
            currentFolderId,
            errors: [],
            // tree reducer
            tree: treeState.tree,
            filesById,
            foldersById,
        },
    };
    dispatch(action);

    if (currentFolderId === RECYCLE_BIN_ID) {
        openRecycleBin();
    } else {
        openFolder({ id: currentFolderId });
    }

    if (allSelected.fileIds.length + allSelected.folderIds.length > 0) {
        getMetaData();
    }
};

export default (options: OptionsType, browser: boolean) => {
    // init(options, browser);
    persistStore(store, {}, () => {
        init(options, browser);
    });
};
