import * as ActionTypes from '../constants'
import _ from 'lodash';
import getStore from '../get_store'
import api from '../api'

const store = getStore()
const dispatch = store.dispatch

export default {

  selectFile(payload){
    dispatch({
      type: ActionTypes.SELECT_FILE,
      payload,
    })
  },


  cacheSelectedFiles(files){
    dispatch({
      type: ActionTypes.CACHE_SELECTED_FILES,
      payload: {files}
    })
  },


  deleteFile(id){

    dispatch({
      type: ActionTypes.DELETE_FILE,
      payload: {id}
    })

    api.deleteFile(id, () => {
      dispatch({
        type: ActionTypes.FILE_DELETED
      })
    }, () => {
      dispatch({
        type: ActionTypes.DELETE_FILE_ERROR
      })
    })
  },


  openFolder(id){
    dispatch({
      type: ActionTypes.LOAD_FOLDER,
      payload: {id}
    })

    api.openFolder(id, (folders, files) => {
      dispatch({
        type: ActionTypes.FOLDER_LOADED,
        payload: {
          folders,
          files,
        }
      })
    }, () => {
      dispatch({
        type: ActionTypes.LOAD_FOLDER_ERROR,
      })
    })
  },


  upload(file_list, current_folder){
    dispatch({
      type: ActionTypes.UPLOAD_START
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
      () => {
        dispatch({
          type: ActionTypes.UPLOAD_ERROR
        })
      }
    )
  },


  addFolder(new_folder_name, current_folder_id){
    dispatch({
      type: ActionTypes.ADD_FOLDER,
    })

    api.addFolder(new_folder_name, current_folder_id,
      (folders, errors) => {
        dispatch({
          type: ActionTypes.FOLDER_ADDED,
          payload: {
            folders,
            errors,
          }
        })
      },
      () => {
        dispatch({
          type: ActionTypes.ERROR_ADD_FOLDER,
        })
      }
    )
  },

}


/*


  findFile(id) {
    dispatch({
      type: ActionTypes.FIND_FILE,
      payload: {id}
    })
  },

  storeFiles(files, folder_id) {
    dispatch({
      type: ActionTypes.STORE_FILES,
      payload: {files, folder_id}
    })
  },

  removeFiles(file_ids) {
    dispatch({
      type: ActionTypes.REMOVE_FILES,
      payload: {file_ids}
    })
  },

  removeFolders(folder_ids) {
    dispatch({
      type: ActionTypes.REMOVE_FOLDERS,
      payload: {folder_ids}
    })
  },

  getFiles(folder_id) {
    dispatch({
      type: ActionTypes.REMOVE_FOLDERS,
      payload: {folder_id}
    })
  },

  findFolder(id) {
    dispatch({
      type: ActionTypes.FIND_FOLDER,
      payload: {id}
    })
  },

  storeFolders(folders, folder_id) {
    dispatch({
      type: ActionTypes.STORE_FOLDERS,
      payload: {folders, folder_id}
    })
  },

  loadFolder(key, mis, hit) {
    dispatch({
      type: ActionTypes.LOAD_FOLDER,
      payload: {key, mis, hit}
    })
  },

  getFolders(folder_id) {
    dispatch({
      type: ActionTypes.GET_FOLDERS,
      payload: {folder_id}
    })
  },


  storeFolder(key, folders, files) {
    dispatch({
      type: ActionTypes.STORE_FOLDER,
      payload: {key, folders, files}
    })
  },

*/