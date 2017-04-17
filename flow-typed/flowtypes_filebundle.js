/* eslint no-undef: 0 */
import R from 'ramda';
import type { Dispatch } from 'redux';
// import * as Constants from '../Resources/js/src/util/constants';
import actions from '../Resources/js/src/util/actions';
import {
    INIT,
    UPLOAD_START,
    UPLOAD_DONE,
    ERROR_UPLOADING_FILE,
    OPEN_FOLDER,
    FOLDER_OPENED,
    ERROR_OPENING_FOLDER,
    DELETE_FILE,
    FILE_DELETED,
    ERROR_DELETING_FILE,
    DELETE_FOLDER,
    FOLDER_DELETED,
    ERROR_DELETING_FOLDER,
    ADD_FOLDER,
    FOLDER_ADDED,
    ERROR_ADDING_FOLDER,
    SELECT_FILE,
    CUT_FILES,
    CANCEL_CUT_AND_PASTE_FILES,
    FILES_MOVED,
    ERROR_MOVING_FILES,
    CHANGE_SORTING,
    DISMISS_ERROR,
    SHOW_PREVIEW,
    CONFIRM_DELETE_FILE,
    CONFIRM_DELETE_FOLDER,
    EXPAND_BROWSER,
    SET_HOVER,
    SET_SCROLL_POSITION,
} from '../Resources/js/src/util/constants';

// options passed via HTML element's data-options attribute
declare type OptionsType = {
    rootFolderId: number,
    selected?: Array<FileType>,
    multiple?: boolean,
};

// init
declare type ActionInitType = {
    // type: typeof Constants.INIT,
    type: INIT,
    payload: PayloadInitType,
};

declare type PayloadInitType = {
    selected: Array<FileType>,
    rootFolderId: number,
    foldersById : FoldersByIdType,
};

// open folder
declare type ActionOpenFolderType = {
    // type: Constants.OPEN_FOLDER,
    type: OPEN_FOLDER,
    payload: {
        id: number,
    },
};

declare type ActionFolderOpenedType = {
    // type: Constants.FOLDER_OPENED,
    type: FOLDER_OPENED,
    // type: 'FOLDER_OPENED',
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
    type: ADD_FOLDER,
};

declare type ActionFolderAddedType = {
    type: FOLDER_ADDED,
    payload: PayloadFolderAddedType,
};

declare type PayloadFolderAddedType = {
    currentFolder: FolderType,
    foldersById: FoldersByIdType,
    errors: Array<ErrorType>,
};


// errors
// const errorTypes = R.join(R.filter((key: string) => key.indexOf('ERROR_') === 0, R.keys(Constants)), '|');
type errorTypes = [ERROR_MOVING_FILES, ERROR_DELETING_FILE, ERROR_ADDING_FOLDER, ERROR_UPLOADING_FILE,
    ERROR_OPENING_FOLDER, ERROR_DELETING_FOLDER]
declare type ActionErrorType = {
    type: errorTypes;
    payload: PayloadErrorType,
};

declare type PayloadErrorType = {
    errors: Array<ErrorType>,
};

// initiate delete file or folder
declare type ActionDeleteType = {
    type: DELETE_FOLDER |
          CONFIRM_DELETE_FOLDER |
          FOLDER_DELETED |
          DELETE_FILE |
          CONFIRM_DELETE_FILE,
    payload: PayloadDeleteType
};

declare type PayloadDeleteType = {
    id: number | null
};


// file or folder deleted
declare type ActionDeletedType = {
    type: FOLDER_DELETED |
          FILE_DELETED,
    payload: PayloadDeletedType
};

declare type PayloadDeletedType = {
    currentFolder: FolderType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};

declare type FolderType = {
    id: number,
    name: string,
    create_ts?: number,
    created?: string,
    file_count?: number,
    folder_count?: number,
    parent: null | number,
    type?: string,
    size?: string,
    size_bytes?: number,
    files?: Array<FileType>,
    folders?: Array<FolderType>,
    isTrashed?: boolean,
};

declare type FileType = {
    create_ts: number,
    created: string,
    id: number,
    name: string,
    type: string,
    size: string,
    size_bytes: number,
    original?: string,
    thumb?: string,
    isTrashed?: boolean,
};

declare type ErrorType = {
    id: string,
    data?: string,
    type: string,
    messages: Array<string>,
};


// state
declare type TreeStateType = {
    currentFolder: FolderType,
    rootFolderId: number,
    parentFolder: null | FolderType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
    errors: Array<ErrorType>
};

declare type UIStateType = {
    sort: string,
    ascending: boolean,
    expanded: boolean,
    previewUrl: string | null,
    deleteFileWithId: number | null,
    deleteFolderWithId: number | null,
    hover: number,
    errors: Array<ErrorType>,
    loadingFolderWithId: number,
    deletingFileWithId: number | null,
    deletingFolderWithId: number | null,
    isAddingFolder: boolean,
    isUploadingFiles: boolean,
    scrollPosition: number | null,
    selected: Array<FileType>,
    clipboard: Array<FileType>,
    multiple: boolean,
    imagesOnly: boolean
};

declare type StateType = {
    tree: TreeStateType,
    ui: UIStateType,
};

// redux
// declare type StoreType = {
//     tree: TreeStateType,
//     ui: UIStateType,
//     dispatch: DispatchType,
//     getState: () => StateType,
// };
// redux
declare type StoreType<StateType, ActionUnionType> = {
    dispatch: DispatchType,
    getState(): StateType,
};

declare type ActionUnionTreeReducerType =
    | ActionInitType
    // | ActionFolderOpenedType
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

// declare type DispatchType = (action: ActionUnionType) => void;
declare type DispatchType = Dispatch;

declare type FoldersByIdType = { [id: number]: FolderType };
declare type FilesByIdType = { [id: number]: FileType };


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
