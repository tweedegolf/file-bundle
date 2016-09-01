import api from './api'
import {chainPromises} from './util'
import * as Constants from './constants'


let tree = {}
let all_files = {}
let all_folders = {
  null: {
    id: null,
    name: '..',
  }
}
let recycle_bin = {
  files: [],
  folders: [],
}


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


// for parsing JSON, not needed for now
const reviver = function(k, v){
  let tmp = parseInt(v, 10)
  if(isNaN(tmp) === false){
    return tmp
  }else if(v === 'null'){
    return null
  }
  return v
}


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


const loadFolder = function(folder_id){
  return new Promise((resolve, reject) => {
    let recycle_bin_empty = recycle_bin.files.length === 0 && recycle_bin.folders.length === 0

    let tree_folder = tree[folder_id]
    let current_folder = {...all_folders[folder_id]}
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
        recycle_bin_empty,
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

          resolve({
            recycle_bin_empty,
            current_folder,
            parent_folder,
            files,
            folders
          })
        },
        messages => {
          let errors = [{
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

  return new Promise(resolve => {

    let tmp = localStorage.getItem('tree')
    let current_folder = {id: null}
    let selected = []

    if(tmp !== null){
      tree = JSON.parse(tmp)
      all_files = JSON.parse(localStorage.getItem('all_files'))
      all_folders = JSON.parse(localStorage.getItem('all_folders'))
      current_folder = JSON.parse(localStorage.getItem('current_folder'))
      selected = JSON.parse(localStorage.getItem('selected'))
      recycle_bin = JSON.parse(localStorage.getItem('recycle_bin'))
    }

    loadFolder(current_folder.id)
    .then(
      payload => {
        resolve({
          ...payload,
          selected,
        })
      }
    )
  })
}


const saveToLocalStorage = function(state){
  return
  localStorage.setItem('current_folder', JSON.stringify(state.tree.current_folder))
  localStorage.setItem('selected', JSON.stringify(state.tree.selected))
  localStorage.setItem('tree', JSON.stringify(tree))
  localStorage.setItem('all_files', JSON.stringify(all_files))
  localStorage.setItem('all_folders', JSON.stringify(all_folders))
  localStorage.setItem('recycle_bin', JSON.stringify(recycle_bin))
}


const addFiles = function(file_list, current_folder_id){

  let tree_folder = tree[current_folder_id]

  return new Promise((resolve, reject) => {
    api.upload(file_list, current_folder_id,
      (rejected, files) => {

        files.forEach(f => {
          all_files[f.id] = f
          tree_folder.file_ids.push(f.id)
          f.new = true
        })

        let errors = Object.keys(rejected).map(key => ({
          type: Constants.ERROR_UPLOADING_FILE,
          file: key,
          messages: rejected[key]
        }))

        let file_count = tree_folder.file_ids.length
        all_folders[current_folder_id].file_count = file_count

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


const moveFiles = function(files, current_folder_id){
  let tree_folder = tree[current_folder_id]

  return new Promise((resolve, reject) => {

    let file_ids = files.map(file => {
      return file.id
    })

    api.paste(file_ids, current_folder_id,
      () => {
        files.forEach(f => {
          f.new = true
          tree_folder.file_ids.push(f.id)
        })
        let file_count = tree_folder.file_ids.length
        all_folders[current_folder_id].file_count = file_count

        removeFilesFromFolders(file_ids, current_folder_id)

        resolve({
          file_count,
          files,
        })
      },
      messages => {
        let errors = files.map(file => ({
          file: file.name,
          type: Constants.ERROR_MOVING_FILES,
          messages
        }))
        reject({errors})
      }
    )
  })
}


const deleteFile = function(file_id, current_folder_id){
  let tree_folder = tree[current_folder_id]

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
        all_folders[current_folder_id].file_count = file_count

        // move to recycle bin
        if(typeof recycle_bin.files[current_folder_id] === 'undefined'){
          recycle_bin.files[current_folder_id] = []
        }
        let file = {...all_files[file_id]}
        file.folder_id = current_folder_id
        recycle_bin.files.push(file)

        // then delete
        delete all_files[file_id]

        resolve({
          file_count,
          files,
        })
      },
      messages => {
        let file = all_files[file_id]
        let errors = [{
          file: file.name,
          type: Constants.ERROR_DELETING_FILE,
          messages
        }]
        reject({errors})
      }
    )
  })
}


const addFolder = function(folder_name, current_folder_id){
  let tree_folder = tree[current_folder_id]

  return new Promise((resolve, reject) => {
    api.addFolder(folder_name, current_folder_id,
      (folders, error_messages) => {

        folders.forEach(f => {
          all_folders[f.id] = f
          tree_folder.folder_ids.push(f.id)
          f.new = true
        })

        let folder_count = tree_folder.folder_ids.length
        tree_folder.folder_count = folder_count
        all_folders[current_folder_id].folder_count = folder_count

        let errors = []
        if(error_messages.length > 0){
          errors = [{
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
          folder: folder_name,
          type: Constants.ERROR_ADDING_FOLDER,
          messages
        }]
        reject({errors})
      }
    )
  })
}


const deleteFolder = function(folder_id, current_folder_id){
  let tree_folder = tree[current_folder_id]

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
        all_folders[current_folder_id].folder_count = folder_count

        // move to recycle bin
        recycle_bin.folders.push({...all_folders[folder_id]})

        // then delete
        delete all_folders[folder_id]

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
          type: Constants.ERROR_DELETING_FOLDER,
          folder,
          messages: [message]
        }]
        reject({errors})
      }
    )
  })
}


const emptyRecycleBin = function(){
  recycle_bin = {
    files: [],
    folders: [],
  }
  localStorage.setItem('recycle_bin', recycle_bin)
}


const restoreRecycleBin = function(current_folder_id){

  let promises = []

  for(let i = recycle_bin.folders.length - 1; i >= 0; i--){
    let folder = recycle_bin.folders[i]
    //promises.push(addFolder(folder.name, folder.parent))
    promises.push({
      id: Constants.ADD_FOLDER,
      func: addFolder,
      args: [folder.name, folder.parent]
    })
  }

// can't restore deleted file because they don't exist on the client (only their descriptions) -> we need to implement a recycle bin on the server
/*
  for(let i = recycle_bin.files.length - 1; i >= 0; i--){
    let file = recycle_bin.files[i]
    let folder_id = file.folder_id
    delete file.folder_id
    //promises.push(addFiles([file], folder_id))
    promises.push({
      func: addFiles,
      args: [[file], folder_id]
    })
  }
*/

  //promises.push(Promise.resolve(emptyRecycleBin()))
  promises.push({
    id: Constants.EMPTY_RECYCLE_BIN,
    func: () => {
      return Promise.resolve(emptyRecycleBin())
    },
    args: []
  })

  let tree_folder = tree[current_folder_id]
  tree_folder.needsUpdate = true
  //promises.push(loadFolder(current_folder_id))
/*
  // force an error, just for testing
  promises.push({
    id: Constants.DELETE_FOLDER,
    func: deleteFolder,
    //args: 555, // 500
    args: [555, current_folder_id], // 4-4
  })
*/
  promises.push({
    id: Constants.OPEN_FOLDER,
    func: loadFolder,
    args: [current_folder_id],
  })

  return new Promise((resolve, reject) => {
    chainPromises(0, promises,
      (values, errors) => {
        //console.log(values, errors)
        let err = []
        errors.forEach(obj => {
          err.push(...obj.errors)
        })
        let payload = values[values.length - 1]
        resolve({...payload, errors: err})
      },
      errors => {
        let err = []
        errors.forEach(obj => {
          err.push(...obj.errors)
        })
        reject({
          type: 'generic',
          payload: {errors: err}
        })
      }
    )
  })

  /* This doesn't work because promises are not executed one after each other */
  // return Promise.all(promises)
  // .then(
  //   values => {
  //     let payload = values[values.length - 1]
  //     return payload
  //   },
  //   error => {
  //     console.log(error)
  //     // @todo return error object
  //   }
  // )
}


export default {
  loadFromLocalStorage,
  saveToLocalStorage,
  loadFolder,
  addFiles,
  moveFiles,
  deleteFile,
  addFolder,
  deleteFolder,
  emptyRecycleBin,
  restoreRecycleBin,
}
