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


export function tree(state = treeInitialState, action) {

  // Multiple actions need the 'sort' and 'ascending' values of the ui reducer
  // to calculate the new tree state. We define them here because otherwise we
  // would have to define them in every if statement where they are needed. If
  // the keys are not set in the payload, the values will be undefined but that
  // is not a problem because in these cases we don't need them anyway.
  let {
    sort,
    ascending,
  } = action.payload || {}


  if(action.type === ActionTypes.FOLDER_OPENED) {

    //console.log(action.payload.selected)
    if(action.payload.errors instanceof Array === false) {
      action.payload.errors = []
    }

    return {
      ...state,
      current_folder: action.payload.current_folder,
      parent_folder: action.payload.parent_folder,
      errors: [...state.errors, ...action.payload.errors],
      files: sortBy(action.payload.files, sort, ascending),
      folders: sortBy(action.payload.folders, sort, ascending),
      selected: action.payload.selected || state.selected,
    }


  }else if(action.type === ActionTypes.FILE_DELETED){

    return {
      ...state,
      current_folder: {
        ...state.current_folder,
        file_count: action.payload.file_count,
      },
      files: sortBy(action.payload.files, sort, ascending),
    }


  }else if(action.type === ActionTypes.FOLDER_DELETED){

    return {
      ...state,
      folders: sortBy(action.payload.folders, sort, ascending),
      current_folder: {
        ...state.current_folder,
        folder_count: action.payload.folder_count,
      },
    }


  }else if(action.type === ActionTypes.UPLOAD_DONE){

    return {
      ...state,
      current_folder: {
        ...state.current_folder,
        file_count: action.payload.file_count
      },
      files: sortBy(action.payload.files, sort, ascending),
      errors: [...state.errors, ...action.payload.errors],
    }


  }else if(action.type === ActionTypes.SELECT_FILE){

    return {
      ...state,
      selected: action.payload.selected,
    }


  }else if(action.type === ActionTypes.FOLDER_ADDED){

    return {
      ...state,
      current_folder: {
        ...state.current_folder,
        folder_count: action.payload.folder_count,
      },
      folders: sortBy([...state.folders, ...action.payload.folders], sort, ascending),
      errors: [...state.errors, ...action.payload.errors],
    }


  }else if(action.type === ActionTypes.CUT_FILES){

    return {
      ...state,
      clipboard: [...state.selected],
      selected: []
    }


  }else if(action.type === ActionTypes.CANCEL_CUT_AND_PASTE_FILES){

    return {
      ...state,
      clipboard: [],
      selected: []
    }


  }else if(action.type === ActionTypes.ERROR_MOVING_FILES){

    return {
      ...state,
      //clipboard: [],
      //selected: []
    }


  }else if(action.type === ActionTypes.FILES_MOVED){

    return {
      ...state,
      current_folder: {
        ...state.current_folder,
        file_count: action.payload.file_count,
      },
      files: sortBy([...state.files, ...action.payload.files], sort, ascending),
      clipboard: [],
      selected: []
    }


  }else if(action.type === ActionTypes.CHANGE_SORTING){
    return {
      ...state,
      files: sortBy([...state.files], sort, ascending),
      folders: sortBy([...state.folders], sort, ascending),
    }


  }else if(action.type === ActionTypes.DISMISS_ERROR){

    let errors = state.errors.filter(error => {
      return error.id !== action.payload.error_id
    })
    return {
      ...state,
      errors,
    }
  }

  return state //-> if we return the state here, will it cause a re-render?
}
