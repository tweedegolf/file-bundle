import * as ActionTypes from '../constants';

export const uiInitialState = {
  sort: 'create_ts',
  ascending: false,
  preview: null,
  hover: -1,
  selected_items: ,
}

export function ui(state = uiInitialState, action){

  switch (action.type) {

    case ActionTypes.SELECT_ITEMS:
      return {
        ...state,
        selected_items: action.payload.items // TODO: Reducer logic for combining previously selected_items with new ones
      }

    default:
      return state
  }
}
