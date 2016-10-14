import {expect} from 'chai'
import {describe, it} from 'mocha'
import {ui as reducer} from '../../reducers/ui_reducer'
import * as types from '../../constants'

describe('ui reducer', () => {

  it('should set a correct initial state if none is defined', () => {
    const action = {}
    const new_state = reducer(undefined, action)
    expect(new_state).to.deep.equal({
      sort: 'create_ts',
      ascending: false,
      expanded: false,
      preview: null,
      confirm_delete: null,
      hover: -1,
      errors: [],
      loading_folder: null,
      deleting_file: null,
      deleting_folder: null,
      adding_folder: false,
      uploading_files: false,
      scroll_position: null,
      selected: [],
      clipboard: [],
    })
  })

  describe('add folder', () => {

    it('should indicate a folder is being added', () => {
      const action = {
        type: types.ADD_FOLDER,
        payload: {}
      }
      const new_state = reducer(undefined, action)
      expect(new_state['adding_folder']).to.be.true
    })
  })

  describe('folder added', () => {

    it('should disable the adding folder indication', () => {
      const action = {
        type: types.FOLDER_ADDED,
        payload: {
          errors: []
        }
      }
      const new_state = reducer(undefined, action)
      expect(new_state['adding_folder']).to.be.false
    })
  })

  describe('error adding folder', () => {

    it('should display errors', () => {
      const action = {
        type: types.FOLDER_ADDED,
        payload: {
          errors: ["error text"]
        }
      }
      const new_state = reducer(undefined, action)
      expect(new_state['errors']).to.have.length.of.at.least(1)
    })
  })

  describe('confirm delete', () => {

    it('should show a confirmation popup if it was passed a number', () => {
      const action = {
        type: types.CONFIRM_DELETE,
        payload: {
          id: 2
        }
      }
      const new_state = reducer(undefined, action)
      expect(new_state['confirm_delete']).to.equal(2)
    })
  })

  describe('open folder', () => {

    it('should indicate which folder is loading', () => {
      const action = {
        type: types.OPEN_FOLDER,
        payload: {
          id: 2
        }
      }
      const new_state = reducer(undefined, action)
      expect(new_state['loading_folder']).to.equal(2)
    })
  })

  describe('folder opened', () => {

    it('should disable the loading folder indication', () => {
      const action = {
        type: types.FOLDER_OPENED,
        payload: {}
      }
      const new_state = reducer(undefined, action)
      expect(new_state['loading_folder']).to.equal(null)
    })
  })
})
