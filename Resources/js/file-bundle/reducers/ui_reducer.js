import * as ActionTypes from '../constants';

export const uiInitialState = {
  sort: 'create_ts',
  ascending: false,
  preview: null,
  hover: -1,
  errors: [],
  loading_folder: null,
  deleting_file: null,
  deleting_folder: null,
  adding_folder: false,
  uploading_files: false,
  receiving_updates_indicator: false
}


export function ui(state = uiInitialState, action){

  switch (action.type) {

    // ADD FOLDER

    case ActionTypes.ADD_FOLDER:
      return {
        ...state,
        adding_folder: true
      }

    case ActionTypes.FOLDER_ADDED:
      return {
        ...state,
        adding_folder: false
      }

    case ActionTypes.ERROR_ADDING_FOLDER:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
        adding_folder: false,
      }


    // DELETE FILE

    case ActionTypes.DELETE_FILE:
      return {
        ...state,
        deleting_file: action.payload.id
      }

    case ActionTypes.FILE_DELETED:
      return {
        ...state,
        deleting_file: null
      }

    case ActionTypes.ERROR_DELETING_FILE:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
        deleting_file: null,
      }


    // DELETE FOLDER

    case ActionTypes.DELETE_FOLDER:
      return {
        ...state,
        deleting_folder: action.payload.folder_id
      }

    case ActionTypes.FOLDER_DELETED:
      return {
        ...state,
        deleting_folder: null
      }

    case ActionTypes.ERROR_DELETING_FOLDER:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
        deleting_folder: null,
      }


    // OPEN FOLDER

    case ActionTypes.OPEN_FOLDER:
      return {
        ...state,
        loading_folder: action.payload.id
      }

    case ActionTypes.FOLDER_OPENED:
      return {
        ...state,
        loading_folder: null
      }

    case ActionTypes.ERROR_OPENING_FOLDER:

      return {
        ...state,
        //errors: [...state.errors, ...action.payload.errors],
        errors: [...state.errors],
        loading_folder: null,
      }


    // UPLOAD FILES

    case ActionTypes.UPLOAD_START:
      return {
        ...state,
        uploading_files: true
      }

    case ActionTypes.UPLOAD_DONE:
      return {
        ...state,
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
        //errors: [...state.errors, {id: 7777, type: 'generic', messages: ['het gaat hier helemaal mis!']}],
      }


    case ActionTypes.DISMISS_ERROR:
      let errors = state.errors.filter(error => {
        return error.id !== action.payload.error_id
      })
      return {
        ...state,
        errors,
      }


    // Server (pushing updates through sockets) initiated loading indicators

    case ActionTypes.RECEIVING_UPDATES:
      return {
        ...state,
        receiving_updates_indicator: true
      }

    case ActionTypes.APPLIED_UPDATES:
      return {
        ...state,
        receiving_updates_indicator: false
      }


    default:
      return state
  }
}
