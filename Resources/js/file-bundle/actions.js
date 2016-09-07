import * as ActionTypes from './constants'
import getStore from './get_store'
import tree from './tree'
import {chainPromises} from './util'

const store = getStore()
const dispatch = store.dispatch
const bufferTime = 0 // buffering time in milliseconds
let timer = null
let userActions = {}

const selectFile = function(data){
  dispatch({
    type: ActionTypes.SELECT_FILE,
    payload: {
      selected: tree.setSelectedFiles(data)
    },
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
        type: ActionTypes.FOLDER_OPENED,
        payload,
      })
    },
    payload => {
      dispatch({
        type: ActionTypes.ERROR_OPENING_FOLDER,
        payload,
      })
    }
  )
}


const openFolder = function(id){
  dispatch({
    type: ActionTypes.OPEN_FOLDER,
    payload: {id}
  })

  tree.loadFolder(id)
  .then(
    payload => {
      dispatch({
        type: ActionTypes.FOLDER_OPENED,
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
        type: ActionTypes.FOLDER_OPENED,
        payload,
      })
    }
  )
}


const deleteFolders = function(ids, currentFolder){

  if(ids instanceof Array === false){
    ids = [ids]
  }

  let promises = []
  ids.forEach(id => {
    promises.push({
      id: ActionTypes.DELETE_FOLDER,
      func: tree.deleteFolder,
      args: [id, currentFolder],
    })
  })

  chainPromises(0, promises,
    (values, errors) => {
      //console.log(values, errors)
      let data = values[values.length - 1]

      let err = []
      errors.forEach(obj => {
        err.push(...obj.errors)
      })

      dispatch({
        type: ActionTypes.FOLDER_DELETED,
        payload: {
          folder_count: data.folder_count,
          folders: data.folders,
          errors,
        }
      })
    },
    errors => {
      let err = []
      errors.forEach(obj => {
        err.push(...obj.errors)
      })
      dispatch({
        type: ActionTypes.ERROR_DELETING_FOLDER,
        payload: {errors: err}
      })
    }
  )
}


const deleteFiles = function(ids, currentFolder){

  if(ids instanceof Array === false){
    ids = [ids]
  }

  let promises = []
  ids.forEach(id => {
    promises.push({
      id: ActionTypes.DELETE_FILE,
      func: tree.deleteFile,
      args: [id, currentFolder],
    })
  })

  chainPromises(0, promises,
    (values, errors) => {
      //console.log(values, errors)
      let data = values[values.length - 1]

      let err = []
      errors.forEach(obj => {
        err.push(...obj.errors)
      })

      dispatch({
        type: ActionTypes.FILE_DELETED,
        payload: {
          file_count: data.file_count,
          files: data.files,
          errors,
        }
      })
    },
    errors => {
      let err = []
      errors.forEach(obj => {
        err.push(...obj.errors)
      })
      dispatch({
        type: ActionTypes.ERROR_DELETING_FILE,
        payload: {errors: err}
      })
    }
  )
}


const addFolders = function(folders){
  let promises = []
  folders.forEach(folder => {
    promises.push({
      id: ActionTypes.ADD_FOLDER,
      func: tree.addFolder,
      args: folder
    })
  })

  chainPromises(0, promises,
    (values, errors) => {
      //console.log(values, errors)

      folders = []
      let folder_count = 0
      values.forEach(value => {
        folders.push(...value.folders)
        folder_count += value.folder_count
      })

      let err = []
      errors.forEach(obj => {
        err.push(...obj.errors)
      })

      dispatch({
        type: ActionTypes.FOLDER_ADDED,
        payload: {
          folders,
          folder_count,
          errors: err,
        }
      })
    },
    errors => {
      let err = []
      errors.forEach(obj => {
        err.push(...obj.errors)
      })
      dispatch({
        type: ActionTypes.ERROR_ADDING_FOLDER,
        payload: {errors: err}
      })
    }
  )
}


const changeSorting = function(payload){
  dispatch({
    type: ActionTypes.CHANGE_SORTING,
    payload,
  })
}


const dismissError = function(error_id){
  dispatch({
    type: ActionTypes.DISMISS_ERROR,
    payload: {error_id},
  })
}


const showPreview = function(image_url){
  dispatch({
    type: ActionTypes.SHOW_PREVIEW,
    payload: {image_url},
  })
}


const confirmDelete = function(id){
  dispatch({
    type: ActionTypes.CONFIRM_DELETE,
    payload: {id},
  })
}


const setHover = function(diff, folder_id){
  let max = tree.getItemCount(folder_id)
  dispatch({
    type: ActionTypes.SET_HOVER,
    payload: {diff, max},
  })
}

// filepicker mode
const expandBrowser = function(){
  dispatch({
    type: ActionTypes.EXPAND_BROWSER,
  })
}


const bufferUserActions = function(type, args){

  if(type === ActionTypes.UPLOAD_START && typeof userActions[type] !== 'undefined'){
    let file_list1 = Array.from(userActions[type][0])
    let file_list2 = Array.from(args[0])
    userActions[type][0] = [...file_list1, ...file_list2]

  }else if((type === ActionTypes.DELETE_FILE || type === ActionTypes.DELETE_FOLDER) && typeof userActions[type] !== 'undefined'){
    if(userActions[type][0] instanceof Array === false){
      userActions[type][0] = [userActions[type][0]]
    }
    userActions[type][0].push(args[0])
    console.log('scheduled for deletion:', userActions[type][0])

  }else if(type === ActionTypes.ADD_FOLDER){
    if(typeof userActions[type] === 'undefined'){
      userActions[type] = []
    }
    userActions[type].push(args)
    console.log('adding folders:', userActions[type])

  }else {
    userActions[type] = args
  }

  if(timer === null){
    timer = setTimeout(() => {
      Object.keys(userActions).forEach(actiontype => {

        switch(actiontype){
          case ActionTypes.OPEN_FOLDER:
            openFolder(...userActions[actiontype])
            break

          case ActionTypes.ADD_FOLDER:
            addFolders(userActions[actiontype])
            break

          case ActionTypes.DELETE_FOLDER:
            deleteFolders(...userActions[actiontype])
            break

          case ActionTypes.UPLOAD_START:
            upload(...userActions[actiontype])
            break

          case ActionTypes.DELETE_FILE:
            deleteFiles(...userActions[actiontype])
            break

          default:
            // let's take a walk into the woods
        }
      })
      userActions = {}
      timer = null
    }, bufferTime)
  }
}

export default {
  openFolder(...args){
    bufferUserActions(ActionTypes.OPEN_FOLDER, args)
  },
  addFolder(...args){
    // @todo: implement creating of multiple folders serverside
    bufferUserActions(ActionTypes.ADD_FOLDER, args)
  },
  deleteFolder(...args){
    // @todo: implement deletion of multiple folders serverside
    bufferUserActions(ActionTypes.DELETE_FOLDER, args)
  },
  upload(...args){
    bufferUserActions(ActionTypes.UPLOAD_START, args)
  },
  deleteFile(...args){
    // @todo: implement deletion of multiple files serverside
    bufferUserActions(ActionTypes.DELETE_FILE, args)
  },
  restoreFromRecycleBin,
  cutFiles,
  pasteFiles,
  cancelCutAndPasteFiles,
  cacheSelectedFiles,
  loadFromLocalStorage,
  selectFile,
  changeSorting,
  dismissError,
  showPreview,
  confirmDelete,
  expandBrowser,
  setHover,
}


/*
  const deleteMultiple = function(actiontype, ids, currentFolder){
  let actionSuccess
  let actionError
  let func
  if(actiontype === ActionTypes.DELETE_FOLDER){
    actionSuccess = ActionTypes.FOLDER_DELETED
    actionError = ActionTypes.ERROR_DELETING_FOLDER
    func = tree.deleteFolder
  }else if(actiontype === ActionTypes.DELETE_FILE){
    actionSuccess = ActionTypes.FILE_DELETED
    actionError = ActionTypes.ERROR_DELETING_FILE
    func = tree.deleteFile
  }

  if(ids instanceof Array === false){
    ids = [ids]
  }
  let promises = []
  ids.forEach(id => {
    promises.push({
      id: actiontype,
      func,
      args: [id, currentFolder],
    })
  })
  chainPromises(0, promises,
    (values, errors) => {
      console.log(values, errors)

      let folders = []
      let folder_count = 0
      values.forEach(value => {
        folders.push(...value.folders)
        folder_count += value.folder_count
      })

      let files = []
      let file_count = 0
      values.forEach(value => {
        folders.push(...value.files)
        file_count += value.file_count
      })

      let err = []
      errors.forEach(obj => {
        err.push(...obj.errors)
      })

      dispatch({
        type: actionSuccess,
        payload: {
          values,
          errors,
        }
      })
    },
    errors => {
      let err = []
      errors.forEach(obj => {
        err.push(...obj.errors)
      })
      dispatch({
        type: actionError,
        payload: {errors: err}
      })
    }
  )
}
*/

