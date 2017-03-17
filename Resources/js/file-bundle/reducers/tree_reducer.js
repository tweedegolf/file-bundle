import * as ActionTypes from '../util/constants';

/**
 * Initial tree state
 *
 * @type       {Object}
 * @param      {Array}    files           Contains file objects representing all
 *                                        files in the current folder
 * @param      {Array}    folders         Contains folder objects representing all
 *                                        folders in the current folder
 * @param      {Object}   current_folder  Object representing the currently
 *                                        selected (opened) folder
 * @param      {Object}  parent_folder    Object describing the parent folder
 *
 * @see        description of {@link FileDescr File} {@link FolderDescr Folder} in the file ./api.js
 */
export const treeInitialState = {
    files: [],
    folders: [],
  // current_folder: {
  //   id: null,
  //   name: '..',
  //   file_count: 0,
  //   folder_count: 0,
  // },
    current_folder: null,
    parent_folder: null,
};


export function tree(state = treeInitialState, action) {
  /**
   * Contents of a folder has been loaded from the server or from cache
   */
    if (action.type === ActionTypes.FOLDER_OPENED) {
        return {
            ...state,
            current_folder: action.payload.current_folder,
            parent_folder: action.payload.parent_folder,
            files: action.payload.files,
            folders: action.payload.folders,
        };

  /**
   * A file has been deleted from a folder, we need to update the current_folder
   * object and update the files array containing all files in this folder
   */
    } else if (action.type === ActionTypes.FILE_DELETED) {
        return {
            ...state,
            current_folder: {
                ...state.current_folder,
                file_count: action.payload.file_count,
            },
            files: action.payload.files,
        };

  /**
   * An empty folder has been removed from the current folder: current_folder
   * needs to be updated as well as the folders array containing all folders in
   * the current folder
   */
    } else if (action.type === ActionTypes.FOLDER_DELETED) {
        return {
            ...state,
            current_folder: {
                ...state.current_folder,
                folder_count: action.payload.folder_count,
            },
            folders: action.payload.folders,
        };

  /**
   * A newly uploaded file has been added to the current folder: current_folder
   * needs to be updated as well as the files array containing all files in the
   * current folder
   */
    } else if (action.type === ActionTypes.UPLOAD_DONE) {
        return {
            ...state,
            current_folder: {
                ...state.current_folder,
                file_count: action.payload.file_count,
            },
            files: [...state.files, ...action.payload.files],
        };

  /**
   * A new folder has been added to the the current folder: current_folder needs
   * to be updated as well as the folders array containing all folders in the
   * current folder
   */
    } else if (action.type === ActionTypes.FOLDER_ADDED) {
        return {
            ...state,
            current_folder: {
                ...state.current_folder,
                folder_count: action.payload.folder_count,
            },
            folders: [...state.folders, ...action.payload.folders],
        };

  /**
   * Files have been cut and pasted from another location to the current folder
   */
    } else if (action.type === ActionTypes.FILES_MOVED) {
        return {
            ...state,
            current_folder: {
                ...state.current_folder,
                file_count: action.payload.file_count,
            },
      // -> disabled for now: needs rethinking
      // parent_folder: {
      //   ...state.parent_folder,
      //   file_count: action.payload.file_count_parent,
      // },
            files: [...state.files, ...action.payload.files],
        };
    }

    return state;
}
