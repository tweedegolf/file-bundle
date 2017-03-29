import * as ActionTypes from '../util/constants';
import cache from '../util/cache';

/**
 * The initial ui state
 *
 * @type       {Object}
 * @name       uiInitialState
 *
 * @property   {String}   sort                  Sort files and folders by column
 *                                              ('create_ts'|'type'|'name'|'size')
 *
 * @property   {boolean}  ascending             Sorting order
 * @property   {boolean}  expanded              Whether the browser is showing
 *                                              or not: in filepicker mode you
 *                                              may choose to hide the browser
 * @property   {?number}  previewUrl            The url of the file that will be
 *                                              previewed fullscreen, currently
 *                                              implemented only for images
 * @property   {?number}  deleteFileWithId      null or the id of the file that
 *                                              the user wants to delete; a
 *                                              confirmation popup will be
 *                                              showed and the file will only be
 *                                              deleted after confirmation.
 * @property   {number}   hover                 -1 or the index in the item list
 *                                              of the current folder of the
 *                                              file or folder that has
 *                                              currently been selected by the
 *                                              arrow up and down keys
 * @property   {Array}    errors                Array of {@link APIError Error
 *                                              objects} returned by an API
 *                                              call. See the description of the
 *                                              error object in ./cache.js
 * @property   {?number}  loadingFolderWithId   The id of the folder whose
 *                                              content is currently being
 *                                              loaded, or -1 if no folder is
 *                                              being opened. Note that the id
 *                                              of the root folder is null!
 * @property   {?number}  deletingFileWithId    The id of the file that will be
 *                                              deleted, or null if no file is
 *                                              in the process of being deleted
 * @property   {?number}  deletingFolderWithId  The id of the folder that will
 *                                              be deleted, or null if no folder
 *                                              is in the process of being
 *                                              deleted. Note that the root
 *                                              folder, which has id null can
 *                                              not be deleted!
 * @property   {boolean}  isAddingFolder        true if a new folder is in the
 *                                              process of being created
 * @property   {boolean}  isUploadingFiles      true if the user is uploading
 *                                              one of more files
 * @property   {?number}  scrollPosition        The position that the browser
 *                                              list should be scrolled to, or
 *                                              null if no scrolling action is
 *                                              required
 * @property   {Array}    selected              Array of file description
 *                                              objects representing the
 *                                              currently selected files; in the
 *                                              filelist of the browser they
 *                                              will show up with a checked
 *                                              checkbox
 * @property   {Array}    clipboard             After the user has clicked on
 *                                              'cut' in the toolbar, the file
 *                                              description objects in the
 *                                              selected array are moved to the
 *                                              clipboard array: from here they
 *                                              can be pasted into another
 *                                              folder
 */
export const uiInitialState = {
    sort: 'create_ts',
    ascending: false,
    expanded: false,
    previewUrl: null,
    deleteFileWithId: null,
    hover: -1,
    errors: [],
    loadingFolderWithId: -1,
    deletingFileWithId: null,
    deletingFolderWithId: null,
    isAddingFolder: false,
    isUploadingFiles: false,
    scrollPosition: null,
    selected: [],
    clipboard: [],
};


/**
 * Reduce function, listens for certain action types and changes the change,
 * optionally using the action's payload.
 *
 * @param      {Object}  state   The current state
 * @param      {string}  action  The action type
 * @return     {Object}  The new state
 */
export function ui(state = uiInitialState, action) {
    /**
     * User has added a folder, we can show a progress indicator while we make
     * an API call to the server
     */
    if (action.type === ActionTypes.ADD_FOLDER) {
        return {
            ...state,
            isAddingFolder: true,
        };

    /**
     * Response from the server; folder has been created, we can remove the
     * progress indicator (if any). In some cases the server returns errors, if
     * this is the case they will be displayed. This action is processed by the
     * tree reducer as well.
     */
    } else if (action.type === ActionTypes.FOLDER_ADDED) {
        return {
            ...state,
            isAddingFolder: false,
            errors: [...state.errors, ...action.payload.errors],
        };

    /**
     * Something went wrong during connection or at the server, we can remove the
     * progress indicator and show the error(s)
     */
    } else if (action.type === ActionTypes.ERROR_ADDING_FOLDER) {
        return {
            ...state,
            isAddingFolder: false,
            errors: [...state.errors, ...action.payload.errors],
        };

    /**
     * User wants to delete a file, if the id in the payload is a number this
     * actions triggers a confirmation popup. If the id is null it means that the
     * confirmation popup was already showing and that the user has clicked on the
     * 'cancel' button, or has clicked anywhere outside the popup.
     */
    } else if (action.type === ActionTypes.CONFIRM_DELETE) {
        return {
            ...state,
            deleteFileWithId: action.payload.id,
        };


    /**
     * User really wants to delete the file, show progress indicator during API call
     */
    } else if (action.type === ActionTypes.DELETE_FILE) {
        return {
            ...state,
            deletingFileWithId: action.payload.id,
        };

    /**
     * Response from the server: file has been deleted successfully. This action
     * is also processed by the tree reducer.
     */
    } else if (action.type === ActionTypes.FILE_DELETED) {
        return {
            ...state,
            deletingFileWithId: null,
        };

    /**
     * Something went wrong, for instance the file has already been deleted by
     * another user or a network error occured.
     */
    } else if (action.type === ActionTypes.ERROR_DELETING_FILE) {
        return {
            ...state,
            deletingFileWithId: null,
            errors: [...state.errors, ...action.payload.errors],
        };


    /**
     * User wants to delete an empty folder, show progress indicator during API
     * call. Note that no confirmation popup will be showed; the folder will be
     * deleted right away (if it is empty)
     */
    } else if (action.type === ActionTypes.DELETE_FOLDER) {
        return {
            ...state,
            deletingFolderWithId: action.payload.folder_id,
        };

    /**
     * Response from server: folder has been deleted successfully. This action is
     * also processed by the tree reducer.
     */
    } else if (action.type === ActionTypes.FOLDER_DELETED) {
        return {
            ...state,
            deletingFolderWithId: null,
        };

    /**
     * Something went wrong: network error, etc.
     */
    } else if (action.type === ActionTypes.ERROR_DELETING_FOLDER) {
        return {
            ...state,
            deletingFolderWithId: null,
            errors: [...state.errors, ...action.payload.errors],
        };


    /**
     * User has clicked on a folder to open it; first we try to load its contents
     * from the local storage and if not present or outdated we retrieve it from
     * the server. This action is also processed by the tree reducer.
     */
    } else if (action.type === ActionTypes.OPEN_FOLDER) {
        return {
            ...state,
            loadingFolderWithId: action.payload.id,
            deleteFileWithId: null,
        };

    /**
     * Folder contents has been successfully retrieved from local storage or
     * server. We can hide the progress animation (if any)
     */
    } else if (action.type === ActionTypes.FOLDER_OPENED) {
        return {
            ...state,
            loadingFolderWithId: -1,
        };

    /**
     * Something went wrong opening the folder; show error messages
     */
    } else if (action.type === ActionTypes.ERROR_OPENING_FOLDER) {
        return {
            ...state,
            loadingFolderWithId: -1,
            errors: [...state.errors, ...action.payload.errors],
        };


    /**
     * User has selected files to upload; show progress indicator while they are
     * uploaded to the server
     */
    } else if (action.type === ActionTypes.UPLOAD_START) {
        return {
            ...state,
            isUploadingFiles: true,
        };

    /**
     * Files have been uploaded successfully, we set sort to ascending and
     * 'create_ts' and scrollPosition to 0 to make the newly uploaded files
     * appear at the top of the browser list. Sometimes the server returns errors,
     * for instance if some of the uploaded files are too large or of an
     * unsupported file type.
     */
    } else if (action.type === ActionTypes.UPLOAD_DONE) {
        return {
            ...state,
            ascending: false,
            sort: 'create_ts',
            scrollPosition: 0,
            isUploadingFiles: false,
            errors: [...state.errors, ...action.payload.errors],
        };

    /**
     * This happens only in case of a network or server error
     */
    } else if (action.type === ActionTypes.ERROR_UPLOADING_FILE) {
        return {
            ...state,
            isUploadingFiles: false,
            errors: [...state.errors, ...action.payload.errors],
        };


    /**
     * An error occurred when the selected files were pasted into another folder.
     * Most likely this is a network or a server error.
     */
    } else if (action.type === ActionTypes.ERROR_MOVING_FILES) {
        return {
            ...state,
            errors: [...state.errors, ...action.payload.errors],
        };


    /**
     * User has clicked on one of the columns of the tool bar. If the chosen
     * column is the same as the sort column in the state we invert the selection.
     * Otherwise a new sorting column will be set and the current sort order
     * (ascending or descending) will be left unaffected.
     */
    } else if (action.type === ActionTypes.CHANGE_SORTING) {
        let ascending = state.ascending;
        if (state.sort === action.payload.sort) {
            ascending = !ascending;
        }

        return {
            ...state,
            ascending,
            sort: action.payload.sort,
            // errors: [...state.errors, {id: 7777, type: 'generic', messages: ['oh my, this is an error!']}],
        };

    /**
     * User dismisses an error message. Error messages don't disappear
     * automatically; every new error message is added to the existing error
     * messages.
     */
    } else if (action.type === ActionTypes.DISMISS_ERROR) {
        const errors = state.errors.filter(error => error.id !== action.payload.error_id);

        return {
            ...state,
            errors,
        };

    /**
     * User has clicked on a file to show its full screen preview: currently only
     * implemented for images.
     */
    } else if (action.type === ActionTypes.SHOW_PREVIEW) {
        return {
            ...state,
            previewUrl: action.payload.imageUrl,
        };

    /**
     * The user can select files by using the up and down arrow keys of her
     * keyboard. We calculate the new index with 'diff' and 'max':
     *
     * @param      {number}  diff    Direction: -1 for arrow down or +1 for arrow
     *                               up
     * @param      {number}  max     Number of items (files and folders) in the
     *                               current folder
     */
    } else if (action.type === ActionTypes.SET_HOVER) {
        const {
            diff,
            max,
        } = action.payload;

        let hover = state.hover + diff;
        // console.log(diff, max, hover)
        if (hover > max) {
            hover = 0;
        } else if (hover < 0) {
            hover = max - 1;
        }

        return {
            ...state,
            hover,
        };

    /**
     * Sometimes we need to be able to set the scroll position of the browser list
     * by code, for instance if new files have been added we want to show them on
     * top of the list and scroll the list to the top.
     */
    } else if (action.type === ActionTypes.SET_SCROLL_POSITION) {
        return {
            ...state,
            scrollPosition: action.payload.scroll,
        };


    /**
     * In filepicker mode the user can collapse and expand the browser window. In
     * browser mode the browser is always expanded.
     */
    } else if (action.type === ActionTypes.EXPAND_BROWSER) {
        return {
            ...state,
            expanded: !state.expanded,
        };

    /**
     * User has clicked the checkbox of a file: if this file is not already
     * selected it will be selected, otherwise it will be deselected. In
     * filepicker mode you can set a boolean property 'multiple'; if this value is
     * set to false only one file at the time can be selected.
     *
     * @param      {number}   id        The id of the file whose select checkbox
     *                                  has been clicked
     * @param      {boolean}  browser   False if the tool is in filepicker mode
     * @param      {boolean}  multiple  Whether it is allowed to have multiple
     *                                  files selected
     */
    } else if (action.type === ActionTypes.SELECT_FILE) {
        const {
            id,
            browser,
            multiple,
        } = action.payload;

        let selected = [...state.selected];
        const index = selected.findIndex(file => file.id === id);

        if (browser === false && multiple === false) {
            if (index === -1) {
                selected = [cache.getFileById(id)];
            } else {
                selected = [];
            }
        } else if (index === -1) {
            selected.push(cache.getFileById(id));
        } else {
            selected.splice(index, 1);
        }

        return {
            ...state,
            selected,
        };

    /**
     * In filepicker mode, selected files can be passed via the HTML element's
     * dataset, here we store them in the selected array of the ui state
     *
     * @param      {Array<Object>}  selected  Array containing the file
     *                                        description objects that are set in
     *                                        the dataset property of the root
     *                                        HTML element
     */
    } else if (action.type === ActionTypes.SELECT_FILES) {
        return {
            ...state,
            selected: [...action.payload.selected],
            // selected: [...state.selected, ...action.payload.selected]
        };

    /**
     * The user cuts the selected file into another folder: as you can see the
     * selected files are moved from the selected array to the clipboard array of
     * the state.
     */
    } else if (action.type === ActionTypes.CUT_FILES) {
        return {
            ...state,
            clipboard: [...state.selected],
            selected: [],
        };

    /**
     * The user cancels a cut action. The contents of the clipboard array is moved
     * back to the selected array.
     */
    } else if (action.type === ActionTypes.CANCEL_CUT_AND_PASTE_FILES) {
        return {
            ...state,
            clipboard: [],
            selected: [...state.clipboard],
        };

    /**
     * The paste action of the cut files yields an error. In most cases this is a
     * network or server error. The contents of the clipboard array is moved back
     * to the selected array of the state.
     */
    } else if (action.type === ActionTypes.ERROR_MOVING_FILES) {
        return {
            ...state,
            clipboard: [],
            selected: [...state.clipboard],
        };

    /**
     * Files are successfully moved to another folder. This action is processed by
     * the tree reducer as well.
     */
    } else if (action.type === ActionTypes.FILES_MOVED) {
        return {
            ...state,
            clipboard: [],
            selected: [],
        };
    }
    return state;
}
