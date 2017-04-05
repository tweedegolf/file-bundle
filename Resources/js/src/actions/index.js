import R from 'ramda';
import { persistStore } from 'redux-persist';
import * as ActionTypes from '../util/constants';
import { getStore } from '../reducers/store';
import openFolder from './open_folder';
import pasteFiles from './paste_files';

export addFolder from './add_folder';
export deleteFile from './delete_file';
export deleteFolder from './delete_folder';
export uploadFiles from './upload_files';
export { openFolder, pasteFiles };

const store = getStore();
const dispatch = store.dispatch;

/**
 * Initialization function that hydrates the state from local storage or by
 * setting default values; called from the componentDidMount function in the
 * main container: <tt>./containers/browser.react.js</tt>
 *
 * @param      {?Array}  selected  The ids of the files that will be selected.
 *                                 Only used in Filepicker mode. You can add an
 *                                 array of file ids to the HTML element's
 *                                 dataset; this array is passed as argument.
 */
export const init = (options) => {
    const rootFolderId = options.root_folder_id;
    const foldersById = store.getState().tree.foldersById;
    foldersById[rootFolderId] = {
        id: rootFolderId,
        name: '..',
        file_count: 0,
        folder_count: 0,
    };

    dispatch({
        type: ActionTypes.INIT,
        payload: {
            selected: options.selected || [],
            rootFolderId,
            foldersById,
        },
    });

    // todo: add logic that checks if the current folder that is retrieved
    // from local storage may actually be accessed by this user;
    // 1. check if root_folder_id provided in the html data tag is the same as in local storage
    // 2. check if the current folder is a sub folder of the root folder
    persistStore(store, {}, () => {
        const currentFolderId = R.cond([
            [R.isNil, R.always(rootFolderId)],
            [R.isEmpty, R.always(rootFolderId)],
            [R.T, cf => cf.id],
        ])(store.getState().tree.currentFolder);
        openFolder(currentFolderId, true);
    });
};

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
export const selectFile = (data) => {
    dispatch({
        type: ActionTypes.SELECT_FILE,
        payload: { ...data },
    });
};

/**
 * Cut files, i.e. move the currently selected files to the clipboard
 */
export const cutFiles = () => {
    dispatch({
        type: ActionTypes.CUT_FILES,
    });
};

/**
 * Move files in clipboard array back to the selected array
 */
export const cancelCutAndPasteFiles = () => {
    dispatch({
        type: ActionTypes.CANCEL_CUT_AND_PASTE_FILES,
    });
};

/**
 * Changes the sorting column or sorting order of the items in the browser list
 *
 * @param      {string}  sort    The sorting column; if this is the same as
 *                               current sorting column, the sorting order will
 *                               be reversed.
 */
export const changeSorting = (sort) => {
    dispatch({
        type: ActionTypes.CHANGE_SORTING,
        payload: { sort },
    });
};


/**
 * Dismiss an error popup.
 *
 * @param      {number}  error_id  The unique identifier of the error.
 */
export const dismissError = (errorId) => {
    dispatch({
        type: ActionTypes.DISMISS_ERROR,
        payload: { errorId },
    });
};


/**
 * Shows a preview of a file, currently only images are supported.
 *
 * @param      {string}  image_url  The url of the full size image.
 */
export const showPreview = (imageUrl) => {
    dispatch({
        type: ActionTypes.SHOW_PREVIEW,
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
export const confirmDeleteFile = (id) => {
    dispatch({
        type: ActionTypes.CONFIRM_DELETE_FILE,
        payload: { id },
    });
};

export const confirmDeleteFolder = (id) => {
    dispatch({
        type: ActionTypes.CONFIRM_DELETE_FOLDER,
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
export const setHover = (diff, max) => {
    dispatch({
        type: ActionTypes.SET_HOVER,
        payload: { diff, max },
    });
};


/**
 * Sets the scroll position of the browser list
 *
 * @param      {number}  scroll  The position of the list in pixels measured
 *                               from the top.
 */
export const setScrollPosition = (scroll) => {
    dispatch({
        type: ActionTypes.SET_SCROLL_POSITION,
        payload: { scroll },
    });
};


/**
 * In Filepicker mode the user sees a button to expand and collapse the browser.
 * In Browser mode the browser is always expanded.
 */
export const expandBrowser = () => {
    dispatch({
        type: ActionTypes.EXPAND_BROWSER,
    });
};
