import * as ActionTypes from '../constants'

export const treeInitialState = {
  folders: {},
  files: {},
  data: {},
  error: '',
  uploading: false,
  loading_folder: null,
  current_folder: {
    id: null,
    name: '..',
  },
}


export function tree(state = treeInitialState, action){

  switch (action.type) {

    case ActionTypes.LOAD_FOLDER:
      return {...state, loading_folder: action.payload.id}

    case ActionTypes.FOLDER_ERROR:
      return {...state, loading_folder: null}

    case ActionTypes.FOLDER_LOADED:
      let folder_id = state.loading_folder
      let folders = action.payload.folders

      folders.forEach(folder => {
        state.folders[folder.id] = folder
      })

      // if(folder_id !== undefined && this.data[folder_id]){
      //   this.data[folder_id].folders = this.data[folder_id].folders.concat(folders);
      // }
      console.log(folders, folder_id)

      return {
        ...state,
        hover: -1,
        loading_folder: null,
        current_folder: folders[folder_id],
        files: action.payload.files,
        folders,
      }


    case ActionTypes.UPLOAD_START:
      return {...state, uploading: true}

    case ActionTypes.UPLOAD_ERROR:
      return {...state, uploading: false}

    case ActionTypes.UPLOAD_DONE:
      return {
        ...state,
        files: action.payload.files,
        uploading: false
      }

    default:
      return state
  }
}