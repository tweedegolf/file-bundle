import api from './api'


let all_folders = {
  null: {
    id: null,
    name: '..',
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
      let files = current_folder.file_ids.map(id => {
        return all_files[id]
      })
      let folders = current_folder.folder_ids.map(id => {
        return all_folders[id]
      })
      resolve({
        current_folder,
        parent_folder: current_folder.parent_folder,
        files,
        folders,
      })

    }else {

      api.openFolder(
        folder_id,
        (folders, files) => {

          let current_folder = all_folders[folder_id]
          current_folder.loadContents = false
          current_folder.folder_ids = []
          current_folder.file_ids = []

          let parent_folder = null
          if(typeof current_folder.parent !== 'undefined'){
            parent_folder = all_folders[current_folder.parent]
          }
          current_folder.parent_folder = parent_folder

          folders.forEach(f => {
            all_folders[f.id] = f
            current_folder.folder_ids.push(f.id)
          })

          files.forEach(f => {
            all_files[f.id] = f
            current_folder.file_ids.push(f.id)
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


const addFiles = function(file_list, current_folder){
  return new Promise((resolve, reject) => {
    api.upload(file_list, current_folder.id,
      (errors, files) => {

        files.forEach(f => {
          all_files[f.id] = f
          current_folder.file_ids.push(f.id)
        })

        resolve({
          files,
          errors,
        })
      },
      error => {
        let errors = []
        Array.from(file_list).forEach(f => {
          errors.push({
            file: f.name,
            type: 'upload',
            messages: [error]
          })
        })
        reject({errors})
      }
    )
  })
}


const moveFiles = function(files, old_folder_id, new_folder){
  let old_folder = {...all_folders[old_folder_id]}
  new_folder = {...new_folder}
  return new Promise((resolve, reject) => {
    let file_ids = files.map(file => {
      return file.id
    })
    api.paste(file_ids, new_folder.id,
      () => {
        files.forEach(f => {
          f.new = true
          new_folder.files.push(f)
          let index = old_folder.files.indexOf(f)
          if(index !== -1){
            old_folder.files.splice(index, 1)
          }
        })
        new_folder.file_count = new_folder.files.length
        old_folder.file_count = old_folder.files.length
        resolve({files})
      },
      error => {
        reject({error})
      }
    )
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
  addFiles,
  moveFiles,
}
