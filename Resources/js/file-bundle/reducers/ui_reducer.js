import * as ActionTypes from '../constants';
import _ from 'lodash';

export const uiInitialState = {
  sort: 'create_ts',
  ascending: false,
  preview: null,
  hover: -1,
  selected: []
}

export function ui(state = uiInitialState, action){

  switch (action.type) {

    // cases

    default:
      return state
  }
}
