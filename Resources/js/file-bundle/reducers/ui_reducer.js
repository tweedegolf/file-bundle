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

    case ActionTypes.SELECT_FILE:

      console.log("SELECT FILE ACTION")
      console.log("state:", state)
      console.log("payload:", action.payload)

      // Get currently selected items from state
      let index = state.selected.findIndex(f => {
        console.log(f.id === id)
        return f.id === id
      })

      // If already selected,

        // Deselect (remove from "selected")

      // If not yet selected,

        // Select (add to "selected")

      // Return new state

      return {
        ...state,
        selected: selected,
      }

    default:
      return state
  }
}
