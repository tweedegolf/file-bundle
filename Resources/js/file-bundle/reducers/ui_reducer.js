import * as ActionTypes from '../constants';
import _ from 'lodash';

export const uiInitialState = {
  sort: 'create_ts',
  ascending: false,
  preview: null,
  hover: -1,
  loading_indicator: false
}

export function ui(state = uiInitialState, action){

  switch (action.type) {

    // Loading spinner indication
    // Future: only show spinner on api call? API_CALL_START and API_CALL_END?

    case ActionTypes.ADD_FOLDER:
    case ActionTypes.DELETE_FILE:
    case ActionTypes.LOAD_FOLDER:
    case ActionTypes.UPLOAD_START:
      return {
        ...state,
        loading_indicator: true,
      }

    case ActionTypes.FOLDER_ADDED:
    case ActionTypes.FILE_DELETED:
    case ActionTypes.FOLDER_LOADED:
    case ActionTypes.UPLOAD_DONE:
      return {
        ...state,
        loading_indicator: false,
      }

    // sorting

    // preview (future; preloading states based on common actions)

    default:
      return state
  }
}
