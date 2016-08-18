import * as ActionTypes from './constants'
import _ from 'lodash';
import getStore from './get_store'
import api from './api'
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


  deleteFile(file_id, current_folder){
    dispatch({
      type: ActionTypes.DELETE_FILE,
      payload: {file_id}
    })

    tree.deleteFile(file_id, {...current_folder})
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


  deleteFolder(folder_id, current_folder){
    dispatch({
      type: ActionTypes.DELETE_FOLDER,
      payload: {folder_id}
    })

    tree.deleteFolder(folder_id, {...current_folder})
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


  cutFiles(files){
    dispatch({
      type: ActionTypes.CUT_FILES,
      payload: {
        files
      }
    })
  },


  pasteFiles(files, current_folder_id){
    let file_ids = files.map(file => {
      return file.id
    })
    api.paste(file_ids, current_folder_id,
      () => {
        dispatch({
          type: ActionTypes.FILES_PASTED
        })
      },
      error => {
        dispatch({
          type: ActionTypes.ERROR_PASTE_FILES,
          error: error
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

    api.upload(file_list, current_folder.id,
      (errors, files) => {
        dispatch({
          type: ActionTypes.UPLOAD_DONE,
          payload: {
            files,
            errors,
          }
        })
      },
      error => {
        dispatch({
          type: ActionTypes.UPLOAD_ERROR,
          payload: {error}
        })
      }
    )
  },


  addFolder(folder_name, current_folder){
    dispatch({
      type: ActionTypes.ADD_FOLDER,
    })

    tree.addFolder(folder_name, {...current_folder})
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
