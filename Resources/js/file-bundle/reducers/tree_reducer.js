import * as ActionTypes from '../constants'

export const treeInitialState = {
  files: [],
  folders: [],
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

    return {
      ...state,
      current_folder: action.payload.current_folder,
      parent_folder: action.payload.parent_folder,
      files: action.payload.files,
      folders: action.payload.folders,
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
      current_folder: {
        ...state.current_folder,
        folder_count: action.payload.folder_count,
      },
      folders: action.payload.folders,
    }


  }else if(action.type === ActionTypes.UPLOAD_DONE){

    return {
      ...state,
      current_folder: {
        ...state.current_folder,
        file_count: action.payload.file_count
      },
      files: [...state.files, ...action.payload.files],
    }


  }else if(action.type === ActionTypes.FOLDER_ADDED){

    return {
      ...state,
      current_folder: {
        ...state.current_folder,
        folder_count: action.payload.folder_count,
      },
      folders: [...state.folders, ...action.payload.folders],
    }


  }else if(action.type === ActionTypes.FILES_MOVED){

    return {
      ...state,
      current_folder: {
        ...state.current_folder,
        file_count: action.payload.file_count,
      },
      files: [...state.files, ...action.payload.files],
    }

  }

  return state
}
