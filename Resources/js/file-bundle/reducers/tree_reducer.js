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
  deleting_file: null,
  loading_folder: null,
  current_folder: {
    id: null,
    name: '..'
  },
  parent_folder: null,
}


export function tree(state = treeInitialState, action){

  let file
  let files
  let folders

  switch (action.type) {


    // LOAD FOLDER

    case ActionTypes.LOAD_FOLDER:
      return {
        ...state,
        loading_folder: action.payload.id
      }

    case ActionTypes.LOAD_FOLDER_ERROR:
      return {
        ...state,
        loading_folder: null
      }

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

      files = action.payload.files
      folders = action.payload.folders

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


    // DELETE FILE

    case ActionTypes.DELETE_FILE:
      return {
        ...state,
        deleting_file: action.payload.id,
      }

    case ActionTypes.DELETE_FILE_ERROR:
      file = state.all_files[state.deleting_file]
      return {
        ...state,
        confirm_delete: null, // should be moved to ui_reducer
        deleting_file: null,
        errors: {
          file,
          type: 'delete',
        }
      }

    case ActionTypes.FILE_DELETED:
      files = [...state.files]
      if(state.deleting_file !== null){
        files = state.files.filter(file => {
          return file.id !== state.deleting_file
        })
      }
      return {
        ...state,
        files,
        deleting_file: null,
        confirm_delete: null, // should be moved to ui_reducer
      }


    // UPLOAD FILES

    case ActionTypes.UPLOAD_START:
      return {
        ...state,
        uploading: true
      }

    case ActionTypes.UPLOAD_ERROR:
      return {
        ...state,
        uploading: false
      }

    case ActionTypes.UPLOAD_DONE:
      files = [...state.files]
      action.payload.files.forEach(file => {
        state.all_files[file.id] = file
        files.push(file)
      })
      return {
        ...state,
        files,
        uploading: false
      }

    default:
      return state
  }
}
