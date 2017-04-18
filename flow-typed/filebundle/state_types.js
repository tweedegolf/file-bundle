/* eslint no-use-before-define: 0 */
/* eslint no-undef: 0 */

import type { Store, Dispatch } from 'redux';

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
declare type StoreType<S, A> = Store<S, A>;
declare type DispatchType = Dispatch;
// declare type DispatchType = (action: ActionUnionType) => void;


// data
declare type FoldersByIdType = { [id: number]: FolderType };
declare type FilesByIdType = { [id: number]: FileType };

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

// options passed via HTML element's data-options attribute
declare type OptionsType = {
    rootFolderId: number,
    selected?: Array<FileType>,
    multiple?: boolean,
};
