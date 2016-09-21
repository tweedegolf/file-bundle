import {describe, it} from 'mocha';
import chai, {assert, expect} from 'chai';
import {uiInitialState} from '../../file-bundle/reducers/ui_reducer';
import {ui} from '../../file-bundle/reducers/ui_reducer';

chai.should();

describe('uiInitialState', () => {
  describe('#selected', () => {
    it('should be an array', () => {
      uiInitialState.selected.should.be.a('Array');
      // assert.typeof(uiInitialState.selected, 'Array');
    });
    it('should be an empty array', () => {
      uiInitialState.selected.should.have.length(0);
      // assert.lengthOf(uiInitialState.selected, 0);
    });
  });
});
