// @flow
import * as Constants from '../util/constants';
import { getStore } from '../reducers/store';
import openFolder from './open_folder';
import pasteFiles from './paste_files';

export { default as init } from './init';
export { default as addFolder } from './add_folder';
export { default as deleteFile } from './delete_file';
export { default as deleteFolder } from './delete_folder';
export { default as uploadFiles } from './upload_files';
export { openFolder, pasteFiles };

const dispatch: Dispatch = getStore().dispatch;

/**
 * @name       SelectFileArg
 * @type       {Object}
 * @param      {boolean}  browser   If false the tool is in Filepicker mode.
 * @param      {boolean}  multiple  If false, user may only select one file at
 *                                  the time.
 * @param      {number}   id        The id of a file file; if that id is not
 *                                  already stored in the state, the file will
 *                                  be selected. If an id is already stored in
 *                                  the state, the corresponding file will be
 *                                  deselected.
 */
/**
 * Adds a file id to the selected file ids array in the state.
 *
 * @param {SelectFileArg} data Argument passed.
 */
export const selectFile = (data: { browser: boolean, multiple: boolean, id: number }) => {
    dispatch({
        type: Constants.SELECT_FILE,
        payload: { ...data },
    });
};

/**
 * Cut files, i.e. move the currently selected files to the clipboard
 */
export const cutFiles = () => {
    dispatch({
        type: Constants.CUT_FILES,
    });
};

/**
 * Move files in clipboard array back to the selected array
 */
export const cancelCutAndPasteFiles = () => {
    dispatch({
        type: Constants.CANCEL_CUT_AND_PASTE_FILES,
    });
};

/**
 * Changes the sorting column or sorting order of the items in the browser list
 *
 * @param      {string}  sort    The sorting column; if this is the same as
 *                               current sorting column, the sorting order will
 *                               be reversed.
 */
export const changeSorting = (sort: boolean) => {
    dispatch({
        type: Constants.CHANGE_SORTING,
        payload: { sort },
    });
};


/**
 * Dismiss an error popup.
 *
 * @param      {number}  error_id  The unique identifier of the error.
 */
export const dismissError = (id: number) => {
    dispatch({
        type: Constants.DISMISS_ERROR,
        payload: { id },
    });
};


/**
 * Shows a preview of a file, currently only images are supported.
 *
 * @param      {string}  image_url  The url of the full size image.
 */
export const showPreview = (imageUrl: string) => {
    dispatch({
        type: Constants.SHOW_PREVIEW,
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
export const confirmDeleteFile = (id: number) => {
    dispatch({
        type: Constants.CONFIRM_DELETE_FILE,
        payload: { id },
    });
};

export const confirmDeleteFolder = (id: number) => {
    dispatch({
        type: Constants.CONFIRM_DELETE_FOLDER,
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
export const setHover = (diff: number, max: number) => {
    dispatch({
        type: Constants.SET_HOVER,
        payload: { diff, max },
    });
};


/**
 * Sets the scroll position of the browser list
 *
 * @param      {number}  scroll  The position of the list in pixels measured
 *                               from the top.
 */
export const setScrollPosition = (scroll: number) => {
    dispatch({
        type: Constants.SET_SCROLL_POSITION,
        payload: { scroll },
    });
};


/**
 * In Filepicker mode the user sees a button to expand and collapse the browser.
 * In Browser mode the browser is always expanded.
 */
export const expandBrowser = () => {
    dispatch({
        type: Constants.EXPAND_BROWSER,
    });
};
