// @flow
/**
 * @name       ActionConstants
 * @type       {string}
 * @file       constants that describe actions
 */
export const INIT: 'INIT' = 'INIT';

 /**
  * API call: upload files, processed by:
  * - ui reducer
  *
  * @type       {string}
  */
export const UPLOAD_START: 'UPLOAD_START' = 'UPLOAD_START';

/**
 * Server response: files have been uploaded successfully, processed by:
 * - tree reducer
 * - ui reducer
 *
 * @type       {string}
 */
export const UPLOAD_DONE: 'UPLOAD_DONE' = 'UPLOAD_DONE';

/**
 * Server error, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const ERROR_UPLOADING_FILE: 'ERROR_UPLOADING_FILE' = 'ERROR_UPLOADING_FILE';

/**
 * API call: load contents of folder, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const OPEN_FOLDER: 'OPEN_FOLDER' = 'OPEN_FOLDER';

/**
 * Server response: older contents has been loaded, processed by:
 * - ui reducer
 * - tree reducer
 *
 * @type       {string}
 */
export const FOLDER_OPENED: 'FOLDER_OPENED' = 'FOLDER_OPENED';

/**
 * Server error, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const ERROR_OPENING_FOLDER: 'ERROR_OPENING_FOLDER' = 'ERROR_OPENING_FOLDER';

/**
 * API call: delete file, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const DELETE_FILE: 'DELETE_FILE' = 'DELETE_FILE';

/**
 * Server response: file has been deleted, processed by:
 * - ui reducer
 * - tree reducer
 *
 * @type       {string}
 */
export const FILE_DELETED: 'FILE_DELETED' = 'FILE_DELETED';

/**
 * Server error, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const ERROR_DELETING_FILE: 'ERROR_DELETING_FILE' = 'ERROR_DELETING_FILE';

/**
 * API call: delete folder, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const DELETE_FOLDER: 'DELETE_FOLDER' = 'DELETE_FOLDER';

/**
 * Server response: folder has been deleted, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const FOLDER_DELETED: 'FOLDER_DELETED' = 'FOLDER_DELETED';

/**
 * Server error, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const ERROR_DELETING_FOLDER: 'ERROR_DELETING_FOLDER' = 'ERROR_DELETING_FOLDER';

/**
 * API call: add a new folder, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const ADD_FOLDER: 'ADD_FOLDER' = 'ADD_FOLDER';

/**
 * Server response: folder has been added, processed by:
 * - ui reducer
 * - tree reducer
 *
 * @type       {string}
 */
export const FOLDER_ADDED: 'FOLDER_ADDED' = 'FOLDER_ADDED';

/**
 * Server error, handled by:
 * - ui reducer
 *
 * @type       {string}
 */
export const ERROR_ADDING_FOLDER: 'ERROR_ADDING_FOLDER' = 'ERROR_ADDING_FOLDER';

/**
 * User selects file, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const SELECT_FILE: 'SELECT_FILE' = 'SELECT_FILE';

/**
 * Filepicker mode: selected files that are passed via the HTML's dataset
 * property get stored in the state; this happens only once during
 * initialization. Processed by:
 * - tree reducer
 *
 * @type       {string}
 */
// export const SELECT_FILES = 'SELECT_FILES';

/**
 * Selected files are being cut, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const CUT_FILES: 'CUT_FILES' = 'CUT_FILES';

/**
 * Cut and paste action is being cancelled, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const CANCEL_CUT_AND_PASTE_FILES: 'CANCEL_CUT_AND_PASTE_FILES' = 'CANCEL_CUT_AND_PASTE_FILES';

/**
 * API call: files are being moved from one folder to another using
 * cut-and-paste, processed by:
 * - ui reducer
 * - tree reducer
 *
 * @type       {string}
 */
export const FILES_MOVED: 'FILES_MOVED' = 'FILES_MOVED';

/**
 * Server error, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const ERROR_MOVING_FILES: 'ERROR_MOVING_FILES' = 'ERROR_MOVING_FILES';

/**
 * Changes sorting of files and folders in the browser's file list, processed
 * by:
 * - ui reducer
 *
 * @type       {string}
 */
export const CHANGE_SORTING: 'CHANGE_SORTING' = 'CHANGE_SORTING';

/**
 * Remove an error message, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const DISMISS_ERROR: 'DISMISS_ERROR' = 'DISMISS_ERROR';

/**
 * Show a full screen preview of a file, currently only images are supported,
 * processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const SHOW_PREVIEW: 'SHOW_PREVIEW' = 'SHOW_PREVIEW';

/**
 * Toggles the confirmation dialog after the user has clicked the delete
 * button of a file, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const CONFIRM_DELETE_FILE: 'CONFIRM_DELETE_FILE' = 'CONFIRM_DELETE_FILE';

export const CONFIRM_DELETE_FOLDER: 'CONFIRM_DELETE_FOLDER' = 'CONFIRM_DELETE_FOLDER';


/**
 * Expand the browser, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const EXPAND_BROWSER: 'EXPAND_BROWSER' = 'EXPAND_BROWSER';

/**
 * Set hover when using arrow keys to select a file or a folder, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const SET_HOVER: 'SET_HOVER' = 'SET_HOVER';

/**
 * Set the scroll position of the browser list, processed by:
 * - ui reducer
 *
 * @type       {string}
 */
export const SET_SCROLL_POSITION: 'SET_SCROLL_POSITION' = 'SET_SCROLL_POSITION';


export const RENAME_FOLDER: 'RENAME_FOLDER' = 'RENAME_FOLDER';
export const FOLDER_RENAMED: 'FOLDER_RENAMED' = 'FOLDER_RENAMED';
export const ERROR_RENAMING_FOLDER: 'ERROR_RENAMING_FOLDER' = 'ERROR_RENAMING_FOLDER';

