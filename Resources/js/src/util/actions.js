import R from 'ramda';

type ActionStringsType =
    | 'INIT'
    | 'UPLOAD_START'
    | 'UPLOAD_DONE'
    | 'ERROR_UPLOADING_FILE'
    | 'OPEN_FOLDER'
    | 'FOLDER_OPENED'
    | 'ERROR_OPENING_FOLDER'
    | 'DELETE_FILE'
    | 'FILE_DELETED'
    | 'ERROR_DELETING_FILE'
    | 'DELETE_FOLDER'
    | 'FOLDER_DELETED'
    | 'ERROR_DELETING_FOLDER'
    | 'ADD_FOLDER'
    | 'FOLDER_ADDED'
    | 'ERROR_ADDING_FOLDER'
    | 'SELECT_FILE'
    | 'CUT_FILES'
    | 'CANCEL_CUT_AND_PASTE_FILES'
    | 'FILES_MOVED'
    | 'ERROR_MOVING_FILES'
    | 'CHANGE_SORTING'
    | 'DISMISS_ERROR'
    | 'SHOW_PREVIEW'
    | 'CONFIRM_DELETE_FILE'
    | 'CONFIRM_DELETE_FOLDER'
    | 'EXPAND_BROWSER'
    | 'SET_HOVER'
    | 'SET_SCROLL_POSITION'
;

const actions: {[key: ActionStringsType]: ActionStringsType} = {
    INIT: 'INIT',
    UPLOAD_START: 'UPLOAD_START',
    UPLOAD_DONE: 'UPLOAD_DONE',
    ERROR_UPLOADING_FILE: 'ERROR_UPLOADING_FILE',
    OPEN_FOLDER: 'OPEN_FOLDER',
    FOLDER_OPENED: 'FOLDER_OPENED',
    ERROR_OPENING_FOLDER: 'ERROR_OPENING_FOLDER',
    DELETE_FILE: 'DELETE_FILE',
    FILE_DELETED: 'FILE_DELETED',
    ERROR_DELETING_FILE: 'ERROR_DELETING_FILE',
    DELETE_FOLDER: 'DELETE_FOLDER',
    FOLDER_DELETED: 'FOLDER_DELETED',
    ERROR_DELETING_FOLDER: 'ERROR_DELETING_FOLDER',
    ADD_FOLDER: 'ADD_FOLDER',
    FOLDER_ADDED: 'FOLDER_ADDED',
    ERROR_ADDING_FOLDER: 'ERROR_ADDING_FOLDER',
    SELECT_FILE: 'SELECT_FILE',
    CUT_FILES: 'CUT_FILES',
    CANCEL_CUT_AND_PASTE_FILES: 'CANCEL_CUT_AND_PASTE_FILES',
    FILES_MOVED: 'FILES_MOVED',
    ERROR_MOVING_FILES: 'ERROR_MOVING_FILES',
    CHANGE_SORTING: 'CHANGE_SORTING',
    DISMISS_ERROR: 'DISMISS_ERROR',
    SHOW_PREVIEW: 'SHOW_PREVIEW',
    CONFIRM_DELETE_FILE: 'CONFIRM_DELETE_FILE',
    CONFIRM_DELETE_FOLDER: 'CONFIRM_DELETE_FOLDER',
    EXPAND_BROWSER: 'EXPAND_BROWSER',
    SET_HOVER: 'SET_HOVER',
    SET_SCROLL_POSITION: 'SET_SCROLL_POSITION',
};

export default actions;
