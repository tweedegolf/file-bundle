import api from './api'


let all_folders = {
  null: {
    id: null,
    name: '..',
    file_ids: {},
    folder_ids: {},
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
      console.log('fetch from local state')

      let current_folder = all_folders[folder_id]
      let parent_folder = null

      if(typeof current_folder.parent !== 'undefined'){
        parent_folder = all_folders[current_folder.parent]
      }

      let files = []
      Object.keys(current_folder.file_ids).forEach(id => {
        return all_files[id]
      })

      let folders = []
      Object.keys(current_folder.folder_ids).forEach(id => {
        return all_folders[id]
      })

      resolve({
        current_folder,
        parent_folder,
        files,
        folders,
      })
    }

    api.openFolder(
      folder_id,
      (folders, files) => {

        let current_folder = all_folders[folder_id]
        let parent_folder = null

        if(typeof current_folder.parent !== 'undefined'){
          parent_folder = all_folders[current_folder.parent]
        }

        folders.forEach(f => {
          all_folders[f.id] = f
          //current_folder.folder_ids[f.id] = f
        })

        files.forEach(f => {
          all_files[f.id] = f
          //current_folder.file_ids[f.id] = f
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
  })
}

export default {
  loadFolder,
}
