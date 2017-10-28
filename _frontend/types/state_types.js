/* eslint no-use-before-define: 0 */
/* eslint-disable */

import type { Store, Dispatch } from 'redux';

// redux
export type StoreType<S, A> = Store<S, A>;
// export type DispatchType = (action: ActionUnionType) => void;
export type DispatchType = Dispatch;


export type TreeFolderType = {
    fileIds: string[],
    folderIds: string[],
};

export type TreeType = {
    [id: string]: TreeFolderType,
};

export type ClipboardType = {
    fileIds: string[],
    folderIds: string[],
};

export type RecycleBinType = {
    files: FileType[],
    folders: FolderType[],
};

// state
export type TreeStateType = {
    filesById: {} | FilesByIdType,
    foldersById: {} | FoldersByIdType,
    errors: ErrorType[],
    tree: {} | TreeType,
    recycleBin: RecycleBinType,
};

export type UIStateType = {
    browser: boolean,
    rootFolderId: string,
    currentFolderId: string,
    currentFolderIdTmp: string,
    sort: string,
    ascending: boolean,
    expanded: boolean,
    previewUrl: null | string,
    deleteFileWithId: null | string,
    deleteFolderWithId: null | string,
    renameFolderWithId: null | string,
    hover: number,
    errors: ErrorType[],
    loadingFolderWithId: null | string,
    deletingFileWithId: null | string,
    deletingFolderWithId: null | string,
    renamingFolderWithId: null | string,
    isAddingFolder: boolean,
    isUploadingFiles: boolean,
    scrollPosition: null | number,
    selected: ClipboardType,
    clipboard: ClipboardType,
    language: string,
    permissions: PermissionsType,
    showingRecycleBin: boolean,
};

export type StateType = {
    tree: TreeStateType,
    ui: UIStateType,
};

export type State2Type = {
    [id: string]: StateType,
};

// data
export type FoldersByIdType = { [id: string]: FolderType };
export type FilesByIdType = { [id: string]: FileType };

export type FolderType = {
    id: string,
    name: string,
    create_ts?: number,
    created?: string,
    file_count?: number,
    folder_count?: number,
    parent: null | string,
    type?: string,
    size?: string,
    size_bytes?: number,
    is_new?: boolean,
    is_trashed?: boolean,
};

export type FileType = {
    id: string,
    name: string,
    create_ts: number,
    created: string,
    type: string,
    size: string,
    size_bytes: number,
    original: string,
    thumb: null | string,
    is_new?: boolean,
    is_trashed?: boolean,
};

export type ItemType = FolderType | FileType;

export type ErrorType = {
    id: string,
    data?: { [string]: string },
    type: string,
    messages: Array<string>,
};

export type ReduxThunkType = (dispatch: DispatchType, getState: () => StateType) => void;
