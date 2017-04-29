/* eslint no-use-before-define: 0 */
import type { Store, Dispatch } from 'redux';

// state
export type TreeStateType = {
    currentFolder: null | FolderType,
    rootFolderId: string,
    parentFolder: null | FolderType,
    filesById: null | FilesByIdType,
    foldersById: null | FoldersByIdType,
    errors: Array<ErrorType>,
};

export type UIStateType = {
    sort: string,
    ascending: boolean,
    expanded: boolean,
    previewUrl: null | string,
    deleteFileWithId: null | string,
    deleteFolderWithId: null | string,
    hover: null | number,
    errors: Array<ErrorType>,
    loadingFolderWithId: null | string,
    deletingFileWithId: null | string,
    deletingFolderWithId: null | string,
    isAddingFolder: boolean,
    isUploadingFiles: boolean,
    scrollPosition: null | number,
    selected: Array<FileType>,
    clipboard: Array<FileType>,
    multiple: boolean,
    imagesOnly: boolean
};

export type StateType = {
    tree: TreeStateType,
    ui: UIStateType,
};


// redux
export type StoreType<S, A> = Store<S, A>;
// export type DispatchType = (action: ActionUnionType) => void;
export type DispatchType = Dispatch;


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
    files?: Array<FileType>,
    folders?: Array<FolderType>,
    isTrashed?: boolean,
};

export type FileType = {
    id: string,
    name: string,
    create_ts: number,
    created: string,
    type: string,
    size: string,
    size_bytes: number,
    original?: string,
    thumb?: string,
    isTrashed?: boolean,
};

export type ErrorType = {
    id: string,
    data?: string,
    type: string,
    messages: Array<string>,
};

// options passed via HTML element's data-options attribute
export type OptionsType = {
    rootFolderId: string,
    selected?: Array<FileType>,
    multiple?: boolean,
};

export type SortEnumType = 'name' | 'size_bytes' | 'create_ts';
