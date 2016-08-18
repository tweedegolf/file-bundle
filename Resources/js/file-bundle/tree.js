import api from './api'


let all_folders = {
  null: {
    id: null,
    name: '..',
    files: {},
    folders: {},
    loadContents: true,
  }
}
let all_files = {}
let tree = {

}

const loadFolder = function(folder_id){

  return new Promise((resolve, reject) => {

    let folder = all_folders[folder_id]

    if(typeof folder !== 'undefined' && folder.loadContents === false){

      //console.log('fetch from local state')
      let current_folder = all_folders[folder_id]
      resolve({
        current_folder,
        parent_folder: current_folder.parent_folder,
        files: current_folder.files,
        folders: current_folder.folders,
      })

    }else {

      api.openFolder(
        folder_id,
        (folders, files) => {

          let current_folder = all_folders[folder_id]
          current_folder.loadContents = false
          current_folder.folders = []
          current_folder.files = []

          let parent_folder = null
          if(typeof current_folder.parent !== 'undefined'){
            parent_folder = all_folders[current_folder.parent]
          }
          current_folder.parent_folder = parent_folder

          folders.forEach(f => {
            all_folders[f.id] = f
            current_folder.folders.push(f)
          })

          files.forEach(f => {
            all_files[f.id] = f
            current_folder.files.push(f)
          })

          resolve({
            current_folder,
            parent_folder,
            files,
            folders
          })
        },
        error => {
          reject(error)
        }
      )
    }
  })
}


const deleteFile = function(file_id, current_folder){

  return new Promise((resolve, reject) => {
    api.deleteFile(file_id,
      () => {
        let files = current_folder.files.filter(f => {
          return f.id !== file_id
        })
        current_folder.files = files
        delete all_files[file_id]
        let c = current_folder.file_count - 1
        current_folder.file_count = c < 0 ? 0 : c
        all_folders[current_folder.id] = current_folder

        resolve({
          files,
          current_folder,
        })
      },
      error => {
        let file = all_files[file_id]
        reject({error, file})
      }
    )
  })
}


const deleteFolder = function(folder_id, current_folder){
  console.log(folder_id, current_folder)
  return new Promise((resolve, reject) => {
    api.deleteFolder(folder_id,
      () => {
        let folders = current_folder.folders.filter(f => {
          return f.id !== folder_id
        })
        current_folder.folders = folders
        delete all_folders[folder_id]
        let c = current_folder.folder_count - 1
        current_folder.folder_count = c < 0 ? 0 : c
        all_folders[current_folder.id] = current_folder

        resolve({
          folders,
          current_folder,
        })
      },
      error => {
        let folder = all_folders[folder_id]
        reject({error, folder})
      }
    )
  })
}


const addFolder = function(folder_name, current_folder){

  return new Promise((resolve, reject) => {
    api.addFolder(folder_name, current_folder.id,
      (folders, errors) => {
        folders.forEach(f => {
          all_folders[f.id] = f
          current_folder.folders.push(f)
        })
        current_folder.folder_count = current_folder.folders.length
        all_folders[current_folder.id] = current_folder

        resolve({
          folders,
          errors,
          current_folder,
        })
      },
      error => {
        reject({error})
      }
    )
  })
}


export default {
  loadFolder,
  deleteFile,
  deleteFolder,
  addFolder,
}
