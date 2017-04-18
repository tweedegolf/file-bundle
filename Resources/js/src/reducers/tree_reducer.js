// @flow
import * as Constants from '../util/constants';
// import actions from '../util/actions';

/**
 * Initial tree state
 *
 * @type       {Object}
 * @param      {Array}   files          Contains file objects representing all
 *                                      files in the current folder
 * @param      {Array}   folders        Contains folder objects representing all
 *                                      folders in the current folder
 * @param      {Object}  currentFolder  Object representing the currently selected
 *                                      (opened) folder
 * @param      {Object}  parentFolder   Object describing the parent folder
 *
 * @see        description of {@link FileDescr File} {@link FolderDescr Folder} in the file ./api.js
 */
const fakeFolder: FolderType = {
    id: -1,
    name: 'fake',
    files_count: 0,
    folders_count: 0,
    parent: null,
};
const fakeFile: FileType = {
    id: -1,
    name: 'fake',
    create_ts: new Date().getTime(),
    created: new Date().toDateString(),
    type: 'fake',
    size: '0 kB',
    size_bytes: 0,
};

export const treeInitialState: TreeStateType = {
    currentFolder: fakeFolder,
    rootFolderId: -1,
    parentFolder: null,
    filesById: { [fakeFile.id]: fakeFile },
    foldersById: { [fakeFolder.id]: fakeFolder },
    errors: [],
};

export const tree = (state: TreeStateType = treeInitialState,
    action: ActionUnionTreeReducerType): TreeStateType => {
    if (action.type === Constants.INIT) {
        // necessary because flow has issues with constants in disjoint unions:
        const a: ActionInitType = action;
        const p: PayloadInitType = a.payload;
        return {
            ...state,
            // foldersById: a.payload.foldersById,
            // rootFolderId: a.payload.rootFolderId,
            foldersById: p.foldersById,
            rootFolderId: p.rootFolderId,
        };
    /**
     * Contents of a folder has been loaded from the server or from cache
     */
    } else if (action.type === Constants.FOLDER_OPENED) {
        const a: ActionFolderOpenedType = action;
        return {
            ...state,
            filesById: a.payload.filesById,
            parentFolder: a.payload.parentFolder,
            currentFolder: a.payload.currentFolder,
            foldersById: a.payload.foldersById,
        };

    /**
     * A file has been deleted from a folder, we need to update the
     * currentFolder object and update the files array containing all files in
     * this folder
     */
    } else if (action.type === Constants.FILE_DELETED) {
        const a: ActionDeletedType = action;
        return {
            ...state,
            filesById: a.payload.filesById,
            foldersById: a.payload.foldersById,
            currentFolder: a.payload.currentFolder,
        };

    /**
     * An empty folder has been removed from the current folder: currentFolder
     * needs to be updated as well as the folders array containing all folders
     * in the current folder
     */
    } else if (action.type === Constants.FOLDER_DELETED) {
        const a: ActionDeletedType = action;
        return {
            ...state,
            filesById: a.payload.filesById,
            foldersById: a.payload.foldersById,
            currentFolder: a.payload.currentFolder,
        };

    /**
     * A newly uploaded file has been added to the current folder: currentFolder
     * needs to be updated as well as the files array containing all files in
     * the current folder
     */
    } else if (action.type === Constants.UPLOAD_DONE) {
        const a: ActionUploadDoneType = action;
        const p: PayloadUploadDoneType = a.payload;
        return {
            ...state,
            filesById: p.filesById,
            foldersById: p.foldersById,
            currentFolder: p.currentFolder,
            errors: p.errors,
        };

    /**
     * A new folder has been added to the the current folder: currentFolder
     * needs to be updated as well as the folders array containing all folders
     * in the current folder
     */
    } else if (action.type === Constants.FOLDER_ADDED) {
        const a: ActionFolderAddedType = action;
        return {
            ...state,
            currentFolder: a.payload.currentFolder,
            foldersById: a.payload.foldersById,
        };

    /**
     * Files have been cut and pasted from another location to the current
     * folder
     */
    } else if (action.type === Constants.FILES_MOVED) {
        const a: ActionFilesMovedType = action;
        return {
            ...state,
            currentFolder: a.payload.currentFolder,
            foldersById: a.payload.foldersById,
            filesById: a.payload.filesById,
        };
    }

    return state;
};
