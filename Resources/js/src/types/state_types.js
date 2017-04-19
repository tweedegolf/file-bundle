/* eslint no-use-before-define: 0 */
import type { Store, Dispatch } from 'redux';

// state
export type TreeStateType = {
    currentFolder: FolderType,
    rootFolderId: number,
    parentFolder: null | FolderType,
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
    errors: Array<ErrorType>
};

export type UIStateType = {
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

export type StateType = {
    tree: TreeStateType,
    ui: UIStateType,
};


// redux
export type StoreType<S, A> = Store<S, A>;
// export type DispatchType = (action: ActionUnionType) => void;
export type DispatchType = Dispatch;


// data
export type FoldersByIdType = { [id: number]: FolderType };
export type FilesByIdType = { [id: number]: FileType };

export type FolderType = {
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

export type FileType = {
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

export type ErrorType = {
    id: string,
    data?: string,
    type: string,
    messages: Array<string>,
};

// options passed via HTML element's data-options attribute
export type OptionsType = {
    rootFolderId: number,
    selected?: Array<FileType>,
    multiple?: boolean,
};

export type SortEnumType = 'name' | 'size_bytes' | 'create_ts';
