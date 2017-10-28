// @flow
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

import type { ActionInitType } from '../actions/init';
import type { ActionMetaDataReceivedType } from '../actions/get_meta_data';
import type { ActionFileDeletedType } from '../actions/delete_file';
import type { ActionFolderAddedType } from '../actions/add_folder';
import type { ActionFolderDeletedType } from '../actions/delete_folder';
import type { ActionFolderOpenedType, ActionFolderFromCacheType } from '../actions/open_folder';
import type { ActionFolderRenamedType } from '../actions/rename_folder';
import type { ActionRecycleBinEmptiedType } from '../actions/empty_recycle_bin';
import type { ActionRecycleBinOpenedType, ActionRecycleBinFromCacheType } from '../actions/open_recycle_bin';
import type { ActionItemsMovedType } from '../actions/move_items';

type ActionUnionType =
    | ActionInitType
    | ActionFolderOpenedType
    | ActionFolderFromCacheType
    | ActionFolderRenamedType
    | ActionFolderAddedType
    | ActionFolderDeletedType
    | ActionFileDeletedType
    | ActionMetaDataReceivedType
    | ActionRecycleBinOpenedType
    | ActionRecycleBinFromCacheType
    | ActionRecycleBinEmptiedType
    | ActionItemsMovedType
    ;

export const treeInitialState: TreeStateType = {
    filesById: {},
    foldersById: {},
    errors: [],
    tree: {},
    recycleBin: {
        files: [],
        folders: [],
    },
};

export const tree = (
    state: TreeStateType = treeInitialState,
    action: ActionUnionType,
): TreeStateType => {
    // let type = action.type;
    // if (type.indexOf('@@redux') === -1) {
    //     type = type.substring(type.indexOf('/') + 1);
    // }
    switch (action.type) {
        case 'INIT':
            return {
                ...state,
                filesById: action.payload.filesById,
                foldersById: action.payload.foldersById,
            };

        case 'META_DATA_RECEIVED':
            return {
                ...state,
                filesById: action.payload.filesById,
                foldersById: action.payload.foldersById,
            };

        /**
         * Contents of a folder has been loaded from the server or from cache
         */
        case 'FOLDER_OPENED':
            // console.log(R.clone(action.payload.foldersById));
            return {
                ...state,
                tree: action.payload.tree,
                filesById: action.payload.filesById,
                foldersById: action.payload.foldersById,
            };

        case 'RECYCLE_BIN_FROM_CACHE':
        case 'RECYCLE_BIN_OPENED':
            return {
                ...state,
                recycleBin: action.payload.recycleBin,
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
                recycleBin: action.payload.recycleBin,
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
                recycleBin: action.payload.recycleBin,
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
                foldersById: action.payload.foldersById,
                filesById: action.payload.filesById,
                errors: action.payload.errors,
                tree: action.payload.tree,
            };

        /**
         * A new folder has been added to the the current folder: currentFolder
         * needs to be updated as well as the folders array containing all folders
         * in the current folder
         */
        case 'FOLDER_ADDED':
            return {
                ...state,
                tree: action.payload.tree,
                foldersById: action.payload.foldersById,
            };

        /**
         * Files have been cut and pasted from another location to the current
         * folder
         */
        case 'ITEMS_MOVED':
            return {
                ...state,
                foldersById: action.payload.foldersById,
                filesById: action.payload.filesById,
                tree: action.payload.tree,
            };

        case 'RECYCLE_BIN_EMPTIED':
            return {
                ...state,
                tree: action.payload.tree,
                filesById: action.payload.filesById,
                recycleBin: action.payload.recycleBin,
                foldersById: action.payload.foldersById,
            };

        // case 'RESTORED_FROM_RECYCLE_BIN':
        //     return {
        //         ...state,
        //         filesById: action.payload.filesById,
        //         foldersById: action.payload.foldersById,
        //     };

        default:
            return state;
    }
};
