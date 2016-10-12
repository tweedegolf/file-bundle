import * as ActionTypes from './constants'
import getStore from './get_store'
import cache from './cache'

const store = getStore()
const dispatch = store.dispatch


/**
 * @name       SelectFileArg
 * @type       {Object}
 * @param      {boolean}  browser   If false the tool is in Filepicker mode.
 * @param      {boolean}  multiple  If false, user may only select one file at
 *                                  the time.
 * @param      {number}   id        The id of a file file; if that id is not
 *                                  already stored in the state, the file will
 *                                  be selected. If an id is already stored in
 *                                  the state, the corresponding file will be
 *                                  deselected.
 */
/**
 * Adds a file id to the selected file ids array in the state.
 *
 * @param {SelectFileArg} data Argument passed.
 */
const selectFile = function(data){
  dispatch({
    type: ActionTypes.SELECT_FILE,
    payload: {...data}
  })
}


/**
 * Initialisation function that hydrates the state from local storage or by
 * setting default values; called from the componentDidMount function in the
 * main container: <tt>./containers/browser.react.js</tt>
 *
 * @param      {?Array}  selected  The ids of the files that will be selected.
 *                                 Only used in Filepicker mode. You can add an
 *                                 array of file ids to the HTML element's
 *                                 dataset; this array is passed as argument.
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
  let currentFolderId = cache.init()
  openFolder(currentFolderId)
}


/**
 * Try to load the contents of the folder with the specified id. This triggers
 * an API call if data is not already available in local storage.
 *
 * @param      {?number}  id      The id of the folder, the top root folder has
 *                                id null
 * @return     {void}  dispatches actions
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
 *                                           deleted.
 * @param      {?number}  current_folder_id  The id of the folder that contains
 *                                           the file that will be deleted.
 * @return     {void}  dispatches actions
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
 * @param      {number}  folder_id          The id of the folder that will be
 *                                          deleted
 * @param      {number}  current_folder_id  The id of the current folder, i.e.
 *                                          the parent folder of the folder that
 *                                          will be deleted
 * @return     {void}  dispatches actions
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
 * Paste files, i.e. move the files in the clipboard to another folder. This
 * triggers an API call.
 *
 * @param      {Array}    files              Array containing the {@link
 *                                           FileDescr File} objects
 *                                           representing the files that will be
 *                                           moved
 * @param      {?number}  current_folder_id  The id of the current folder, i.e.
 *                                           where the files will be moved to.
 * @return     {void}  dispatches actions
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
 *                                        containing all the files as File
 *                                        instance that will be uploaded
 * @param      {?number}  current_folder  The id of the folders where the files
 *                                        will be added to after they are
 *                                        uploaded
 * @return     {void}  returns nothing
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
 * Adds a new folder to the current folder
 *
 * @param      {string}   folder_name        The name of the new folder
 * @param      {?number}  current_folder_id  The id of the the current folder,
 *                                           i.e. the folder that will contain
 *                                           the new folder
 * @return     {void}  returns nothing, dispatches actions
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


/**
 * Changes the sorting column or sorting order of the items in the browser list
 *
 * @param      {string}  sort    The sorting column; if this is the same as
 *                               current sorting column, the sorting order will
 *                               be reversed.
 */
const changeSorting = function(sort){
  dispatch({
    type: ActionTypes.CHANGE_SORTING,
    payload: {sort},
  })
}


/**
 * Dismiss an error popup.
 *
 * @param      {number}  error_id  The unique identifier of the error.
 */
const dismissError = function(error_id){
  dispatch({
    type: ActionTypes.DISMISS_ERROR,
    payload: {error_id},
  })
}


/**
 * Shows a preview of a file, currently only images are supported.
 *
 * @param      {string}  image_url  The url of the full size image.
 */
const showPreview = function(image_url){
  dispatch({
    type: ActionTypes.SHOW_PREVIEW,
    payload: {image_url},
  })
}


/**
 * User has clicked on the delete button of a file; this triggers a confirmation
 * popup. The file will only be deleted after the user's confirmation.
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


/**
 * User selects a file by using the arrow keys of the keyboard.
 *
 * @param      {number}   diff       Value is -1 if user has clicked the arrow
 *                                   down key and +1 if the arrow up key has
 *                                   been pressed.
 * @param      {?number}  folder_id  The id of the current folder; we need this
 *                                   id to get the number of items in this
 *                                   folder from the cache. The number of items
 *                                   is used to determine if we need to wrap
 *                                   around the selection, e.g. if the current
 *                                   selection is the last item in the list, and
 *                                   the user has pressed the arrow down button,
 *                                   the selection will wrap around resulting in
 *                                   the first item in the list being selected.
 */
const setHover = function(diff, folder_id){
  dispatch({
    type: ActionTypes.SET_HOVER,
    payload: {
      diff,
      max: cache.getItemCount(folder_id)
    }
  })
}


/**
 * Sets the scroll position of the browser list
 *
 * @param      {number}  scroll  The position of the list in pixels measured
 *                               from the top.
 */
const setScrollPosition = function(scroll){
  dispatch({
    type: ActionTypes.SET_SCROLL_POSITION,
    payload: {scroll}
  })
}


/**
 * In Filepicker mode the user sees a button to expand and collapse the browser.
 * In Browser mode the browser is always expanded.
 */
const expandBrowser = function(){
  dispatch({
    type: ActionTypes.EXPAND_BROWSER,
  })
}


// TODO: This is currently a named export. If we're going to name it,
// we might want to give it a more meaningful name than "default"
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
