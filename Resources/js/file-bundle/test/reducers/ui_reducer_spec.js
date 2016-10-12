import {assert, expect} from 'chai'
import {describe, it} from 'mocha'
import {uiInitialState} from '../../reducers/ui_reducer'
import {ui as reducer} from '../../reducers/ui_reducer'
import * as types from '../../constants.js'

describe('uiInitialState', () => {
  describe('#selected', () => {
    it('should be an array', () => {
      assert.typeOf(uiInitialState.selected, 'Array')
    })
    it('should be an empty array', () => {
      assert.lengthOf(uiInitialState.selected, 0)
    })
  })
})

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
})
