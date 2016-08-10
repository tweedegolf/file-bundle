import * as ActionTypes from '../constants'

export const treeInitialState = {
  all_folders: {
    null: {
      id: null,
      name: '..'
    }
  },
  all_files: {},
  folders: {
    null: {
      id: null,
      name: '..'
    }
  },
  files: {},
  data: {},
  error: '',
  uploading: false,
  loading_folder: null,
  current_folder: {
    id: null,
    name: '..'
  },
}


export function tree(state = treeInitialState, action){

  switch (action.type) {

    case ActionTypes.LOAD_FOLDER:
      return {...state, loading_folder: action.payload.id}

    case ActionTypes.FOLDER_ERROR:
      return {...state, loading_folder: null}

    case ActionTypes.FOLDER_LOADED:
      let folder_id = state.loading_folder
      let files = {...state.all_files}
      let folders = {...state.all_folders}
      let current_folder = state.folders[folder_id]

      action.payload.folders.forEach(folder => {
        all_folders[folder.id] = folder
      })

      action.payload.files.forEach(file => {
        all_files[file.id] = file
      })

      // if(folder_id !== undefined && this.data[folder_id]){
      //   this.data[folder_id].folders = this.data[folder_id].folders.concat(folders);
      // }
      // console.log(folders)


      return {
        ...state,
        hover: -1,
        loading_folder: null,
        files: action.payload.files,
        current_folder,
        folders,
        all_folders,
        all_files,
      }


    case ActionTypes.UPLOAD_START:
      return {...state, uploading: true}

    case ActionTypes.UPLOAD_ERROR:
      return {...state, uploading: false}

    case ActionTypes.UPLOAD_DONE:
      return {
        ...state,
        files: action.payload.files,
        uploading: false
      }

    default:
      return state
  }
}