/* eslint no-undef: 0 */
import R from 'ramda';
import * as Constants from '../Resources/js/src/util/constants';

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

// used for all errors that are emitted via actions
const errorTypes = R.join(R.filter((key: string) => key.indexOf('ERROR_') === 0, R.keys(Constants)), '|');
declare type ActionErrorType = {
    type: errorTypes;
    payload: PayloadErrorType,
};

declare type PayloadErrorType = {
    errors: Array<ErrorType>,
};

// used when files or folders are in the process of being deleted
declare type ActionDeleteType = {
    type: (Constants.DELETE_FOLDER |
           Constants.CONFIRM_DELETE_FOLDER |
           Constants.FOLDER_DELETED |
           Constants.DELETE_FILE |
           Constants.CONFIRM_DELETE_FILE),
    payload: PayloadDeleteType
};

declare type PayloadDeleteType = {
    id: number | null
};

// used when files or folders are actually deleted
declare type ActionDeletedType = {
    type: (Constants.FOLDER_DELETED |
           Constants.FILE_DELETED),
    payload: PayloadDeletedType
};

declare type PayloadDeletedType = {
    currentFolder: FolderType,
    filesById: { id: FileType },
    foldersById: { id: FolderType },
};

declare type ActionOpenFolderType = {
    type: Constants.OPEN_FOLDER,
    payload: {
        id: number,
    },
};

// used when the contents of a folder has been fetched successfully from the server
// or from localstorage
declare type ActionFolderOpenedType = {
    type: Constants.FOLDER_OPENED,
    payload: PayloadFolderOpenedType,
};

declare type PayloadFolderOpenedType = {
    parentFolder: FolderType | null,
    currentFolder: FolderType,
    foldersById: { id?: FolderType },
    filesById: { id?: FileType },
};

// add folder
declare type ActionAddFolderType = {
    type: Constants.ADD_FOLDER,
    payload: PayloadAddFolderType,
};

declare type PayloadAddFolderType = {
    id: String,
};

// folder added
declare type ActionFolderAddedType = {
    type: Constants.FOLDER_ADDED,
    payload: PayloadFolderAddedType,
};

declare type PayloadFolderAddedType = {
    currentFolder: FolderType,
    foldersById: { id: FolderType },
    errors: Array<ErrorType>,
};

declare type ActionType = (
    ActionDeleteType |
    ActionDeletedType |
    ActionOpenFolderType |
    ActionFolderOpenedType |
    ActionAddFolderType |
    ActionFolderAddedType |
    ActionErrorType
);

declare type FolderType = {
    create_ts?: number,
    created?: string,
    file_count?: number,
    folder_count?: number,
    id: number,
    name: string,
    parent: number,
    type?: string,
    size?: string,
    size_bytes?: number,
    files: Array<FileType>,
    folders: Array<FolderType>,
    isTrashed?: boolean,
};

declare type FileType = {
    create_ts: number,
    created: string,
    id: number,
    name: string,
    original: string,
    thumb: string,
    type: string,
    size: string,
    size_bytes: number,
    isTrashed?: boolean,
};

declare type DispatchType = (action: ActionType) => void;

declare type ErrorType = {
    id: string,
    data?: string,
    type: string,
    messages: Array<string>,
};

declare type TreeStateType = {
    currentFolder: {},
    rootFolderId: number | null,
    parentFolder: {} | null,
    filesById: {
        id?: FileType,
    },
    foldersById: {
        id?: FolderType,
    },
    errors: Array<ErrorType>
};


declare type UIStateType = {
    sort: string,
    ascending: boolean,
    expanded: boolean,
    previewUrl: (string | null),
    deleteFileWithId: (number | null),
    deleteFolderWithId: (number | null),
    hover: number,
    errors: Array<ErrorType>,
    loadingFolderWithId: number,
    deletingFileWithId: (number | null),
    deletingFolderWithId: (number | null),
    isAddingFolder: boolean,
    isUploadingFiles: boolean,
    scrollPosition: (number | null),
    selected: Array<FileType>,
    clipboard: Array<FileType>,
    multiple: boolean,
    imagesOnly: boolean
};

declare type StateType = {
    tree: TreeStateType,
    ui: UIStateType,
};

declare type StoreType = {
    tree: TreeStateType,
    ui: UIStateType,
    dispatch: DispatchType,
    getState: () => StateType,
};
