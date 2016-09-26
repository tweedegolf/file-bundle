import * as ActionTypes from './constants'
import getStore from './get_store'
import cache from './cache'

const store = getStore()
const dispatch = store.dispatch


/**
 * Adds a file id to the selected file ids array in the tree state.
 *
 * @param      {Object}   data           argument
 * @property   {boolean}  data.browser   If false the tool is in Filepicker mode.
 * @property   {boolean}  data.multiple  If false, user may only select one file
 *                                       at the time.
 * @property   {number}   data.id        The id of a file file; if that id is
 *                                       not already stored in the tree state,
 *                                       the file will be selected. If an id is
 *                                       already stored in the tree state, the
 *                                       corresponding file will be deselected.
 */
const selectFile = function(data){
  dispatch({
    type: ActionTypes.SELECT_FILE,
    payload: {...data}
  })
}

/**
 * Called from the componentDidMount function in the main container: {@link
 * ./containers/browser.react.js}
 *
 * Only used in Filepicker mode: you can add an array of file ids to the HTML
 * element's dataset; this array is passed as argument.
 *
 * @param      {?Array}  selected  The ids of the files that will be selected.
 */
const init = function(selected = null){
  if(selected !== null){
    dispatch({
      type: ActionTypes.SELECT_FILES,
      payload: {
        selected
      }
    })
  }
  /**
   * currentFolderId is the id of the lastly opened folder, this id is retrieved
   * from local storage. If not set, currentFolderId will default to null, which
   * means the top root folder will be opened
   *
   * @type       {?number}
   */
  let currentFolderId = cache.init()
  openFolder(currentFolderId)
}


/**
 * Try to load the contents of the folder with the specified id. This triggers
 * an API call if data is not already available in local storage.
 *
 * @param      {?number}  id              The id of the folder, the top root
 *                                        folder has id null
 *
 * The resolve function returns a payload object that contains the following
 * keys:
 * @typedef    {Object}   payload
 * @property   {Object}   current_folder  Data object that describes the
 *                                        currently opened folder such as number
 *                                        of files and folders, creation date
 *                                        and so on.
 * @property   {?number}  parent_folder   Id of the parent folder, will be null
 *                                        if the parent folder is the top root
 *                                        folder.
 * @property   {Array}    files           Array containing File data objects for
 *                                        each file in the current folder. The
 *                                        data objects describe the file (name,
 *                                        creation date, size, etc.)
 * @property   {Array}    folders         Array containing Folder data objects
 *                                        for each folder in the current folder.
 *                                        The data objects describe the folder
 *                                        (name, number of files and folders,
 *                                        parent folder, etc.) describe the
 *                                        folder
 * @property   {Array}    selected        Array containing data objects for each
 *                                        file that is selected in the current
 *                                        folder.
 *
 * @see         {@link ./api.js} for a description of the File and Folder objects
 */
const openFolder = function(id){
  dispatch({
    type: ActionTypes.OPEN_FOLDER,
    payload: {id}
  })

  cache.loadFolder(id)
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


/**
 * Deletes a single file from a folder. Triggers an API call.
 *
 * @param      {number}   file_id            The id of the file that will be
 *                                           deleted
 * @param      {?number}  current_folder_id  The id of the folder that contains
 *                                           the file that will be deleted
 *
 * The resolve function returns a payload object that contains the following
 * keys:
 * @property   {number}   file_count         The number of the files in the
 *                                           folder
 * @property   {Array}    files              Array containing the File object of
 *                                           the files in the folder
 *
 * @see         {@link ./api.js} for a description of the File object
 */
const deleteFile = function(file_id, current_folder_id){
  dispatch({
    type: ActionTypes.DELETE_FILE,
    payload: {file_id}
  })

  cache.deleteFile(file_id, current_folder_id)
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

/**
 * Deletes an empty folder. Triggers an API call.
 *
 * @param      {number}  folder_id             The id of the folder that will be
 *                                             deleted
 * @param      {number}  current_folder_id     The id of the current folder,
 *                                             i.e. the parent folder of the
 *                                             folder that will be deleted
 *
 * @typedef    {Object}  payload object returned by resolve function
 * @property   {number}  payload.folder_count  The number of folders still left
 *                                             in the current folder
 * @property   {Array}   payload.folders       Array containing the Folder
 *                                             objects in the current folder
 *
 * @see         {@link ./api.js} for a description of the Folder object
 */
const deleteFolder = function(folder_id, current_folder_id){
  dispatch({
    type: ActionTypes.DELETE_FOLDER,
    payload: {folder_id}
  })


  cache.deleteFolder(folder_id, current_folder_id)
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

/**
 * Cut files, i.e. move the currently selected files to the clipboard
 */
const cutFiles = function(){
  dispatch({
    type: ActionTypes.CUT_FILES,
  })
}

/**
 * @typedef {Object} PayloadPasteFiles
 * @property {Array} files Array containing the File objects representing the files in the current folder.
 * @property {number} file_count The number of files in the current folder
 *
 * @see {@link ./api.js} for a description of the File object
 */

/**
 * Paste files, i.e. move the files in the clipboard to another folder. This
 * triggers an API call.
 *
 * @param      {Array}    files              Array containing the File objects
 *                                           representing the files that will be
 *                                           moved
 * @param      {?number}  current_folder_id  The id of the current folder, i.e.
 *                                           where the files will be moved to.
 *
 *
 * @return     {Promise<PayloadPasteFiles|Errors>}  Resolves with a payload object
 *                                                  or rejects with errors
 */
const pasteFiles = function(files, current_folder_id){
  // dispatch ui state action here?

  cache.moveFiles(files, current_folder_id)
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

/**
 * Move files in clipboard array back to the selected array
 */
const cancelCutAndPasteFiles = function(){
  dispatch({
    type: ActionTypes.CANCEL_CUT_AND_PASTE_FILES,
  })
}

/**
 * Uploads new files to the server. Triggers an API call.
 *
 * @param      {Array}    file_list       The FileList converted to Array
 *                                        containing all the files that will be
 *                                        uploaded
 * @param      {?number}  current_folder  The id of the folders where the files
 *                                        will be added to after they are
 *                                        uploaded
 */
const upload = function(file_list, current_folder){
  file_list = Array.from(file_list)
  dispatch({
    type: ActionTypes.UPLOAD_START,
    payload: {file_list}
  })

  cache.addFiles(file_list, current_folder)
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

/**
 * @typedef {object} PayloadAddFolder
 * @property {number} folder_count The number of folders in the current folder, inclusive the new folder
 * @property {Array} folders Array containing the Folder objects representing the folders in the current folder
 * @property {string[]} error Array containing error messages, only when the server had yielded errors
 */
/**
 * Adds a new folder to the current folder
 * @param {string} folder_name The name of the new folder
 * @param {?number} current_folder_id The id of the the current folder, i.e. the folder that will contain the new folder
 * @return {Promise<PayloadAddFolder|Errors>}
 */
const addFolder = function(folder_name, current_folder_id){
  dispatch({
    type: ActionTypes.ADD_FOLDER,
  })

  cache.addFolder(folder_name, current_folder_id)
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

/**
 * User has clicked on the delete button of a file; this triggers a confirmation
 * popup. The file will only be deleted after the user's confirmation
 *
 * @param      {number}  id      The id of the file will be deleted after
 *                               confirmation
 */
const confirmDelete = function(id){
  dispatch({
    type: ActionTypes.CONFIRM_DELETE,
    payload: {id},
  })
}


const setHover = function(diff, folder_id){
  dispatch({
    type: ActionTypes.SET_HOVER,
    payload: {
      diff,
      max: cache.getItemCount(folder_id)
    }
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
