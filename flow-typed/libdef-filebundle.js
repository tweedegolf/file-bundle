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

declare type PayloadErrorType = {
    errors: Array<ErrorType>,
};

declare type PayloadDeleteType = {
    id: number | null
};

declare type PayloadOpenFolderType = {
    parentFolder: FolderType | null,
    currentFolder: FolderType,
    foldersById: { id?: FolderType },
    filesById: { id?: FileType },
};

declare type PayloadAddFolderType = {
    currentFolder: FolderType,
    foldersById: { id: FolderType },
    errors: Array<ErrorType>,
};

declare type PayloadFolderAddedType = {
    isAddingFolder: boolean,
    errors: Array<ErrorType>,
};

declare type PayloadDeleteFileType = {
    currentFolder: FolderType,
    filesById: { id: FileType },
    foldersById: { id: FolderType },
};

declare type ChangeSortingPayloadType = {
    sort: string
};

const errorTypes = R.join(R.filter((key: string) => key.indexOf('ERROR_') === 0, R.keys(Constants)), '|');
declare type ActionErrorType = {
    type: errorTypes;
    payload: PayloadErrorType,
};

declare type ActionType = (
    ActionDeleteType |
    ActionErrorType
);

declare type ActionDeleteType = {
    type: (Constants.DELETE_FOLDER |
           Constants.CONFIRM_DELETE_FOLDER |
           Constants.FOLDER_DELETED |
           Constants.DELETE_FILE |
           Constants.CONFIRM_DELETE_FILE |
           Constants.FILE_DELETED),
    payload: PayloadDeleteType
};

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
