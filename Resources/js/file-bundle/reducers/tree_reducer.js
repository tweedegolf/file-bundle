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
      files: action.payload.files,
      folders: action.payload.folders,
      selected: action.payload.selected || state.selected,
    }


  }else if(action.type === ActionTypes.FILE_DELETED){

    return {
      ...state,
      current_folder: {
        ...state.current_folder,
        file_count: action.payload.file_count,
      },
      files: action.payload.files,
    }


  }else if(action.type === ActionTypes.FOLDER_DELETED){

    return {
      ...state,
      folders: action.payload.folders,
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
      files: action.payload.files,
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
      folders: action.payload.folders,
      errors: action.payload.errors,
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
      files: action.payload.files,
      clipboard: [],
      selected: []
    }


  }else if(action.type === ActionTypes.CHANGE_SORTING){
    return {
      ...state,
      files: action.payload.files,
      folders: action.payload.folders,
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

  return state
}
