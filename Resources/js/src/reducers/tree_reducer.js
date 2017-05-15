// @flow
// import * as Constants from '../util/constants';

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

export const treeInitialState: TreeStateType = {
    currentFolderId: '-1',
    rootFolderId: '-1',
    filesById: null,
    foldersById: null,
    errors: [],
};

export const tree = (state: TreeStateType = treeInitialState,
    action: ActionUnionType): TreeStateType => {
    switch (action.type) {
    case 'INIT':
        return {
            ...state,
            filesById: action.payload.filesById,
            foldersById: action.payload.foldersById,
            rootFolderId: action.payload.rootFolderId,
        };

    case 'OPEN_FOLDER':
        return {
            ...state,
            currentFolderId: action.payload.id,
        };
    /**
     * Contents of a folder has been loaded from the server or from cache
     */
    case 'FOLDER_OPENED':
        return {
            ...state,
            filesById: action.payload.filesById,
            foldersById: action.payload.foldersById,
        };

    /**
     * A file has been deleted from a folder, we need to update the
     * currentFolder object and update the files array containing all files in
     * this folder
     */
    case 'FILE_DELETED':
        return {
            ...state,
            filesById: action.payload.filesById,
            foldersById: action.payload.foldersById,
        };

    /**
     * An empty folder has been removed from the current folder: currentFolder
     * needs to be updated as well as the folders array containing all folders
     * in the current folder
     */
    case 'FOLDER_DELETED':
        return {
            ...state,
            filesById: action.payload.filesById,
            foldersById: action.payload.foldersById,
        };

    case 'FOLDER_RENAMED':
        return {
            ...state,
            foldersById: action.payload.foldersById,
        };

    /**
     * A newly uploaded file has been added to the current folder: currentFolder
     * needs to be updated as well as the files array containing all files in
     * the current folder
     */
    case 'UPLOAD_DONE':
        return {
            ...state,
            filesById: action.payload.filesById,
            foldersById: action.payload.foldersById,
            errors: action.payload.errors,
        };

    /**
     * A new folder has been added to the the current folder: currentFolder
     * needs to be updated as well as the folders array containing all folders
     * in the current folder
     */
    case 'FOLDER_ADDED':
        return {
            ...state,
            foldersById: action.payload.foldersById,
        };

    /**
     * Files have been cut and pasted from another location to the current
     * folder
     */
    case 'FILES_MOVED':
        return {
            ...state,
            foldersById: action.payload.foldersById,
            filesById: action.payload.filesById,
        };

    default:
        return state;
    }
};
