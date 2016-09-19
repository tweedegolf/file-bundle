import * as ActionTypes from '../constants';

export const uiInitialState = {
  sort: 'create_ts',      // sorting type name, creation date (create_ts) or size
  ascending: false,       // sorting order
  expanded: false,        // whether the browser is showing or not, only in filepicker mode
  preview: null,          // null or the id of the image that will be previewed fullscreen
  confirm_delete: null,   // null or the id of the file that will be deleted after confirmation
  hover: -1,              // -1 or the index in the item list of the current folder of the
                          // file or folder that has currently been selected by the arrow up
                          // and down keys
  errors: [],             // array of errors returned by an API call
  loading_folder: null,   // null or the id of the folder whose contents is currently being
                          // loaded
  deleting_file: null,    // null of the id of the file that will be deleted
  deleting_folder: null,  // null of the id of the folder that will be deleted
  adding_folder: false,   // false or true if a new folder is in the process of being created
  uploading_files: false, // false or true if the user is uploading files
  scroll_position: null,  // null or the position that the browser list should be scrolled to
}


export function ui(state = uiInitialState, action){

  switch (action.type) {

    // user has added a folder, we can show some progress indicator while we
    // make an API call to the server
    case ActionTypes.ADD_FOLDER:
      return {
        ...state,
        adding_folder: true
      }

    // response from the server; folder has been made, we can remove the
    // progress indicator (if any)
    case ActionTypes.FOLDER_ADDED:
      return {
        ...state,
        adding_folder: false
      }

    // something went wrong during connection or at the server, we can remove
    // the progress indicator and show the errors(s)
    case ActionTypes.ERROR_ADDING_FOLDER:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
        adding_folder: false,
      }


    // user wants to delete a file, show progress indicator during API call
    case ActionTypes.DELETE_FILE:
      return {
        ...state,
        deleting_file: action.payload.id
      }

    // response from the server: file has been deleted successfully
    case ActionTypes.FILE_DELETED:
      return {
        ...state,
        deleting_file: null
      }

    // something went wrong, for instance the file has already been deleted by
    // another user or a network error occured
    case ActionTypes.ERROR_DELETING_FILE:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
        deleting_file: null,
      }


    // user wants to delete a folder, show progress indicator during API call
    case ActionTypes.DELETE_FOLDER:
      return {
        ...state,
        deleting_folder: action.payload.folder_id
      }

    // response from server: folder has been deleted successfully
    case ActionTypes.FOLDER_DELETED:
      return {
        ...state,
        deleting_folder: null
      }

    // something went wrong: network error ot the folder hasn't been emptied,
    // etc.
    case ActionTypes.ERROR_DELETING_FOLDER:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
        deleting_folder: null,
      }


    // user has clicked on a folder to open it; first we try to load its
    // contents from the local storage and if not present or outdated we
    // retrieve it from the server
    case ActionTypes.OPEN_FOLDER:
      return {
        ...state,
        loading_folder: action.payload.id
      }

    // folder contents has been successfully retrieved from local storage or
    // server
    case ActionTypes.FOLDER_OPENED:
      return {
        ...state,
        loading_folder: null
      }

    // something went wrong opening the folder; show error messages
    case ActionTypes.ERROR_OPENING_FOLDER:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
        loading_folder: null,
      }


    // user has selected files to upload; show progress indicator while they are
    // uploaded to the server
    case ActionTypes.UPLOAD_START:
      return {
        ...state,
        uploading_files: true
      }

    // files have been uploaded successfully, we set sort to ascending and create_ts
    // and scroll_position to 0 to make the newly uploaded files appear at the
    // top of the browser list
    case ActionTypes.UPLOAD_DONE:
      return {
        ...state,
        ascending: false,
        sort: 'create_ts',
        scroll_position: 0,
        uploading_files: false
      }

    case ActionTypes.ERROR_UPLOADING_FILE:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
        uploading_files: false,
      }


    // MOVE FILES

    case ActionTypes.ERROR_MOVING_FILES:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
      }


    // CHANGE SORTING

    case ActionTypes.CHANGE_SORTING:
      return {
        ...state,
        sort: action.payload.sort,
        ascending: action.payload.ascending,
        //errors: [...state.errors, {id: 7777, type: 'generic', messages: ['oh my, this is an error!']}],
      }


    case ActionTypes.DISMISS_ERROR:
      return {
        ...state,
        errors: action.payload.errors,
      }


    case ActionTypes.SHOW_PREVIEW:
      return {
        ...state,
        preview: action.payload.image_url
      }


    case ActionTypes.CONFIRM_DELETE:
      return {
        ...state,
        confirm_delete: action.payload.id
      }


    case ActionTypes.SET_HOVER:
      return {
        ...state,
        hover: action.payload.hover,
      }


    case ActionTypes.SET_SCROLL_POSITION:
      return {
        ...state,
        scroll_position: action.payload.scroll
      }


    case ActionTypes.EXPAND_BROWSER:
      return {
        ...state,
        expanded: !state.expanded
      }

    default:
      return state
  }
}
