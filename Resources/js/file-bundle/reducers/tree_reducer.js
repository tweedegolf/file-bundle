import * as ActionTypes from '../constants'

export const treeInitialState = {
  all_folders: {
    null: {
      id: null,
      name: '..'
    }
  },
  all_files: {},
  tree: {},
  files: [],
  folders: [],
  error: '',
  uploading: false,
  loading_folder: null,
  current_folder: {
    id: null,
    name: '..'
  },
  parent_folder: null,
}


export function tree(state = treeInitialState, action){

  switch (action.type) {

    case ActionTypes.LOAD_FOLDER:
      return {...state, loading_folder: action.payload.id}

    case ActionTypes.FOLDER_ERROR:
      return {...state, loading_folder: null}

    case ActionTypes.FOLDER_LOADED:
      let folder_id = state.loading_folder
      let current_folder = state.all_folders[folder_id]
      let parent_folder = null

      if(typeof current_folder.parent !== 'undefined'){
        parent_folder = state.all_folders[current_folder.parent]
      }

      action.payload.folders.forEach(folder => {
        state.all_folders[folder.id] = folder
      })

      action.payload.files.forEach(file => {
        state.all_files[file.id] = file
      })

      let files = action.payload.files
      let folders = action.payload.folders

      // if(typeof folder_id !== 'undefined' && typeof tree[folder_id] !== 'undefined'){
      //   folders = [...folders, ...action.payload.folders]
      // }

      // tree[folder_id] = {
      //   ...current_folder,
      //   files,
      //   folders,
      // }


      return {
        ...state,
        hover: -1,
        loading_folder: null,
        current_folder,
        parent_folder,
        files,
        folders,
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
