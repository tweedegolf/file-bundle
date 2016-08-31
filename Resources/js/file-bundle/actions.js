import * as ActionTypes from './constants'
import getStore from './get_store'
import tree from './tree'
import {chainPromises} from './util'

const store = getStore()
const dispatch = store.dispatch

const selectFile = function(payload){
  dispatch({
    type: ActionTypes.SELECT_FILE,
    payload,
  })
}

// store currently selected folder in local storage or similar (only for filepicker mode)
const cacheSelectedFiles = function(files){
  dispatch({
    type: ActionTypes.CACHE_SELECTED_FILES,
    payload: {files}
  })
}


const loadFromLocalStorage = function(){
  tree.loadFromLocalStorage()
  .then(
    payload => {
      dispatch({
        type: ActionTypes.FOLDER_LOADED,
        payload,
      })
    }
  )
}


const saveToLocalStorage = function(){
  tree.saveToLocalStorage(store.getState())
}


const openFolder = function(id){
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
        type: ActionTypes.ERROR_OPENING_FOLDER,
        payload
      })
    }
  )
}


const deleteFile = function(file_id, current_folder_id){
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
        type: ActionTypes.ERROR_DELETING_FILE,
        payload
      })
    }
  )
}


const deleteFolder = function(folder_id, current_folder_id){
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
        type: ActionTypes.ERROR_DELETING_FOLDER,
        payload
      })
    }
  )
}


const cutFiles = function(){
  dispatch({
    type: ActionTypes.CUT_FILES,
  })
}


const pasteFiles = function(files, current_folder_id){
  // ui state action here?

  tree.moveFiles(files, current_folder_id)
  .then(
    payload => {
      dispatch({
        type: ActionTypes.FILES_MOVED,
        payload,
      })
    },
    payload => {
      dispatch({
        type: ActionTypes.ERROR_MOVING_FILES,
        payload
      })
    }
  )
}


const cancelCutAndPasteFiles = function(){
  dispatch({
    type: ActionTypes.CANCEL_CUT_AND_PASTE_FILES,
  })
}


const upload = function(file_list, current_folder){
  file_list = Array.from(file_list)
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
        type: ActionTypes.ERROR_UPLOADING_FILE,
        payload
      })
    }
  )
}


const addFolder = function(folder_name, current_folder_id){
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
        type: ActionTypes.ERROR_ADDING_FOLDER,
        payload
      })
    }
  )
}


const restoreFromRecycleBin = function(current_folder_id){
  tree.restoreRecycleBin(current_folder_id)
  .then(
    payload => {
      dispatch({
        type: ActionTypes.FOLDER_LOADED,
        payload,
      })
    }
  )
}


let timer = null
let userActions = []
const bufferTime = 2500 // buffering time in milliseconds
const bufferUserActions = function(func, args){
  userActions.push({
    func,
    args,
  })
  if(timer === null){
    timer = setTimeout(() => {
      chainPromises(
        0,
        userActions,
        payload =>{
          console.log(payload)
        },
        error => {
          console.log(error)
        }
      )
      timer = null
    }, bufferTime)
  }
}


export default {
  openFolder(...args){
    bufferUserActions(openFolder, args)
  },
  addFolder(...args){
    bufferUserActions(addFolder, args)
  },
  deleteFolder(...args){
    bufferUserActions(deleteFolder, args)
  },
  deleteFile(...args){
    bufferUserActions(deleteFile, args)
  },
  upload(...args){
    bufferUserActions(upload, args)
  },
  saveToLocalStorage,
  restoreFromRecycleBin,
  cutFiles,
  pasteFiles,
  cancelCutAndPasteFiles,
  cacheSelectedFiles,
  loadFromLocalStorage,
  selectFile,
}
