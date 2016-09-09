import * as ActionTypes from '../constants'
import {sortBy} from '../util'

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


export function tree(state = treeInitialState, action){

  switch (action.type) {

    // LOAD FOLDER

    case ActionTypes.FOLDER_OPENED:
      //console.log(action.payload.selected)
      if(action.payload.errors instanceof Array === false){
        action.payload.errors = []
      }
      return {
        ...state,
        //...action.payload, //nice but harder to understand which keys are added
        current_folder: action.payload.current_folder,
        parent_folder: action.payload.parent_folder,
        errors: [...state.errors, ...action.payload.errors],
        files: action.payload.files,
        folders: action.payload.folders,
        selected: action.payload.selected || state.selected,
      }


    // DELETE FILE

    case ActionTypes.FILE_DELETED:
      return {
        ...state,
        current_folder: {
          ...state.current_folder,
          file_count: action.payload.file_count,
        },
        files: action.payload.files,
      }


    // DELETE FOLDER

    case ActionTypes.FOLDER_DELETED:
      return {
        ...state,
        folders: action.payload.folders,
        current_folder: {
          ...state.current_folder,
          folder_count: action.payload.folder_count,
        },
      }


    // UPLOAD FILES

    case ActionTypes.UPLOAD_DONE:
      return {
        ...state,
        current_folder: {
          ...state.current_folder,
          file_count: action.payload.file_count
        },
        files: sortBy([...state.files, ...action.payload.files], 'create_ts', false),
        errors: [...state.errors, ...action.payload.errors],
      }


    // SELECT FILES

    case ActionTypes.SELECT_FILE:
      return {
        ...state,
        selected: action.payload.selected,
      }


    // ADD FOLDER

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


    // CUT AND PASTE

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
        selected: []
      }

    case ActionTypes.ERROR_MOVING_FILES:
      return {
        ...state,
        //clipboard: [],
        //selected: []
      }

    case ActionTypes.FILES_MOVED:
      return {
        ...state,
        current_folder: {
          ...state.current_folder,
          file_count: action.payload.file_count,
        },
        files: [...state.files, ...action.payload.files],
        clipboard: [],
        selected: []
      }


    // CHANGE SORTING

    case ActionTypes.CHANGE_SORTING:
      let {sort, ascending} = action.payload
      let files = sortBy([...state.files], sort, ascending)
      let folders = sortBy([...state.folders], sort, ascending)
      return {
        ...state,
        files,
        folders,
      }


    case ActionTypes.DISMISS_ERROR:
      let errors = state.errors.filter(error => {
        return error.id !== action.payload.error_id
      })
      return {
        ...state,
        errors,
      }


    default:
      return state
  }
}
