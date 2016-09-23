import {applyMiddleware, createStore, combineReducers} from 'redux'
import createLogger from 'redux-logger'
//import thunkMiddleware from 'redux-thunk'
import {ui, uiInitialState} from './reducers/ui_reducer'
import {tree, treeInitialState} from './reducers/tree_reducer'

let store = null


export default function getStore() {
  // singleton
  if(store === null){
    store = createStore(
      combineReducers({
        ui,
        tree,
      }), {
        ui: uiInitialState,
        tree: treeInitialState,
      },
      applyMiddleware(
        //thunkMiddleware,
        createLogger(),
      )
    )
  }
  return store
}
