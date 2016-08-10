import * as ActionTypes from '../constants'

export const uiInitialState = {
  sort: 'create_ts',
  ascending: false,
  preview: null,
  hover: -1,

}

export function ui(state = uiInitialState, action){

  switch (action.type) {
    default:
      return state

  }
}
