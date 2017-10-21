// @flow
import { persistStore } from 'redux-persist';
import { getStore } from '../reducers/store';
import { INIT, RECYCLE_BIN_ID } from '../util/constants';
import { openFolder, openRecycleBin, getMetaData } from '../actions';

// START FLOW TYPES

export type DatasetType = {
    language: string,
    selected: FileType[],
    rootFolderId: string,
    multiple: boolean,
    imagesOnly: boolean,
    allowMove: boolean,
    allowUpload: boolean,
    allowNewFolder: boolean,
    allowDeleteFile: boolean,
    allowDeleteFolder: boolean,
    allowRenameFolder: boolean,
    allowEmptyRecycleBin: boolean,
};

export type PermissionsType = {
    multiple: boolean,
    imagesOnly: boolean,
    allowMove: boolean,
    allowUpload: boolean,
    allowNewFolder: boolean,
    allowDeleteFile: boolean,
    allowDeleteFolder: boolean,
    allowRenameFolder: boolean,
    allowEmptyRecycleBin: boolean,
};

export type ActionInitType = {
    type: 'INIT',
    payload: PayloadInitType,
};

type PayloadInitType = {
    // ui reducer
    permissions: PermissionsType,
    browser: boolean,
    rootFolderId: string,
    currentFolderId: string,
    selected: Array<FileType>,
    language: string,
    expanded: boolean,
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

// END FLOW TYPES

const init = (
    storeId: string,
    options: DatasetType,
    browser: boolean = true
) => {
    const permissions = { ...options };
    const {
        language,
        selected,
        rootFolderId,
    } = permissions;

    delete permissions.language;
    delete permissions.selected;
    delete permissions.rootFolderId;

    const store = getStore(storeId);
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
            language,
            rootFolderId,
            isUploadingFile: false,
            isAddingFolder: false,
            loadingFolderWithId: null,
            currentFolderId,
            errors: [],
            permissions,
            // tree reducer
            tree: treeState.tree,
            filesById,
            foldersById,
        },
    };
    store.dispatch(action);

    if (currentFolderId === RECYCLE_BIN_ID) {
        openRecycleBin(storeId);
    } else {
        openFolder(storeId, currentFolderId);
    }

    if (browser === true && allSelected.fileIds.length + allSelected.folderIds.length > 0) {
        getMetaData(storeId);
    }
};

export default (storeId: string, options: DatasetType, browser: boolean) => {
    const store = getStore(storeId);
    if (browser === true) {
        persistStore(store, {}, () => {
            init(storeId, options, browser);
        });
    } else {
        init(storeId, options, browser);
    }
};
