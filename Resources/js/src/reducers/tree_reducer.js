// @flowoff
import * as Constants from '../util/constants';

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
    currentFolder: null,
    rootFolderId: null,
    parentFolder: null,
    filesById: null,
    foldersById: null,
    errors: [],
};

export const tree = (state: TreeStateType = treeInitialState,
    action: ActionUnionTreeReducerType): TreeStateType => {
    if (action.type === 'INIT') {
        return {
            ...state,
            foldersById: action.payload.foldersById,
            rootFolderId: action.payload.rootFolderId,
            foo: action.payload.bar,
        };
    /**
     * Contents of a folder has been loaded from the server or from cache
     */
    } else if (action.type === Constants.FOLDER_OPENED) {
        // console.log(action.payload);
        // return { ...action.payload }
        return {
            ...state,
            filesById: action.payload.filesById,
            parentFolder: action.payload.parentFolder,
            currentFolder: action.payload.currentFolder,
            foldersById: action.payload.foldersById,
        };

    /**
     * A file has been deleted from a folder, we need to update the
     * currentFolder object and update the files array containing all files in
     * this folder
     */
    } else if (action.type === Constants.FILE_DELETED) {
        return {
            ...state,
            filesById: action.payload.filesById,
            foldersById: action.payload.foldersById,
            currentFolder: action.payload.currentFolder,
        };

    /**
     * An empty folder has been removed from the current folder: currentFolder
     * needs to be updated as well as the folders array containing all folders
     * in the current folder
     */
    } else if (action.type === Constants.FOLDER_DELETED) {
        return {
            ...state,
            filesById: action.payload.filesById,
            foldersById: action.payload.foldersById,
            currentFolder: action.payload.currentFolder,
        };

    /**
     * A newly uploaded file has been added to the current folder: currentFolder
     * needs to be updated as well as the files array containing all files in
     * the current folder
     */
    } else if (action.type === Constants.UPLOAD_DONE) {
        return {
            ...state,
            filesById: action.payload.filesById,
            foldersById: action.payload.foldersById,
            currentFolder: action.payload.currentFolder,
            errors: action.payload.errors,
        };

    /**
     * A new folder has been added to the the current folder: currentFolder
     * needs to be updated as well as the folders array containing all folders
     * in the current folder
     */
    } else if (action.type === Constants.FOLDER_ADDED) {
        return {
            ...state,
            currentFolder: action.payload.currentFolder,
            foldersById: action.payload.foldersById,
        };

    /**
     * Files have been cut and pasted from another location to the current
     * folder
     */
    } else if (action.type === Constants.FILES_MOVED) {
        return {
            ...state,
            currentFolder: action.payload.currentFolder,
            foldersById: action.payload.foldersById,
            filesById: action.payload.filesById,
        };
    }

    return state;
};
