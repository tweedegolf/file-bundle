/* eslint no-undef: 0 */

import * as Constants from '../src/util/constants';

declare type PayloadType = {
    id?: number,
    errors?: Array<ErrorType>,
    foldersById?: Array<number>,
    rootFolderId?: number,
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
    sort?: string,
    errorId?: string,
    imageUrl?: string,
    isAddingFolder?: boolean,
};

// const actionTypes = R.join(R.keys(Constants), '|');
declare type ActionType = {
//    type: actionTypes,
    type: (Constants.INIT |
        Constants.FOLDER_OPENED |
        Constants.FILE_DELETED |
        Constants.FOLDER_DELETED |
        Constants.UPLOAD_DONE |
        Constants.FOLDER_ADDED |
        Constants.FILES_MOVED |
        Constants.FOLDER_OPENED |
        Constants.ERROR_OPENING_FOLDER
    ),
    payload: PayloadType
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
    type: string,
    messages: Array<string>,
};

declare type TreeStateType = {
    currentFolder?: {},
    rootFolderId?: (number | null),
    parentFolder?: ({} | null),
    filesById?: {},
    foldersById?: {},
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

declare type StoreType = {
    tree: TreeStateType,
    ui: UIStateType,
    dispatch: DispatchType,
    getStore: () => StoreType,
};
