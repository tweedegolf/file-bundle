import * as ActionTypes from '../constants';
import _ from 'lodash';

export const uiInitialState = {
  sort: 'create_ts',
  ascending: false,
  preview: null,
  hover: -1,
  adding_folder_indicator: false,
  deleting_file_indicator: false,
  folder_loading_indicator: false,
  uploading_file_indicator: false,
  receiving_updates_indicator: false
}

export function ui(state = uiInitialState, action){

  switch (action.type) {

    // Request/user action based loading indicators

    case ActionTypes.ADD_FOLDER:
      return {
        ...state,
        adding_folder_indicator: true
      }

    case ActionTypes.FOLDER_ADDED:
      return {
        ...state,
        adding_folder_indicator: false
      }

    case ActionTypes.DELETE_FILE:
      return {
        ...state,
        deleting_file_indicator: true
      }

    case ActionTypes.FILE_DELETED:
      return {
        ...state,
        deleting_file_indicator: false
      }

    case ActionTypes.LOAD_FOLDER:
      return {
        ...state,
        folder_loading_indicator: true
      }

    case ActionTypes.FOLDER_LOADED:
      return {
        ...state,
        folder_loading_indicator: false
      }

    case ActionTypes.UPLOAD_START:
      return {
        ...state,
        uploading_file_indicator: true
      }

    case ActionTypes.UPLOAD_DONE:
      return {
        ...state,
        uploading_file_indicator: false
      }

    // Server (pushing updates through sockets) initiated loading indicators

    case ActionTypes.RECEIVING_UPDATES:
      return {
        ...state,
        receiving_updates_indicator: true
      }

    case ActionTypes.APPLIED_UPDATES:
      return {
        ...state,
        receiving_updates_indicator: false
      }

    // sorting

    // preview (future; preloading states based on common actions)

    default:
      return state
  }
}
