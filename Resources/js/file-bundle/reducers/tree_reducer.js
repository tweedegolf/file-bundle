import * as ActionTypes from '../constants'

export const treeInitialState = {
  all_folders: {
    null: {
      id: null,
      name: '..',
      file_ids: {},
      folder_ids: {},
      loadContents: true,
    }
  },
  all_files: {},
//  tree: {},
  files: [],
  folders: [],
  selected: [],
  clipboard: [],
  numSelected: 0,
  error: '',
  deleting_file: null,
  deleting_folder: null,
  loading_folder: null,
  uploading_files: null,
  current_folder: {
    id: null,
    name: '..'
  },
  parent_folder: null,
  adding_folder: false,
}

export function tree(state = treeInitialState, action){

  let index
  let file
  let files
  let folder
  let folders
  let selected
  let folder_id
  let current_folder
  let parent_folder
  let payload

  switch (action.type) {


    // LOAD FOLDER

    case ActionTypes.LOAD_FOLDER:
      return {
        ...state,
        loading_folder: folder_id
      }

    case ActionTypes.LOAD_FOLDER_ERROR:
      return {
        ...state,
        loading_folder: null
      }

    case ActionTypes.FOLDER_LOADED:
      payload = action.payload
      return {
        ...state,
        ...payload,
        hover: -1,
        loading_folder: null,
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
        files = state.files.filter(f => {
          return f.id !== state.deleting_file
        })
      }
      delete state.all_files[state.deleting_file]
      return {
        ...state,
        files,
        deleting_file: null,
        confirm_delete: null, // should be moved to ui_reducer
      }


    // DELETE FOLDER

    case ActionTypes.DELETE_FOLDER:
      return {
        ...state,
        deleting_folder: action.payload.id,
      }

    case ActionTypes.DELETE_FOLDER_ERROR:
      folder = state.all_folders[state.deleting_folder]
      return {
        ...state,
        confirm_delete: null, // should be moved to ui_reducer
        deleting_folder: null,
        errors: {
          folder: folder.name,
          type: 'delete_folder',
        }
      }

    case ActionTypes.FOLDER_DELETED:
      folders = [...state.folders]
      if(state.deleting_folder !== null){
        folders = state.folders.filter(f => {
          return f.id !== state.deleting_folder
        })
      }
      delete state.all_folders[state.deleting_folder]
      return {
        ...state,
        folders,
        deleting_folder: null,
        confirm_delete: null, // should be moved to ui_reducer
      }


    // UPLOAD FILES

    case ActionTypes.UPLOAD_START:
      return {
        ...state,
        uploading_files: [...action.payload.file_list],
      }

    case ActionTypes.UPLOAD_ERROR:
      let errors = []
      state.uploading_files.forEach(f => {
        errors.push({
          file: f.name,
          type: 'upload',
          messages: [action.payload.error]
        })
      })

      return {
        ...state,
        errors,
        uploading_files: null,
      }

    case ActionTypes.UPLOAD_DONE:
      files = [...state.files]
      action.payload.files.forEach(f => {
        state.all_files[f.id] = f
        files.push(f)
      })
      return {
        ...state,
        files,
        uploading_files: null,
      }


    // SELECT FILES

    case ActionTypes.SELECT_FILE:
      let {
        id,
        browser,
        multiple,
      } = action.payload

      file = null
      index = state.selected.findIndex(f => {
        return f.id === id
      })

      if(index === -1){
        file = state.files.find(f => {
          return f.id === id
        })
      }

      selected = [...state.selected]
      if(browser === false && multiple === false){
        if(index === -1){
          selected = [file]
        }else{
          selected = []
        }
      }else if(index === -1){
        selected.push(file)
      }else{
        selected.splice(index, 1)
      }

      return {
        ...state,
        selected
      }


    case ActionTypes.CACHE_SELECTED_FILES:
      return {
        ...state,
        selected: action.payload.files,
      }


    // ADD FOLDER

    case ActionTypes.ADD_FOLDER:
      return {
        ...state,
        adding_folder: true,
      }

    case ActionTypes.ERROR_ADD_FOLDER:
      return {
        ...state,
        adding_folder: false,
      }

    case ActionTypes.FOLDER_ADDED:
      return {
        ...state,
        adding_folder: false,
        folders: [...state.folders, ...action.payload.folders],
        errors: action.payload.errors,
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

    case ActionTypes.FILES_PASTED:
      state.clipboard.forEach(f => {
        f.new = true
      })
      files = [...state.files, ...state.clipboard]

      return {
        ...state,
        files,
        clipboard: [],
        selected: []
      }


    default:
      return state
  }
}
