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
    allowDeleteFolder: boolean,
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
    allowDeleteFolder: boolean,
    rootFolderId: string,
};

// END FLOW TYPES

const store: StoreType<StateType, GenericActionType> = getStore();
const dispatch: Dispatch = store.dispatch;

const init = (options: OptionsType, browser: boolean = true) => {
    const opts = options;
    const {
        language,
        multiple,
        selected,
        imagesOnly,
        allowEdit,
        allowUpload,
        allowDelete,
        allowNewFolder,
        allowDeleteFolder,
        rootFolderId,
    } = opts;

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
    let allSelected: ClipboardType = {
        fileIds: [],
        folderIds: [],
    };
    if (browser === true) {
        allSelected = { ...uiState.selected };
    } else if (selected.length > 0) {
        selected.forEach((f: FileType) => {
            filesById[f.id] = f;
            allSelected.fileIds.push(f.id);
        });
    }

    let currentFolderId = rfId;
    // if (uiState.currentFolderId !== null) {
    if (browser === true) {
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
            allowDeleteFolder,
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

    if (browser === true && allSelected.fileIds.length + allSelected.folderIds.length > 0) {
        getMetaData();
    }
};

export default (options: OptionsType, browser: boolean) => {
    if (browser === true) {
        persistStore(store, {}, () => {
            init(options, browser);
        });
    } else {
        init(options, browser);
    }
};
