import * as ActionTypes from './constants'
import getStore from './get_store'
import tree from './tree'

const store = getStore()
const dispatch = store.dispatch

export default {

  selectFile(payload){
    dispatch({
      type: ActionTypes.SELECT_FILE,
      payload,
    })
  },

  // store currently selected folder in local storage or similar (only for filepicker mode)
  cacheSelectedFiles(files){
    dispatch({
      type: ActionTypes.CACHE_SELECTED_FILES,
      payload: {files}
    })
  },


  loadFromLocalStorage(){
    tree.loadFromLocalStorage()
    .then(
      payload => {
        dispatch({
          type: ActionTypes.FOLDER_LOADED,
          payload,
        })
      }
    )
  },


  saveToLocalStorage(){
    tree.saveToLocalStorage(store.getState())
  },


  openFolder(id){
    dispatch({
      type: ActionTypes.LOAD_FOLDER,
      payload: {id}
    })

    tree.loadFolder(id)
    .then(
      payload => {
        dispatch({
          type: ActionTypes.FOLDER_LOADED,
          payload,
        })
      },
      payload => {
        dispatch({
          type: ActionTypes.LOAD_FOLDER_ERROR,
          payload
        })
      }
    )
  },


  deleteFile(file_id, current_folder_id){
    dispatch({
      type: ActionTypes.DELETE_FILE,
      payload: {file_id}
    })

    tree.deleteFile(file_id, current_folder_id)
    .then(
      payload => {
        dispatch({
          type: ActionTypes.FILE_DELETED,
          payload,
        })
      },
      payload => {
        dispatch({
          type: ActionTypes.DELETE_FILE_ERROR,
          payload
        })
      }
    )
  },


  deleteFolder(folder_id, current_folder_id){
    dispatch({
      type: ActionTypes.DELETE_FOLDER,
      payload: {folder_id}
    })

    tree.deleteFolder(folder_id, current_folder_id)
    .then(
      payload => {
        dispatch({
          type: ActionTypes.FOLDER_DELETED,
          payload,
        })
      },
      payload => {
        dispatch({
          type: ActionTypes.DELETE_FOLDER_ERROR,
          payload
        })
      }
    )
  },


  cutFiles(){
    dispatch({
      type: ActionTypes.CUT_FILES,
    })
  },


  pasteFiles(files, current_folder_id){
    // ui state action here?

    tree.moveFiles(files, current_folder_id)
    .then(
      payload => {
        dispatch({
          type: ActionTypes.FILES_PASTED,
          payload,
        })
      },
      payload => {
        dispatch({
          type: ActionTypes.ERROR_PASTE_FILES,
          payload
        })
      }
    )
  },


  cancelCutAndPasteFiles(){
    dispatch({
      type: ActionTypes.CANCEL_CUT_AND_PASTE_FILES,
    })
  },


  upload(file_list, current_folder){
    dispatch({
      type: ActionTypes.UPLOAD_START,
      payload: {file_list}
    })

    tree.addFiles(file_list, current_folder)
    .then(
      payload => {
        dispatch({
          type: ActionTypes.UPLOAD_DONE,
          payload,
        })
      },
      payload => {
        dispatch({
          type: ActionTypes.UPLOAD_ERROR,
          payload
        })
      }
    )
  },


  addFolder(folder_name, current_folder_id){
    dispatch({
      type: ActionTypes.ADD_FOLDER,
    })

    tree.addFolder(folder_name, current_folder_id)
    .then(
      payload => {
        dispatch({
          type: ActionTypes.FOLDER_ADDED,
          payload,
        })
      },
      payload => {
        dispatch({
          type: ActionTypes.ERROR_ADD_FOLDER,
          payload
        })
      }
    )
  },
}
