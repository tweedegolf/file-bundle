/* eslint no-use-before-define: 0 */
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

// state
export type TreeStateType = {
    filesById: {} | FilesByIdType,
    foldersById: {} | FoldersByIdType,
    errors: Array<ErrorType>,
    tree: {} | TreeType,
    recycleBin: {} | {
        files: FileType[],
        folders: FolderType[],
    },
};

export type UIStateType = {
    rootFolderId: string,
    currentFolderId: string,
    currentFolderIdTmp: null | string,
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

export type ItemType = FolderType | FileType;

export type ErrorType = {
    id: string,
    data?: {[string]: string},
    type: string,
    messages: Array<string>,
};


// options passed via HTML element's data-options attribute
export type OptionsType = {
    language: string,
    rootFolderId: string,
    selected: FileType[],
    multiple: boolean,
    imagesOnly: boolean,
    allowNewFolder: boolean,
    allowUpload: boolean,
    allowDelete: boolean,
    allowEdit: boolean, // rename and cut & paste
};

export type SortEnumType = 'name' | 'size_bytes' | 'create_ts' | 'type';
