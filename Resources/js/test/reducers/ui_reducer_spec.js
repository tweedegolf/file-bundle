import {assert, expect} from 'chai'
import {describe, it} from 'mocha'
import {uiInitialState} from '../../file-bundle/reducers/ui_reducer'
import {ui} from '../../file-bundle/reducers/ui_reducer'

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
