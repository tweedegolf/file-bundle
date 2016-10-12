import {assert, expect} from 'chai'
import {describe, it} from 'mocha'
import {uiInitialState} from '../../reducers/ui_reducer'
import {ui} from '../../reducers/ui_reducer'
import * as actions from '../../actions.js'

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

describe('ui updates', () => {

  describe('add folder', () => {

    it('shows a progress indicator by setting adding_folder', () => {

      console.log(actions)
      const id = 2
      const action = actions.openFolder(id)
      const next_result = ui(uiInitialState, action)
      console.log("")

      expect(next_result).to.equal({
        ...state,
        loading_folder: id,
        confirm_delete: null
      })
    })
  })
})
