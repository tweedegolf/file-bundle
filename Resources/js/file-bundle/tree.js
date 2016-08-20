import api from './api'


let all_files = {}
let all_folders = {
  null: {
    id: null,
    name: '..',
  }
}
let tree = {}


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


const loadFolder = function(folder_id){
  return new Promise((resolve, reject) => {

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


const addFiles = function(file_list, current_folder_id){

  let tree_folder = tree[current_folder_id]

  return new Promise((resolve, reject) => {
    api.upload(file_list, current_folder_id,
      (errors, files) => {

        files.forEach(f => {
          all_files[f.id] = f
          tree_folder.file_ids.push(f.id)
        })

        let file_count = tree_folder.file_ids.length
        all_folders[current_folder_id].file_count = file_count

        resolve({
          file_count,
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


const addFolder = function(folder_name, current_folder_id){
  let tree_folder = tree[current_folder_id]

  return new Promise((resolve, reject) => {
    api.addFolder(folder_name, current_folder_id,
      (folders, errors) => {

        folders.forEach(f => {
          all_folders[f.id] = f
          tree_folder.folder_ids.push(f.id)
        })

        let folder_count = tree_folder.folder_ids.length
        tree_folder.folder_count = folder_count
        all_folders[current_folder_id].folder_count = folder_count

        resolve({
          folder_count,
          folders,
          errors,
        })
      },
      error => {
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
        tree_folder.folder_count = folder_count
        all_folders[current_folder_id].folder_count = folder_count

        delete all_folders[folder_id]

        resolve({
          folder_count,
          folders,
        })
      },
      error => {
        let folder = all_folders[folder_id]
        reject({error, folder})
      }
    )
  })
}


export default {
  loadFolder,
  addFiles,
  moveFiles,
  deleteFile,
  addFolder,
  deleteFolder,
}
