import api from './api'
import * as ErrorTypes from './constants'


let tree = {}
let all_files = {}
let all_folders = {
  null: {
    id: null,
    name: '..',
  }
}
let recycle_bin = {
  files: {},
  folders: {},
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
    let recycle_bin_empty = Object.keys(recycle_bin.files).length > 0 && Object.keys(recycle_bin.folders).length

    let tree_folder = tree[folder_id]
    let current_folder = {...all_folders[folder_id]}
    let parent_folder = null
    if(folder_id !== null){
      parent_folder = {...all_folders[all_folders[folder_id].parent]}
    }

    if(typeof tree_folder !== 'undefined' && tree_folder.needsUpdate === false){

      let files = tree_folder.file_ids.map(id => {
        return all_files[id]
      })
      let folders = tree_folder.folder_ids.map(id => {
        return all_folders[id]
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
          let error = {
            folder: current_folder.name,
            type: ErrorTypes.ERROR_OPENING_FOLDER,
            messages
          }
          reject({error})
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
          type: ErrorTypes.ERROR_UPLOADING_FILE,
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
            type: ErrorTypes.ERROR_UPLOADING_FILE,
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
          type: ErrorTypes.ERROR_MOVING_FILES,
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
        recycle_bin.files[current_folder_id].push(all_files[file_id])

        // then delete
        delete all_files[file_id]

        resolve({
          file_count,
          files,
        })
      },
      messages => {
        let file = all_files[file_id]
        let error = {
          file: file.name,
          type: ErrorTypes.ERROR_DELETING_FILE,
          messages
        }
        reject({error})
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

        resolve({
          folder_count,
          folders,
          errors: [{
            folder: folder_name,
            type: ErrorTypes.ERROR_ADDING_FOLDER,
            messages: error_messages
          }],
        })
      },
      messages => {
        let error = {
          folder: folder_name,
          type: ErrorTypes.ERROR_ADDING_FOLDER,
          messages
        }
        reject({error})
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
        recycle_bin.folders[folder_id] = all_folders[folder_id]

        // then delete
        delete all_folders[folder_id]

        console.log(recycle_bin)
        console.log(all_folders)

        resolve({
          folder_count,
          folders,
        })
      },
      message => {
        let error = {
          type: ErrorTypes.ERROR_DELETING_FOLDER,
          folder: all_folders[folder_id].name,
          messages: [message]
        }
        reject({error})
      }
    )
  })
}


const emptyRecycleBin = function(){
  recycle_bin = {
    files: {},
    folders: {},
  }
  localStorage.setItem('recycle_bin', recycle_bin)
}


const restoreRecycleBin = function(){
  let folder_ids = Object.keys(recycle_bin.folders)
  folder_ids.forEach(id => {
    let folder = recycle_bin.folders[id]
    let parent = all_folders[folder.parent]
    if(typeof parent !== 'undefined' || folder_ids.findIndex(id) !== -1){ // improve this!
      all_folders[id] = folder
      parent.folder_count++
      tree[parent.id].folder_ids.push(id)
    }else{
      // the parent folder of this folder does not exist or has been removed, add it to the root folder
      folder.parent = null
      all_folders[id] = folder
      parent.folder_count++
      tree[parent.id].folder_ids.push(id)
      // @todo: yield a warning?
    }
  })

  Object.keys(recycle_bin.files).forEach(id => {
    let parent = all_folders[id]
    let files = recycle_bin.files[id]
    files.forEach(file => {
      // the parent folder of this file does not exist or has been removed, add it to the root folder
      if(typeof parent === 'undefined'){
        parent = all_folders[null]
        // @todo: yield a warning?
      }
      all_files[file.id] = file
      parent.file_count++
      tree[id].file_ids.push(file.id)
    })
  })

  emptyRecycleBin()
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
