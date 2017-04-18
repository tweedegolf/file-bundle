/* eslint no-use-before-define: 0 */
/* eslint no-undef: 0 */
import R from 'ramda';
import * as Constants from '../../Resources/js/src/util/constants';
// import {
//     FolderType,
//     FileType,
//     FoldersByIdType,
//     FilesByIdType,
//     ErrorType,
// } from './state_types';


// init
declare type ActionInitType = {
    type: Constants.INIT,
    payload: PayloadInitType,
};

declare type PayloadInitType = {
    selected: Array<FileType>,
    rootFolderId: number,
    foldersById : FoldersByIdType,
};

// open folder
declare type ActionOpenFolderType = {
    type: Constants.OPEN_FOLDER,
    payload: {
        id: number,
    },
};

declare type ActionFolderOpenedType = {
    type: Constants.FOLDER_OPENED,
    payload: PayloadFolderOpenedType,
};

declare type PayloadFolderOpenedType = {
    parentFolder: null | FolderType,
    currentFolder: FolderType,
    foldersById: FoldersByIdType,
    filesById: FilesByIdType,
};


// add folder
declare type ActionAddFolderType = {
    type: Constants.ADD_FOLDER,
};

declare type ActionFolderAddedType = {
    type: Constants.FOLDER_ADDED,
    payload: PayloadFolderAddedType,
};

declare type PayloadFolderAddedType = {
    currentFolder: FolderType,
    foldersById: FoldersByIdType,
    errors: Array<ErrorType>,
};


// errors
const errorTypes = R.join(R.filter((key: string) =>
    key.indexOf('ERROR_') === 0, R.keys(Constants)), '|');
declare type ActionErrorType = {
    type: errorTypes;
    payload: PayloadErrorType,
};

declare type PayloadErrorType = {
    errors: Array<ErrorType>,
};

// initiate delete file or folder
declare type ActionDeleteType = {
    type: Constants.DELETE_FOLDER |
          Constants.CONFIRM_DELETE_FOLDER |
          Constants.FOLDER_DELETED |
          Constants.DELETE_FILE |
          Constants.CONFIRM_DELETE_FILE,
    payload: PayloadDeleteType
};

declare type PayloadDeleteType = {
    id: number | null
};


// file or folder deleted
declare type ActionDeletedType = {
    type: Constants.FOLDER_DELETED |
          Constants.FILE_DELETED,
    payload: PayloadDeletedType
};

declare type PayloadDeletedType = {
    currentFolder: FolderType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};

declare type ActionUnionTreeReducerType =
    | ActionInitType
    | ActionFolderOpenedType
    // | ActionDeleteType
    // | ActionDeletedType
    // | ActionFolderAddedType
    // | ActionErrorType
;

declare type ActionUnionType =
    | ActionInitType
    | ActionDeleteType
    | ActionDeletedType
    | ActionFolderOpenedType
    | ActionAddFolderType
    | ActionFolderAddedType
    | ActionErrorType
;

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
};

declare type Actions = $Keys<typeof actions>;
// wip
/*
declare type PayloadType = {
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
