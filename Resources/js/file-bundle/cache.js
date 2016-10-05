/**
 * The cache stores data that has been retrieved from the server. For instance
 * if a user opens a folder for the first time, its contents will be loaded from
 * the server and stored in the cache. The next time the user request this
 * folder, its contents will be loaded from the cache (unless the contents has
 * been invalidated, which is not yet implemented).
 *
 * If data is needed from the server, the cache calls the server api. The server
 * api is exclusively called from the cache; as such the cache sits between the
 * user actions requesting data and the server.
 *
 * The success callback of the api typically returns an array of files and/or
 * folders
 *
 * @see        the description of the {@link FileDescr File} and {@link FolderDescr Folder}
 *
 * The API return errors as an array of error messages, the cache turns
 * these messages into an error object that can be processed by the error
 * component.
 *
 * An error object looks like so:
 */
/**
 * @name       APIError
 * @type       {Object}
 * @property   {Number}    id        Unique id for every error
 * @property   {String}    type      Type of the error, can be omitted for a
 *                                   generic error, ohterwise you can use the
 *                                   same constants as used by the Actions, see
 *                                   ./constants.js
 * @property   {String}    data      Can be omitted or a string representing
 *                                   anything; for instance in case the contents
 *                                   of a folder can not be loaded the data key
 *                                   could de the name of that folder.
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
 * @return     {?number}  The id of the lastly opened folder, this id is retrieved
 *                        from local storage. If not set, the id will default to
 *                        null, which means the top root folder will be opened
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
 * @name       openFolderResolve
 * @type       {Object}
 * @param      {Object}   current_folder  Data object that describes the
 *                                        currently opened folder such as number
 *                                        of files and folders, creation date
 *                                        and so on.
 * @param      {?number}  parent_folder   Id of the parent folder, will be null
 *                                        if the parent folder is the top root
 *                                        folder.
 * @param      {Array}    files           Array containing File data objects for
 *                                        each file in the current folder. The
 *                                        data objects describe the file (name,
 *                                        creation date, size, etc.)
 * @param      {Array}    folders         Array containing Folder data objects
 *                                        for each folder in the current folder.
 *                                        The data objects describe the folder
 *                                        (name, number of files and folders,
 *                                        parent folder, etc.) describe the
 *                                        folder
 * @param      {Array}    selected        Array containing data objects for each
 *                                        file that is selected in the current
 *                                        folder.
 *
 * @see        the description of the {@link FileDescr File} and {@link FolderDescr Folder}
 */
/**
 * Loads a folder. If the contents of this folder has been cached, the contents
 * will be loaded from cache, otherwise the contents will be loaded from the
 * server.
 *
 * @param      {Number}   folder_id  The id of the folder whose contents needs
 * @return     {Promise}  {@link openFolderResolve resolve} {@link APIError
 *                        reject}
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
 * @name       uploadResolve
 * @type       {Object}
 * @param      {number}    file_count  Updated number of files in the current
 *                                     folder
 * @param      {Object[]}  files       Array containing {@link FileDescr File}
 *                                     objects representing the newly uploaded
 *                                     files.
 * @param      {string[]}  error       Array containing error messages for the
 *                                     files that could not be uploaded, for
 *                                     instance because they were too large or
 *                                     of an unsupported file format.
 */
/**
 * Adds files to a folder. The files will be uploaded to the server and an array
 * of file objects representing these files will be returned
 *
 * @param      {Array}    file_list  FileList with all uploads converted to an
 *                                   Array
 * @param      {Number}   folder_id  The id of the folder where the files get
 *                                   stored.
 * @return     {Promise}  promise {@link uploadResolve resolve} {@link APIError
 *                        reject}
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


/**
 * @name       pasteFilesResolve
 * @type       {Object}
 * @param      {Array}   files       Array containing the {@link FileDescr File}
 *                                   objects representing the files in the
 *                                   current folder.
 * @param      {number}  file_count  The number of files in the current folder
 */
/**
 * Move file(s) to another folder
 *
 * @param      {Array<number>}  files      Array containing the ids of the files
 *                                         to be moved
 * @param      {?number}        folder_id  The id of the folder where the files
 *                                         will be moved to
 * @return     {Promise}        {@link pasteFilesResolve resolve} {@link
 *                              APIError reject}
 */
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

/**
 * @typedef    {Object}  deleteFileResolve
 *
 * @property   {number}  file_count  The number of the files in the folder.
 * @property   {Array}   files       Array containing the {@link FileDescr File}
 *                                   object of the files in the folder.
 */
/**
 * Deletes a single file
 *
 * @param      {number}   file_id    The id of the file to be deleted
 * @param      {?number}  folder_id  The id of the folder that contains the file
 * @return     {Promise}  {@link deleteFileResolve resolve} {@link APIError
 *                        reject}
 */
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

/**
 * @name       addFolderResolve
 * @type       {object}
 * @param      {number}    folder_count  The number of folders in the current
 *                                       folder, inclusive the new folder
 * @param      {Array}     folders       Array containing the {@link FolderDescr
 *                                       Folder} objects representing the
 *                                       folders in the current folder
 * @param      {string[]}  error         Array containing error messages, only
 *                                       when the server had yielded errors
 */
/**
 * Creates a new emtpy folder in the current folder
 *
 * @param      {string}   folder_name       The name of the new folder.
 * @param      {?number}  parent_folder_id  The id of the parent folder (the
 *                                          current folder).
 * @return     {Promise}  promise {@link addFolderResolve resolve} {@link
 *                        APIError reject}
 */
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

/**
 * @name       deleteFolderResolve
 * @type       {Object}  deleteFolderResolve
 * @param      {number}  folder_count  The number of folders still left in the
 *                                     current folder
 * @param      {Array}   folders       Array containing the {@link FolderDescr
 *                                     Folder} objects in the current folder
 */
/**
 * Deletes an emptied folder
 *
 * @param      {number}   folder_id         The id of the folder to be deleted
 * @param      {?number}  parent_folder_id  The id of the parent folder
 * @return     {Promise}  {@link deleteFolderResolve resolve} {@link APIError
 *                        reject}
 */
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
