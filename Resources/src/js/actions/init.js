// @flow
import R from 'ramda';
import { INIT, RECYCLE_BIN_ID } from '../util/constants';
import { openFolder, openRecycleBin, getMetaData } from '../actions';

// START FLOW TYPES

export type DatasetType = {
    name: string,
    language: string,
    selected: FileType[],
    rootFolderId: string,
    imagesOnly: boolean,
    allowMove: boolean,
    allowUpload: boolean,
    allowNewFolder: boolean,
    allowDeleteFile: boolean,
    allowDeleteFolder: boolean,
    allowRenameFolder: boolean,
    allowSelectMultiple: boolean,
    allowUploadMultiple: boolean,
    allowEmptyRecycleBin: boolean,
};

export type PermissionsType = {
    imagesOnly: boolean,
    allowMove: boolean,
    allowUpload: boolean,
    allowNewFolder: boolean,
    allowDeleteFile: boolean,
    allowDeleteFolder: boolean,
    allowRenameFolder: boolean,
    allowSelectMultiple: boolean,
    allowUploadMultiple: boolean,
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
    name: string,
    language: string,
    expanded: boolean,
    selected: ClipboardType,
    errors: ErrorType[],
    isUploadingFile: boolean,
    isAddingFolder: boolean,
    loadingFolderWithId: null | string,
    // tree reducer
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};

// END FLOW TYPES

const init = (
    state: StateType,
    dispatch: DispatchType,
    options: DatasetType,
    apiUrl: string,
    browser: boolean = true
) => {
    const permissions = { ...options };
    const {
        name,
        language,
        selected,
        rootFolderId,
    } = permissions;

    delete permissions.name;
    delete permissions.language;
    delete permissions.selected;
    delete permissions.rootFolderId;

    const {
        ui: uiState,
        tree: treeState,
    } = state;

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
            apiUrl,
            browser,
            expanded: browser === true,
            selected: allSelected,
            name,
            language,
            rootFolderId,
            isUploadingFile: false,
            isAddingFolder: false,
            loadingFolderWithId: null,
            currentFolderId,
            errors: [],
            permissions,
            // tree reducer
            filesById,
            foldersById,
        },
    };
    dispatch(action);

    if (currentFolderId === RECYCLE_BIN_ID) {
        dispatch(openRecycleBin());
    } else {
        dispatch(openFolder(currentFolderId));
    }

    if (browser === true && allSelected.fileIds.length + allSelected.folderIds.length > 0) {
        dispatch(getMetaData());
    }
};

export default (options: DatasetType, apiUrl: string, browser: boolean): ReduxThunkType => {
    return (dispatch: DispatchType, getState: () => StateType) => {
        const state = getState();
        init(state, dispatch, options, apiUrl, browser);
    };
};
