/* eslint no-use-before-define: 0 */
import type { Store, Dispatch } from 'redux';

export type TreeType = {
    [id: string]: {
        fileIds: string[],
        folderIds: string[],
    },
};

// state
export type TreeStateType = {
    currentFolderId: null | string,
    rootFolderId: null | string,
    filesById: null | FilesByIdType,
    foldersById: null | FoldersByIdType,
    errors: Array<ErrorType>,
    tree: null | TreeType,
};

export type UIStateType = {
    sort: string,
    ascending: boolean,
    expanded: boolean,
    previewUrl: null | string,
    deleteFileWithId: null | string,
    deleteFolderWithId: null | string,
    renameFolderWithId: null | string,
    hover: null | number,
    errors: Array<ErrorType>,
    loadingFolderWithId: null | string,
    deletingFileWithId: null | string,
    deletingFolderWithId: null | string,
    renamingFolderWithId: null | string,
    isAddingFolder: boolean,
    isUploadingFiles: boolean,
    scrollPosition: null | number,
    selected: string[],
    clipboard: string[],
    language: string,
    multiple: boolean,
    imagesOnly: boolean,
    allowNewFolder: boolean,
    allowUpload: boolean,
    allowDelete: boolean,
    allowEdit: boolean, // rename and cut & paste
    showingRecycleBin: boolean,
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
    fileIds?: string[],
    folderIds?: string[],
    isNew?: boolean,
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
    original: string,
    thumb: null | string,
    isNew?: boolean,
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
    language: string,
    rootFolderId: string,
    selected?: Array<FileType>,
    multiple?: boolean,
    imagesOnly?: boolean,
    allowNewFolder?: boolean,
    allowUpload?: boolean,
    allowDelete?: boolean,
    allowEdit?: boolean, // rename and cut & paste
};

export type SortEnumType = 'name' | 'size_bytes' | 'create_ts';
