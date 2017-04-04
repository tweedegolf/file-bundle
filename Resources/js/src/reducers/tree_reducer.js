import R from 'ramda';
import * as ActionTypes from '../util/constants';

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
export const treeInitialState = {
    currentFolder: {},
    rootFolderId: null,
    parentFolder: null,
    filesById: {},
    foldersById: {},
    errors: [],
};


export function tree(state = treeInitialState, action) {
    if (action.type === ActionTypes.INIT) {
        return {
            ...state,
            rootFolderId: action.payload.rootFolderId,
            foldersById: action.payload.foldersById,
        };
    /**
     * Contents of a folder has been loaded from the server or from cache
     */
    } else if (action.type === ActionTypes.FOLDER_OPENED) {
        // console.log(action.payload);
        // return { ...action.payload }
        return {
            ...state,
            currentFolder: action.payload.currentFolder,
            parentFolder: action.payload.parentFolder,
            filesById: action.payload.filesById,
            foldersById: action.payload.foldersById,
        };

    /**
     * A file has been deleted from a folder, we need to update the
     * currentFolder object and update the files array containing all files in
     * this folder
     */
    } else if (action.type === ActionTypes.FILE_DELETED) {
        return {
            ...state,
            currentFolder: action.payload.currentFolder,
            rootFolder: action.payload.rootFolder,
            errors: action.payload.errors,
        };

    /**
     * An empty folder has been removed from the current folder: currentFolder
     * needs to be updated as well as the folders array containing all folders
     * in the current folder
     */
    } else if (action.type === ActionTypes.FOLDER_DELETED) {
        return {
            ...state,
            currentFolder: action.payload.currentFolder,
            rootFolder: action.payload.rootFolder,
        };

    /**
     * A newly uploaded file has been added to the current folder: currentFolder
     * needs to be updated as well as the files array containing all files in
     * the current folder
     */
    } else if (action.type === ActionTypes.UPLOAD_DONE) {
        return {
            ...state,
            currentFolder: action.payload.currentFolder,
            rootFolder: action.payload.rootFolder,
            errors: action.payload.errors,
        };

    /**
     * A new folder has been added to the the current folder: currentFolder
     * needs to be updated as well as the folders array containing all folders
     * in the current folder
     */
    } else if (action.type === ActionTypes.FOLDER_ADDED) {
        return {
            ...state,
            currentFolder: action.payload.currentFolder,
            rootFolder: action.payload.rootFolder,
        };

    /**
     * Files have been cut and pasted from another location to the current
     * folder
     */
    } else if (action.type === ActionTypes.FILES_MOVED) {
        return {
            ...state,
            currentFolder: action.payload.currentFolder,
            parentFolder: action.payload.parentFolder,
            rootFolder: action.payload.rootFolder,
        };
    }

    return state;
}
