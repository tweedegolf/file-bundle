import {ActionTypes} from './constants'


let initialState = {
  folders: {
      null: {
          id: null,
          name: '..',
      },
  },
  files: {},
  data: {},
  error: '',
  uploading: false,
}


export default function reducer(state = initialState, action){

  switch (action.type) {

    case ActionTypes.UPLOAD_START:
      console.log('start upload')
        return {...state, uploading: true}

    case ActionTypes.UPLOAD_ERROR:
        return {...state, uploading: false}

    case ActionTypes.UPLOAD_DONE:
        return {...state, uploading: false}


    default:
        return state

  }
}