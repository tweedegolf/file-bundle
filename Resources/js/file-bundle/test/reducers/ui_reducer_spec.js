import {expect} from 'chai'
import {describe, it} from 'mocha'
import {ui as reducer} from '../../reducers/ui_reducer'
import * as types from '../../constants'

describe('ui reducer', () => {

  describe('defaults', () => {

    it('should set a correct initial state if none is defined', () => {
      expect(reducer(undefined, {})).to.deep.equal({
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
  })

  describe('add folder', () => {

    it('should indicate a folder is being added', () => {
      const action = {
        type: types.ADD_FOLDER,
        payload: {}
      }
      expect(reducer({}, action)).to.deep.equal({
        adding_folder: true
      })
    })
  })

  describe('open folder', () => {

    it('should indicate a folder is loading', () => {
      const action = {
        type: types.OPEN_FOLDER,
        payload: {
          id: 2
        }
      }
      expect(reducer({}, action)).to.deep.equal({
        loading_folder: 2,
        confirm_delete: null
      })
    })
  })

  describe('folder opened', () => {

    it('should disable the loading folder indication', () => {
      const action = {
        type: types.FOLDER_OPENED,
        payload: {}
      }
      expect(reducer({}, action)).to.deep.equal({
        loading_folder: null
      })
    })
  })
})
