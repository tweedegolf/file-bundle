// @flow
import { getStore } from '../reducers/store';

export { default as openFolder } from './open_folder';
export { default as openRecycleBin } from './open_recycle_bin';
export { default as closeRecycleBin } from './close_recycle_bin';
export { default as init } from './init';
export { default as getMetaData } from './get_meta_data';
export { default as addFolder } from './add_folder';
export { default as renameFolder } from './rename_folder';
export { default as deleteFile } from './delete_file';
export { default as deleteFolder } from './delete_folder';
export { default as emptyRecycleBin } from './empty_recycle_bin';
export { default as uploadFiles } from './upload_files';
export { default as moveItems } from './move_items';

// START FLOW TYPES

type SortEnumType = 'name' | 'size_bytes' | 'create_ts' | 'type';

type PayloadChangeSortingType = {
    sort: SortEnumType,
};

export type ActionChangeSortingType = {
    type: 'CHANGE_SORTING',
    payload: PayloadChangeSortingType,
};

type PayloadDismissErrorType = {
    id: string,
};

export type ActionDismissErrorType = {
    type: 'DISMISS_ERROR',
    payload: PayloadDismissErrorType,
};

export type ActionWithPayloadIdType = {
    type: 'SELECT_FILE'
    | 'SELECT_FOLDER'
    | 'DISMISS_ERROR',
    payload: {
        id: string
    }
};

// END FLOW TYPES

const getDispatch = (storeId: string): DispatchType => {
    const store = getStore(storeId);
    if (typeof store === 'undefined') {
        console.error('this should not happen!');
        return () => { };
    }
    return store.dispatch;
};

export const selectFile = (storeId: string, id: string) => {
    const a: ActionWithPayloadIdType = {
        type: 'SELECT_FILE',
        payload: { id },
    };
    getDispatch(storeId)(a);
};

export const selectFolder = (storeId: string, id: string) => {
    const a: ActionWithPayloadIdType = {
        type: 'SELECT_FOLDER',
        payload: { id },
    };
    getDispatch(storeId)(a);
};

/**
 * Cut files, i.e. move the currently selected files to the clipboard
 */
export const cutFiles = (storeId: string) => {
    getDispatch(storeId)({
        type: 'CUT_ITEMS',
    });
};

/**
 * Move files in clipboard array back to the selected array
 */
export const cancelMoveItems = (storeId: string) => {
    getDispatch(storeId)({
        type: 'CANCEL_MOVE_ITEMS',
    });
};

/**
 * Changes the sorting column or sorting order of the items in the browser list
 *
 * @param      {string}  sort    The sorting column; if this is the same as
 *                               current sorting column, the sorting order will
 *                               be reversed.
 */
export const changeSorting = (storeId: string, sort: string) => {
    getDispatch(storeId)({
        type: 'CHANGE_SORTING',
        payload: { sort },
    });
};


/**
 * Dismiss an error popup.
 *
 * @param      {number}  error_id  The unique identifier of the error.
 */
export const dismissError = (storeId: string, id: string) => {
    const a: ActionWithPayloadIdType = {
        type: 'DISMISS_ERROR',
        payload: { id },
    };
    getDispatch(storeId)(a);
};


/**
 * Shows a preview of a file, currently only images are supported.
 *
 * @param      {string}  image_url  The url of the full size image.
 */
export const showPreview = (storeId: string, imageUrl: null | string) => {
    getDispatch(storeId)({
        type: 'SHOW_PREVIEW',
        payload: { imageUrl },
    });
};


/**
 * User has clicked on the delete button of a file; this triggers a confirmation
 * popup. The file will only be deleted after the user's confirmation.
 *
 * @param      {number}  id      The id of the file will be deleted after
 *                               confirmation
 */
export const confirmDeleteFile = (storeId: string, id: null | string) => {
    getDispatch(storeId)({
        type: 'CONFIRM_DELETE_FILE',
        payload: { id },
    });
};

export const confirmDeleteFolder = (storeId: string, id: null | string) => {
    getDispatch(storeId)({
        type: 'CONFIRM_DELETE_FOLDER',
        payload: { id },
    });
};

export const confirmRenameFolder = (storeId: string, id: null | string) => {
    getDispatch(storeId)({
        type: 'CONFIRM_RENAME_FOLDER',
        payload: { id },
    });
};


/**
 * User selects a file by using the arrow keys of the keyboard.
 *
 * @param      {number}  diff    Value is -1 if user has clicked the arrow down
 *                               key and +1 if the arrow up key has been
 *                               pressed.
 * @param      {number}  max     The number of items in this folder. The number
 *                               of items is used to determine if we need to
 *                               wrap around the selection, e.g. if the current
 *                               selection is the last item in the list, and the
 *                               user has pressed the arrow down button, the
 *                               selection will wrap around resulting in the
 *                               first item in the list being selected.
 */
export const setHover = (storeId: string, diff: number, max: number) => {
    getDispatch(storeId)({
        type: 'SET_HOVER',
        payload: { diff, max },
    });
};


/**
 * Sets the scroll position of the browser list
 *
 * @param      {number}  scroll  The position of the list in pixels measured
 *                               from the top.
 */
export const setScrollPosition = (storeId: string, scroll: null | number) => {
    getDispatch(storeId)({
        type: 'SET_SCROLL_POSITION',
        payload: { scroll },
    });
};


/**
 * In Filepicker mode the user sees a button to expand and collapse the browser.
 * In Browser mode the browser is always expanded.
 */
export const expandBrowser = (storeId: string) => {
    getDispatch(storeId)({
        type: 'EXPAND_BROWSER',
    });
};
