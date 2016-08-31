import * as ActionTypes from '../constants';
import _ from 'lodash';

export const uiInitialState = {
  sort: 'create_ts',
  ascending: false,
  preview: null,
  hover: -1,
  loading_indicator: 0
}

export function ui(state = uiInitialState, action){

  switch (action.type) {

    // cases

    // loading should listen to all sorts of actions

    // sorting

    // preview (future; preloading states based on common actions)

    default:
      return state
  }
}
