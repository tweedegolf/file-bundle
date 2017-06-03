/* eslint no-use-before-define: 0 */
/* eslint-disable */
import R from 'ramda';
import * as Constants from '../util/constants';
// import {
//     FolderType,
//     FileType,
//     FoldersByIdType,
//     FilesByIdType,
//     ErrorType,
// } from './state_types';


// init
export type ActionInitType = {
    type: 'INIT',
    payload: PayloadInitType,
};

export type PayloadInitType = {
    rootFolderId: string,
    foldersById: FoldersByIdType,
    filesById: FilesByIdType,
    tree: TreeType,
    selected: Array<FileType>,
    language: string,
    multiple: boolean,
    browser: boolean,
    imagesOnly: boolean,
    allowNewFolder: boolean,
    allowUpload: boolean,
    allowDelete: boolean,
    allowEdit: boolean,
    selected: SelectedType,
};

// open folder
export type ActionOpenFolderType = {
    type: 'OPEN_FOLDER',
    payload: {
        id: string,
    },
};

export type ActionFolderOpenedType = {
    type: 'FOLDER_OPENED',
    payload: PayloadFolderOpenedType,
};

export type PayloadFolderOpenedType = {
    currentFolderId: string,
    foldersById: FoldersByIdType,
    filesById: FilesByIdType,
    tree: TreeType,
};

// rename folder
export type ActionRenameFolderType = {
    type: 'RENAME_FOLDER',
    payload: {
        id: string,
    },
};

export type ActionConfirmRenameFolderType = {
    type: 'CONFIRM_RENAME_FOLDER',
    payload: {
        id: string,
    },
};

export type ActionFolderRenamedType = {
    type: 'FOLDER_RENAMED',
    payload: PayloadFolderRenamedType,
};

export type PayloadFolderRenamedType = {
    foldersById: FoldersByIdType,
};


// add folder
export type ActionAddFolderType = {
    type: 'ADD_FOLDER',
};

export type ActionFolderAddedType = {
    type: 'FOLDER_ADDED',
    payload: PayloadFolderAddedType,
};

export type PayloadFolderAddedType = {
    tree: TreeType,
    foldersById: FoldersByIdType,
};


// upload files
export type ActionUploadStartType = {
    type: 'UPLOAD_START',
    payload: {
        files: File[],
    },
};

export type ActionUploadDoneType = {
    type: 'UPLOAD_DONE',
    payload: PayloadUploadDoneType,
};

export type PayloadUploadDoneType = {
    foldersById: FoldersByIdType,
    filesById: FilesByIdType,
    tree: TreeType,
    errors: ErrorType[],
};

// move files
export type ActionFilesMovedType = {
    type: 'FILES_MOVED',
    payload: PayloadUploadDoneType,
};

export type PayloadFilesMovedType = {
    foldersById: FoldersByIdType,
    filesById: FilesByIdType,
    tree: TreeType,
};

// change sorting
export type ActionChangeSortingType = {
    type: 'CHANGE_SORTING',
    payload: PayloadChangeSortingType,
};

export type PayloadChangeSortingType = {
    sort: SortEnumType,
};

// dismiss error
export type ActionDismissErrorType = {
    type: 'DISMISS_ERROR',
    payload: PayloadDismissErrorType,
};

export type PayloadDismissErrorType = {
    id: string,
};

// errors
// const errorTypes = R.join(R.filter((key: string) =>
//     key.indexOf('ERROR_') === 0, R.keys(Constants)), '|');
type errorTypes =
    | 'ERROR_DELETING_FILE'
    | 'ERROR_DELETING_FOLDER'
    | 'ERROR_ADDING_FOLDER'
    | 'ERROR_UPLOADING_FILE'
    | 'ERROR_OPENING_FOLDER'
    | 'ERROR_MOVING_ITEMS'
    | 'ERROR_RENAMING_FOLDER'
    | 'ERROR_EMPTY_RECYCLE_BIN'
    | 'ERROR_RESTORE_FROM_RECYCLE_BIN'
    | 'ERROR_GETTING_META_DATA'
;
export type ActionErrorType = {
    type: errorTypes;
    payload: PayloadErrorType,
};

export type PayloadErrorType = {
    errors: Array<ErrorType>,
};

// initiate delete file or folder
export type ActionDeleteType = {
    type:
        | 'DELETE_FOLDER'
        | 'CONFIRM_DELETE_FOLDER'
        | 'DELETE_FILE'
        | 'CONFIRM_DELETE_FILE',
    payload: PayloadDeleteType
};

export type PayloadDeleteType = {
    id: string | null,
};


// file or folder deleted
export type ActionDeletedType = {
    type:
        | 'FOLDER_DELETED'
        | 'FILE_DELETED'
        | 'RECYCLE_BIN_EMPTIED'
        | 'RESTORED_FROM_RECYCLE_BIN',
    payload: PayloadDeletedType
};

export type PayloadDeletedType = {
    tree: TreeType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};


export type ActionMetaDataType = {
    type: 'META_DATA_RECEIVED',
    payload: PayloadActionMetaDataType,
};

export type PayloadActionMetaDataType = {
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
    selected: ClipboardType,
};


// simple types
export type ActionSimpleType = {
    type: 'EMPTY_RECYCLE_BIN' | 'RESTORE_FROM_RECYCLE_BIN' | 'GET_META_DATA',
};

/*
export type ActionUnionTreeReducerType =
    | ActionInitType
    | ActionFolderOpenedType
    | ActionDeleteType
    | ActionDeletedType
    | ActionFolderAddedType
    | ActionErrorType
;
*/
export type ActionUnionType =
    | ActionInitType
    | ActionDeleteType
    | ActionDeletedType
    | ActionFolderOpenedType
    | ActionAddFolderType
    | ActionFolderAddedType
    | ActionErrorType
    | ActionUploadStartType
    | ActionUploadDoneType
    | ActionFilesMovedType
    | ActionDismissErrorType
    | ActionChangeSortingType
;
/*
const actions = {
    INIT: 'INIT',
    UPLOAD_START: 'UPLOAD_START',
    UPLOAD_DONE: 'UPLOAD_DONE',
    ERROR_UPLOADING_FILE: 'ERROR_UPLOADING_FILE',
    OPEN_FOLDER: 'OPEN_FOLDER',
    FOLDER_OPENED: 'FOLDER_OPENED',
    ERROR_OPENING_FOLDER: 'ERROR_OPENING_FOLDER',
    DELETE_FILE: 'DELETE_FILE',
    FILE_DELETED: 'FILE_DELETED',
    ERROR_DELETING_FILE: 'ERROR_DELETING_FILE',
    DELETE_FOLDER: 'DELETE_FOLDER',
    FOLDER_DELETED: 'FOLDER_DELETED',
    ERROR_DELETING_FOLDER: 'ERROR_DELETING_FOLDER',
    ADD_FOLDER: 'ADD_FOLDER',
    FOLDER_ADDED: 'FOLDER_ADDED',
    ERROR_ADDING_FOLDER: 'ERROR_ADDING_FOLDER',
    SELECT_FILE: 'SELECT_FILE',
    CUT_FILES: 'CUT_FILES',
    CANCEL_CUT_AND_PASTE_FILES: 'CANCEL_CUT_AND_PASTE_FILES',
    FILES_MOVED: 'FILES_MOVED',
    ERROR_MOVING_FILES: 'ERROR_MOVING_FILES',
    CHANGE_SORTING: 'CHANGE_SORTING',
    DISMISS_ERROR: 'DISMISS_ERROR',
    SHOW_PREVIEW: 'SHOW_PREVIEW',
    CONFIRM_DELETE_FILE: 'CONFIRM_DELETE_FILE',
    CONFIRM_DELETE_FOLDER: 'CONFIRM_DELETE_FOLDER',
    EXPAND_BROWSER: 'EXPAND_BROWSER',
    SET_HOVER: 'SET_HOVER',
    SET_SCROLL_POSITION: 'SET_SCROLL_POSITION',
    GET_META_DATA: 'GET_META_DATA',
};
export type Actions = $Keys<typeof actions>;
*/
// wip
/*
export type PayloadType = {
    selected?: Array<FileType>,
    clipboard?: Array<FileType>,
    scroll?: number,
    file?: FileType,
    browser?: boolean,
    multiple?: boolean,
    folder_id?: number,
    max?: number,
    diff?: number,
    hover?: number,
    errorId?: string,
    imageUrl?: string,
};
*/
