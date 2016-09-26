/**
 * The cache stores data that has been retrieved from the server. For instance
 * if a user opens a folder for the first time, its contents will be loaded from
 * the server and stored in the cache. The next time the user request this
 * folder, its contents will be loaded from the cache (unless the contents has
 * been invalidated, which is not yet implemented).
 *
 * If data is needed from the server, the cache calls the server api {@link
 * ./api.js}. The server api is exclusively called from the cache; as such the
 * cache sits between the user actions requesting data and the server.
 *
 * The success callback of the api typically returns an array of files and/or
 * folders
 *
 * @see        the description of the file and folder objects here {@link ./api.js}
 *
 * The error callback returns an Array of error messages. The cache turns these
 * messages into an error object that can be processed by the error component
 * {@link ./components/error.react.js}.
 *
 * An error object looks like so:
 */

/**
 * @typedef    {Object}    Errors
 * @property   {Number}    id        Unique id for every error
 * @property   {String}    type      Type of the error, can be omitted for a
 *                                   generic error, else you can use the same
 *                                   constants as used by the Actions {@link ../constants.js}
 * @property   {String}    data      Can be omitted or a string representing
 *                                   anything; for instance in case the contents
 *                                   of a folder can not be loaded you can the
 *                                   data key to the name of that folder.
 * @property   {String[]}  messages  The error messages sent by the server
 */

import api from './api'
import {getUID} from './util'
import * as Constants from './constants'
import {getLocalState, storeLocal} from './local_storage'

let tree
let all_files
let all_folders
let current_folder_id


/**
 * Utility function that removes files from all folders that contain these
 * files: if a file exists in multiple folders, it will be removed in all of
 * these folders.
 *
 * @param      {String[]}  file_ids           The ids oft the files that need to
 *                                            be removed.
 * @param      {Number}    exclude_folder_id  The id of a folder that should be
 *                                            skipped; files in this folder will
 *                                            not be removed. May be left
 *                                            undefined. Note that if you set it
 *                                            to null, the root folder will be
 *                                            skipped since the id of the root
 *                                            folder is null (not: "null"!)
 */

const removeFilesFromFolders = function(file_ids, exclude_folder_id){
  Object.keys(tree).forEach(folder_id => {
    if(folder_id !== exclude_folder_id){
      let folder = tree[folder_id]
      file_ids.forEach(id => {
        let index = folder.file_ids.indexOf(id)
        if(index !== -1){
          folder.file_ids.splice(index, 1)
          folder.file_count--
        }
      })
    }
  })
}


/**
 * The init folder hydrates the initial states of the reducers. If data is
 * stored in the local storage it will be loaded into the states of the relevant
 * reducers. Otherwise the states will be hydrated with default values.
 *
 * @see        the code of the reducers in the reducers folder
 */
const init = function(){
  ({
    tree,
    all_files,
    all_folders,
    current_folder_id,
  } = getLocalState())

  return current_folder_id
}


/**
 * Loads a folder. If the contents of this folder has been cached, the contents
 * will be loaded from cache, otherwise the contents will be loaded from the
 * server.
 *
 * @param      {Number}   folder_id  The id of the folder whose contents needs
 * @return     {Promise}  A promise that rejects with an Array of error objects
 *                        or resolves with the necessary data, see below.
 */
const loadFolder = function(folder_id){
  return new Promise((resolve, reject) => {
    let current_folder = {...all_folders[folder_id]}
    current_folder_id = folder_id
    storeLocal({current_folder_id})

    let tree_folder = tree[folder_id]
    let parent_folder = null


    if(folder_id !== null){
      parent_folder = {...all_folders[all_folders[folder_id].parent]}
    }


    if(typeof tree_folder !== 'undefined' && tree_folder.needsUpdate === false){

      let files = tree_folder.file_ids.map(id => {
        let f = all_files[id]
        f.new = false
        return f
      })
      let folders = tree_folder.folder_ids.map(id => {
        let f = all_folders[id]
        f.new = false
        return f
      })

      /**
       * @typedef    {Object}    Argument passed to the resolved function
       * @param      {Object}    current_folder  Folder object of the current
       *                                         folder
       * @param      {?number}   parent_folder   The id of the parent folder,
       *                                         null if the parent folder is
       *                                         the root folder
       * @param      {Object[]}  files           Array containing objects
       *                                         representing all files in this
       *                                         folder
       * @param      {Object[]}  folders         Array containing objects
       *                                         representing all folders in
       *                                         this folder
       *
       * @see        description of file and folder object: {@link ./api.js}
       */
      resolve({
        current_folder,
        parent_folder,
        files,
        folders,
      })

    }else {

      api.openFolder(
        folder_id,
        (folders, files) => {

          tree_folder = {}
          tree_folder.needsUpdate = false
          tree_folder.folder_ids = []
          tree_folder.file_ids = []

          folders.forEach(f => {
            all_folders[f.id] = f
            tree_folder.folder_ids.push(f.id)
          })

          files.forEach(f => {
            all_files[f.id] = f
            tree_folder.file_ids.push(f.id)
          })

          tree[folder_id] = tree_folder
          storeLocal({tree}, {all_files}, {all_folders})

          resolve({
            current_folder,
            parent_folder,
            files,
            folders,
          })
        },
        messages => {
          let errors = [{
            id: getUID(),
            data: current_folder.name,
            type: Constants.ERROR_OPENING_FOLDER,
            messages
          }]
          reject({errors})
        }
      )
    }
  })
}


/**
 * Adds files to a folder. The files will be uploaded to the server and an array
 * of file objects representing these files will be returned
 *
 * @param      {Array}    file_list  FileList with all uploads converted to an
 *                                   Array
 * @param      {Number}   folder_id  The id of the folder where the files get
 *                                   stored.
 * @return     {Promise}  A promise that reject with an Array of error messages
 *                        or resolves with data, see below.
 */
const addFiles = function(file_list, folder_id){

  let tree_folder = tree[folder_id]

  return new Promise((resolve, reject) => {
    api.upload(file_list, folder_id,
      (rejected, files) => {

        files.forEach(f => {
          all_files[f.id] = f
          tree_folder.file_ids.push(f.id)
          f.new = true
        })

        let errors = Object.keys(rejected).map(key => ({
          id: getUID(),
          type: Constants.ERROR_UPLOADING_FILE,
          data: key,
          messages: rejected[key]
        }))

        let file_count = tree_folder.file_ids.length
        all_folders[folder_id].file_count = file_count

        storeLocal({tree}, {all_files}, {all_folders})

        /**
         * @typedef    {Object}    Data returned by resolve function
         * @param      {Number}    file_count  Updated number of files in this
         *                                     folder
         * @param      {Object[]}  files       Array containing file objects
         *                                     representing the uploaded files
         * @param      {String[]}  error       Array containing error messages
         *                                     for the files that could not be
         *                                     uploaded, for instance because
         *                                     they were too large or of an
         *                                     unsupported file format
         */
        resolve({
          file_count,
          files,
          errors,
        })
      },
      error => {
        //console.log(error)
        let errors = []
        Array.from(file_list).forEach(f => {
          errors.push({
            id: getUID(),
            type: Constants.ERROR_UPLOADING_FILE,
            data: f.name,
            messages: error
          })
        })
        reject({errors})
      }
    )
  })
}


const moveFiles = function(files, folder_id){
  let tree_folder = tree[folder_id]

  return new Promise((resolve, reject) => {

    let file_ids = files.map(file => {
      return file.id
    })

    api.paste(file_ids, folder_id,
      () => {
        files.forEach(f => {
          f.new = true
          tree_folder.file_ids.push(f.id)
        })
        let file_count = tree_folder.file_ids.length
        all_folders[folder_id].file_count = file_count

        removeFilesFromFolders(file_ids, folder_id)
        storeLocal({tree}, {all_folders})

        resolve({
          file_count,
          files,
        })
      },
      messages => {
        let errors = files.map(file => ({
          id: getUID(),
          data: file.name,
          type: Constants.ERROR_MOVING_FILES,
          messages
        }))
        reject({errors})
      }
    )
  })
}


const deleteFile = function(file_id, folder_id){
  let tree_folder = tree[folder_id]

  return new Promise((resolve, reject) => {
    api.deleteFile(file_id,
      () => {

        let files = []
        let file_ids = []
        tree_folder.file_ids.forEach(id => {
          if(id !== file_id){
            files.push(all_files[id])
            file_ids.push(id)
          }
        })
        let file_count = file_ids.length
        tree_folder.file_ids = file_ids
        all_folders[folder_id].file_count = file_count

        delete all_files[file_id]
        storeLocal({tree}, {all_files}, {all_folders})
        resolve({
          file_count,
          files,
        })
      },
      messages => {
        let file = all_files[file_id]
        let errors = [{
          id: getUID(),
          data: file.name,
          type: Constants.ERROR_DELETING_FILE,
          messages
        }]
        reject({errors})
      }
    )
  })
}


const addFolder = function(folder_name, parent_folder_id){
  let tree_folder = tree[parent_folder_id]

  return new Promise((resolve, reject) => {
    api.addFolder(folder_name, parent_folder_id,
      (folders, error_messages) => {

        folders.forEach(f => {
          all_folders[f.id] = f
          tree_folder.folder_ids.push(f.id)
          f.new = true
        })

        let folder_count = tree_folder.folder_ids.length
        tree_folder.folder_count = folder_count
        all_folders[parent_folder_id].folder_count = folder_count
        storeLocal({tree}, {all_folders})

        let errors = []
        if(error_messages.length > 0){
          errors = [{
            id: getUID(),
            data: folder_name,
            type: Constants.ERROR_ADDING_FOLDER,
            messages: error_messages
          }]
        }

        resolve({
          folder_count,
          folders,
          errors,
          //errors: [{id: 7777, type: 'generic', messages: ['oh my, this is an error!']}]
        })
      },
      messages => {
        let errors = [{
          id: getUID(),
          data: folder_name,
          type: Constants.ERROR_ADDING_FOLDER,
          messages
        }]
        reject({errors})
      }
    )
  })
}


const deleteFolder = function(folder_id, parent_folder_id){
  let tree_folder = tree[parent_folder_id]

  return new Promise((resolve, reject) => {
    api.deleteFolder(folder_id,
      () => {
        let folders = []
        let folder_ids = []
        tree_folder.folder_ids.forEach(id => {
          if(id !== folder_id){
            folders.push(all_folders[id])
            folder_ids.push(id)
          }
        })
        let folder_count = folder_ids.length
        tree_folder.folder_ids = folder_ids
        all_folders[parent_folder_id].folder_count = folder_count

        delete all_folders[folder_id]
        storeLocal({tree}, {all_folders})

        resolve({
          folder_count,
          folders,
        })
      },
      message => {
        let folder = 'no name'
        if(folder_id){
          folder = all_folders[folder_id]
          if(typeof folder !== 'undefined'){
            folder = folder.name
          }
        }
        let errors = [{
          id: getUID(),
          type: Constants.ERROR_DELETING_FOLDER,
          data: folder,
          messages: [message]
        }]
        reject({errors})
      }
    )
  })
}


const getItemCount = function(folder_id){
  let folder = tree[folder_id]
  return folder.file_ids.length + folder.folder_ids.length
}


const getFileById = function(id){
  for(let file_id of Object.keys(all_files)){
    file_id = parseInt(file_id, 10)
    if(file_id === id){
      return all_files[file_id]
    }
  }
  return null
}


const getFilesByIds = function(ids){
  let result = []
  ids.forEach(id => {
    let file = getFileById(id)
    if(file !== null){
      result.push(file)
    }
  })
}


export default {
  init,
  loadFolder,
  addFiles,
  moveFiles,
  deleteFile,
  addFolder,
  deleteFolder,
  getItemCount,
  getFilesByIds,
  getFileById,
}
