import * as ActionTypes from './constants'
import getStore from './get_store'
import tree from './tree'

const store = getStore()
const dispatch = store.dispatch

//
// Sometimes we need values from other reducers to calculate the new state of a
// certain reducer. An example a folder is opened: the state in the tree reducer
// will be updated with new files and/or folder, but we also need to sort them
// and therefor we need the values of 'sort' and 'ascending' from the state of
// the ui reducer.
//
// @param      {...String}  reducers  Comma separated list of reducer names
//                                    whose state we need to query
//
const getStates = function(...reducers){
  let state = store.getState()
  let results = {}

  reducers.forEach(r => {
    if(r === 'tree'){
      results.treeState = state.tree
    }else if(r === 'ui'){
      results.uiState = state.ui
    }
  })

  return results
}

const getState = function(reducer){
  return store.getState()[reducer]
}


/**
 * Adds ids to the selected file ids array in the tree state.
 *
 * @param      {Array}  data    Array containing file ids. The corresponding
 *                              file of an id that is not already stored in the
 *                              tree state, will be selected. If an id is
 *                              already stored in the tree state, the
 *                              corresponding file will be deselected.
 */
const selectFile = function(data){
  dispatch({
    type: ActionTypes.SELECT_FILE,
    payload: {
      selected: tree.setSelectedFiles(data)
    },
  })
}

//
// In browser mode: loads data from local storage into the tree state. If no
// data is found in the local storage default values will be used.
//
// In Filepicker mode: you can add an array of file ids to the HTML element's
// dataset; this array is passed as argument.
//
// @param      {Array}  selected  The ids of the files that will be seleceted
//                                (Filepicker mode)
//
const init = function(selected){
  let currentFolderId = tree.init(selected)
  openFolder(currentFolderId)
}


//
// Try to load the contents of the folder with the specified id.
//
// @param      {Number}  id              The id of the folder, the top root
//                                       folder has id null
//
// The resolve function returns a payload object that contains the following
// keys:
// @property   {Object}  current_folder  Data object that describes the
//                                       currently opened folder such as number
//                                       of files and folders, creation date and
//                                       so on.
// @property   {Number}  parent_folder   Id of the parent folder, will be null
//                                       if the parent folder is the top root
//                                       folder.
// @property   {Array}   files           Array containing data objects for each
//                                       file in the current folder. The data
//                                       objects describe the file (name,
//                                       creation date, size, etc.)
// @property   {Array}   folders         Array containing data objects for each
//                                       folder in the current folder. The data
//                                       objects describe the folder (name,
//                                       number of files and folders, parent
//                                       folder, etc.) describe the folder
// @property   {Array}   selected        Array containing data objects for each
//                                       file that is selected in the current
//                                       folder.
//
const openFolder = function(id){
  dispatch({
    type: ActionTypes.OPEN_FOLDER,
    payload: {id}
  })

  tree.loadFolder(id)
  .then(
    payload => {
      ({
        sort: payload.sort,
        ascending: payload.ascending,
      } = getState('ui'))

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
      ({
        sort: payload.sort,
        ascending: payload.ascending,
      } = getState('ui'))

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
      ({
        sort: payload.sort,
        ascending: payload.ascending,
      } = getState('ui'))

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
  // dispatch ui state action here?

  tree.moveFiles(files, current_folder_id)
  .then(
    payload => {
      ({
        sort: payload.sort,
        ascending: payload.ascending,
      } = getState('ui'))

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
      payload.sort = 'create_ts'
      payload.ascending = false
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
      ({
        sort: payload.sort,
        ascending: payload.ascending,
      } = getState('ui'))

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


const changeSorting = function(payload){
  // Check if the user has inverted the order of the current column, or has
  // chosen a different sorting column.
  let {
    sort,
    ascending,
  } = getState('ui')

  if(sort === payload.sort){
    ascending = !ascending
  }
  payload.ascending = ascending

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
  let hover = getState('ui').hover + diff
  let max = tree.getItemCount(folder_id)
  if(hover > max){
    hover = 0
  }else if(hover < 0){
    hover = max - 1
  }

  dispatch({
    type: ActionTypes.SET_HOVER,
    payload: {hover},
  })
}


const setScrollPosition = function(scroll){
  dispatch({
    type: ActionTypes.SET_SCROLL_POSITION,
    payload: {scroll}
  })
}


const expandBrowser = function(){
  dispatch({
    type: ActionTypes.EXPAND_BROWSER,
  })
}


export default {
  upload,
  deleteFile,
  openFolder,
  addFolder,
  deleteFolder,
  selectFile,
  cutFiles,
  pasteFiles,
  cancelCutAndPasteFiles,
  init,
  changeSorting,
  dismissError,
  showPreview,
  confirmDelete,
  expandBrowser,
  setHover,
  setScrollPosition,
}
