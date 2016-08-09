import {applyMiddleware, createStore} from 'redux'
//import thunkMiddleware from 'redux-thunk'
import filesAndFoldersReducer from './files_and_folders_reducer'
import ActionTypes from './constants'

let store = null

export default function getStore() {
  if(store === null){
    store = createStore(
      filesAndFoldersReducer,
      null,
      // applyMiddleware(
      //   thunkMiddleware,
      //   createLogger()
      // )
    )
  }
  return store
}
