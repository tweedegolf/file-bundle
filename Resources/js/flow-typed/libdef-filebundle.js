/* eslint no-undef: 0 */

import * as Constants from '../src/util/constants';

declare type PayloadType = {
    id?: number,
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
    errorId?: string,
    imageUrl?: string,
    parentFolder?: FolderType | null,
    currentFolder?: FolderType,
    foldersById?: {
        id?: FolderType,
    },
    filesById?: {
        id?: FileType,
    },
    errors?: Array<{
        id: string,
        data: string,
        type: Constants.ERROR_OPENING_FOLDER,
        messages: Array<string>,
    }>
};

declare type FolderAddedPayloadType = {
    isAddingFolder: boolean,
    errors: Array<ErrorType>,
};

declare type DeleteFilePayloadType = {
    deleteFileWithId: number | null
};

declare type DeleteFolderPayloadType = {
    deleteFolderWithId: number | null
};

declare type ChangeSortingPayloadType = {
    sort: string
};

const actionTypes = R.join(R.keys(Constants), '|');
declare type ActionType = {
    type: actionTypes,
    payload: (
        PayloadType |
        PayloadFolderAddedType |
        ChangeSortingPayloadType |
        DeleteFilePayloadType |
        DeleteFolderPayloadType |
        null
    ),
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
