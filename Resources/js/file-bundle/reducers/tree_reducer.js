import * as ActionTypes from '../constants'

export const treeInitialState = {
  files: [],
  folders: [],
  selected: [],
  clipboard: [],
  numSelected: 0,
  errors: '',
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
  recycle_bin_emtpy: false,
}


export function tree(state = treeInitialState, action){

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
      //console.log(action.payload.selected)
      return {
        ...state,
        //...action.payload, //nice but harder to understand which keys are added
        recycle_bin_emtpy: action.payload.recycle_bin_emtpy,
        current_folder: action.payload.current_folder,
        parent_folder: action.payload.parent_folder,
        files: action.payload.files,
        folders: action.payload.folders,
        selected: action.payload.selected || state.selected,
        hover: -1,
        loading_folder: null,
      }


    // DELETE FILE

    case ActionTypes.DELETE_FILE:
      return {
        ...state,
        recycle_bin_emtpy: false,
        deleting_file: action.payload.id,
      }

    case ActionTypes.DELETE_FILE_ERROR:
      return {
        ...state,
        errors: [...state.errors, action.payload.error],
        confirm_delete: null, // should be moved to ui_reducer
        deleting_file: null,
      }

    case ActionTypes.FILE_DELETED:
      return {
        ...state,
        current_folder: {
          ...state.current_folder,
          file_count: action.payload.file_count,
        },
        files: action.payload.files,
        deleting_file: null,
        confirm_delete: null, // should be moved to ui_reducer
      }


    // DELETE FOLDER

    case ActionTypes.DELETE_FOLDER:
      return {
        ...state,
        recycle_bin_emtpy: false,
        deleting_folder: action.payload.folder_id,
      }

    case ActionTypes.DELETE_FOLDER_ERROR:
      console.log(action.payload.errors)
      return {
        ...state,
        errors: [...state.errors, action.payload.error],
        confirm_delete: null, // should be moved to ui_reducer
        deleting_folder: null,
      }

    case ActionTypes.FOLDER_DELETED:
      return {
        ...state,
        folders: action.payload.folders,
        current_folder: {
          ...state.current_folder,
          folder_count: action.payload.folder_count,
        },
        deleting_folder: null,
        confirm_delete: null, // should be moved to ui_reducer
      }


    // UPLOAD FILES

    case ActionTypes.UPLOAD_START:
      return {
        ...state,
        uploading_files: [...action.payload.file_list],
      }

    case ActionTypes.ERROR_UPLOAD_FILE:
      return {
        ...state,
        errors: [...state.errors, ...action.payload.errors],
        uploading_files: null,
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
        uploading_files: null,
      }


    // SELECT FILES

    case ActionTypes.SELECT_FILE:
      let {
        id,
        browser,
        multiple,
      } = action.payload

      let file = null
      let index = state.selected.findIndex(f => {
        return f.id === id
      })

      if(index === -1){
        file = state.files.find(f => {
          return f.id === id
        })
      }

      let selected = [...state.selected]
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

      // let a = selected.map(f => {
      //   return f.id
      // })
      // console.log(id, a)

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
        current_folder: {
          ...state.current_folder,
          folder_count: action.payload.folder_count,
        },
        adding_folder: false,
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

    case ActionTypes.FILES_PASTED:
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


    default:
      return state
  }
}
