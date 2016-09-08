import api from './api'
import {getUID} from './util'
import * as Constants from './constants'
import {getLocalState, storeLocal} from './local_storage'

let tree
let all_files
let all_folders
let selected
let current_folder_id

const folderProps = [
  'create_ts',
  'created',
  'file_count',
  'folder_count',
  'id',
  'name',
  'parent',
  'size',
  'size_bytes',
  'thumb',
  'type',
]


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
 * Loads a folder.
 *
 * @param      {Number}   folder_id  The folder identifier
 * @return     {Promise}  { description_of_the_return_value }
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
        selected
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
            selected
          })
        },
        messages => {
          let errors = [{
            id: getUID(),
            folder: current_folder.name,
            type: Constants.ERROR_OPENING_FOLDER,
            messages
          }]
          reject({errors})
        }
      )
    }
  })
}


const loadFromLocalStorage = function(){
  ({
    tree,
    all_files,
    all_folders,
    selected,
    current_folder_id,
  } = getLocalState())

  return loadFolder(current_folder_id)
}


const setSelectedFiles = function(data){
  let {
    id,
    browser,
    multiple,
  } = data

  let file = null
  let index = selected.findIndex(f => {
    return f.id === id
  })

  id = parseInt(id, 10)

  if(index === -1){
    for(let file_id of Object.keys(all_files)){
      //console.log(typeof file_id)
      file_id = parseInt(file_id, 10)
      if(file_id === id){
        file = all_files[file_id]
        break
      }
    }
  }


  if(browser === false && multiple === false){
    if(index === -1){
      selected = [file]
    }else{
      selected = []
    }
  }else if(index === -1){
    selected.push(file)
  }else{
    selected.splice(index, 1)
  }

  storeLocal({selected})
  return [...selected]

  // let a = selected.map(f => {
  //   return f.id
  // })
  // console.log(id, a)
}


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
          file: key,
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
            file: f.name,
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
          file: file.name,
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
          file: file.name,
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
            folder: folder_name,
            type: Constants.ERROR_ADDING_FOLDER,
            messages: error_messages
          }]
        }

        resolve({
          folder_count,
          folders,
          errors,
        })
      },
      messages => {
        let errors = [{
          id: getUID(),
          folder: folder_name,
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
          folder,
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


export default {
  loadFromLocalStorage,
  loadFolder,
  addFiles,
  moveFiles,
  deleteFile,
  addFolder,
  deleteFolder,
  setSelectedFiles,
  getItemCount,
}
