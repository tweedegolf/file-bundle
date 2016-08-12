import * as ActionTypes from '../constants';
import _ from 'lodash';

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
        selected_items: [...state.selected_items, ...action.payload.items],
      }

    default:
      return state
  }
}
