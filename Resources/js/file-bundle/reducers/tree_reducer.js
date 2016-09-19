import * as ActionTypes from '../constants'

export const treeInitialState = {
  files: [],
  folders: [],
  selected: [],
  clipboard: [],
  errors: [],
  current_folder: {
    id: null,
    name: '..'
  },
  parent_folder: null,
}


export function tree(state = treeInitialState, action) {

  switch(action.type){
    case ActionTypes.FOLDER_OPENED:
      return {
        ...state,
        current_folder: action.payload.current_folder,
        parent_folder: action.payload.parent_folder,
        files: action.payload.files,
        folders: action.payload.folders,
        selected: action.payload.selected,
      }

    case ActionTypes.FILE_DELETED:
      return {
        ...state,
        current_folder: {
          ...state.current_folder,
          file_count: action.payload.file_count,
        },
        files: action.payload.files,
      }

    case ActionTypes.FOLDER_DELETED:
      return {
        ...state,
        folders: action.payload.folders,
        current_folder: {
          ...state.current_folder,
          folder_count: action.payload.folder_count,
        },
      }

    case ActionTypes.UPLOAD_DONE:
      return {
        ...state,
        current_folder: {
          ...state.current_folder,
          file_count: action.payload.file_count
        },
        files: [...state.files, ...action.payload.files],
        errors: [...state.errors, ...action.payload.errors],
      }

    case ActionTypes.SELECT_FILE:
      return {
        ...state,
        selected: action.payload.selected,
      }

    case ActionTypes.FOLDER_ADDED:
      return {
        ...state,
        current_folder: {
          ...state.current_folder,
          folder_count: action.payload.folder_count,
        },
        folders: [...state.folders, ...action.payload.folders],
        errors: [...state.errors, ...action.payload.errors],
      }

    case ActionTypes.CUT_FILES:
      return {
        ...state,
        clipboard: [...state.selected],
        selected: []
      }

    case ActionTypes.CANCEL_CUT_AND_PASTE_FILES:
      return {
        ...state,
        clipboard: [],
        selected: [...state.clipboard]
      }

    case ActionTypes.ERROR_MOVING_FILES:
      return {
        ...state,
        clipboard: [],
        selected: [...state.clipboard]
      }

    case ActionTypes.FILES_MOVED:
      return {
        ...state,
        current_folder: {
          ...state.current_folder,
          file_count: action.payload.file_count,
        },
        files: action.payload.files,
        clipboard: [],
        selected: []
      }

    case ActionTypes.CHANGE_SORTING:
      return {
        ...state,
        files: action.payload.files,
        folders: action.payload.folders,
      }

    case ActionTypes.DISMISS_ERROR:
      return {
        ...state,
        errors: action.payload.errors,
      }

    default:
      return state
  }
}
