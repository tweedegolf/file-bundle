import ActionTypes from './constants'
import _ from 'lodash';
import getStore from './store'
import api from '../api'

const dispatch = getStore().dispatch

export default {


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


    upload(file_list, currentfolder, sort){

        dispatch({
            type: ActionTypes.UPLOAD_START
        })

        api.upload(file_list, current_folder.id, (errors, files) => {
            // success
            dispatch({
                type: ActionTypes.UPLOAD_DONE,
                files,
                sort: 'create_ts',
                ascending: false,
                errors: errors
            });

        }, () => {
            // error
            dispatch({
                type: ActionTypes.UPLOAD_DONE
            });

        });
    }

}
