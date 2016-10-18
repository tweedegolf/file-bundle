import {expect} from 'chai'
import {describe, it} from 'mocha'
import {ui as reducer} from '../../../reducers/ui_reducer'
import * as types from '../../../util/constants'

let undef // is undefined

describe('ui reducer', () => {

  it('should set a correct initial state if none is defined', () => {
    const action = {}
    const new_state = reducer(undef, action)
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
      const new_state = reducer(undef, action)
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
      const new_state = reducer(undef, action)
      expect(new_state['adding_folder']).to.be.false
    })
  })

  describe('error adding folder', () => {

    it('should display errors', () => {
      const action = {
        type: types.FOLDER_ADDED,
        payload: {
          errors: ['error text']
        }
      }
      const new_state = reducer(undef, action)
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
      const new_state = reducer(undef, action)
      expect(new_state['confirm_delete']).to.equal(2)
    })

    it('should NOT show a confirmation popup when NOT passed a number', () => {
      const action = {
        type: types.CONFIRM_DELETE,
        payload: {
          id: null
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['confirm_delete']).to.equal(null)
    })
  })

  describe('delete file', () => {

    it('should show a progress indicator during the API call', () => {
      const action = {
        type: types.DELETE_FILE,
        payload: {
          id: 2
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['deleting_file']).to.equal(2)
    })
  })

  describe('file deleted', () => {

    it('should remove the progress indicator', () => {
      const action = {
        type: types.FILE_DELETED,
        payload: {}
      }
      const new_state = reducer(undef, action)
      expect(new_state['deleting_file']).to.equal(null)
    })
  })

  describe('error deleting file', () => {

    it('should display errors', () => {
      const action = {
        type: types.ERROR_DELETING_FILE,
        payload: {
          errors: ['error text']
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['errors']).to.have.length.of.at.least(1)
    })
  })

  describe('delete folder', () => {

    it('should indicate which folder is being deleted', () => {
      const action = {
        type: types.DELETE_FOLDER,
        payload: {
          folder_id: 2
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['deleting_folder']).to.equal(2)
    })
  })

  describe('folder deleted', () => {

    it('should disable the delete folder indication', () => {
      const action = {
        type: types.FOLDER_DELETED,
        payload: {}
      }
      const new_state = reducer(undef, action)
      expect(new_state['deleting_folder']).to.equal(null)
    })
  })

  describe('error deleting folder', () => {

    it('should display errors', () => {
      const action = {
        type: types.ERROR_DELETING_FOLDER,
        payload: {
          errors: ['error text']
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['errors']).to.have.length.of.at.least(1)
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
      const new_state = reducer(undef, action)
      expect(new_state['loading_folder']).to.equal(2)
    })
  })

  describe('folder opened', () => {

    it('should disable the loading folder indication', () => {
      const action = {
        type: types.FOLDER_OPENED,
        payload: {}
      }
      const new_state = reducer(undef, action)
      expect(new_state['loading_folder']).to.equal(null)
    })
  })

  describe('error opening folder', () => {

    it('should display errors', () => {
      const action = {
        type: types.ERROR_OPENING_FOLDER,
        payload: {
          errors: ['error text']
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['errors']).to.have.length.of.at.least(1)
    })
  })

  describe('upload start', () => {

    it('should indicate an upload has started', () => {
      const action = {
        type: types.UPLOAD_START,
        payload: {}
      }
      const new_state = reducer(undef, action)
      expect(new_state['uploading_files']).to.be.true
    })
  })

  describe('upload done', () => {

    it('should show newly uploaded files at the top of the list', () => {
      const action = {
        type: types.UPLOAD_DONE,
        payload: {
          errors: []
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state).to.include({
        ascending: false,
        sort: 'create_ts',
        scroll_position: 0
      })
    })

    it('should display errors when passed', () => {
      const action = {
        type: types.UPLOAD_DONE,
        payload: {
          errors: ['error text']
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['errors']).to.have.length.of.at.least(1)
    })
  })

  describe('error uploading file', () => {

    it('should display errors', () => {
      const action = {
        type: types.ERROR_UPLOADING_FILE,
        payload: {
          errors: ['error text']
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['errors']).to.have.length.of.at.least(1)
    })
  })

  describe('error moving files', () => {

    it('should display errors', () => {
      const action = {
        type: types.ERROR_UPLOADING_FILE,
        payload: {
          errors: ['error text']
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['errors']).to.have.length.of.at.least(1)
    })
  })

  describe('change sorting', () => {

    it('should sort according to the defined column', () => {
      const action = {
        type: types.CHANGE_SORTING,
        payload: {
          sort: 'column1337'
        }
      }
      const new_state = reducer(undef, action)
      expect(new_state['sort']).to.equal('column1337')
    })

    it('should sort ascending or descending depending on current state', () => {
      const action = {
        type: types.CHANGE_SORTING,
        payload: {
          sort: 'column1337'
        }
      }
      const second_state = reducer(undef, action)
      expect(second_state['ascending']).to.be.false
      const third_state = reducer(second_state, action)
      expect(third_state['ascending']).to.be.true
    })
  })

  describe('dismiss error', () => {

    it('should remove the defined error from the errors list', () => {
      const action = {
        type: types.DISMISS_ERROR,
        payload: {
          error_id: 2
        }
      }
      const old_state = {
        errors: [{id: 1}, {id: 2}, {id: 3}]
      }
      const new_state = reducer(old_state, action)
      expect(new_state['errors']).to.deep.equal([{id: 1}, {id: 3}])
    })
  })
})
