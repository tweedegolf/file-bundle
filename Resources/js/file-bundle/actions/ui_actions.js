import * as ActionTypes from '../constants';
import getStore from '../get_store';

const store = getStore();
const dispatch = store.dispatch;

export default {

  updateSelected(files) {
    dispatch({
      type: ActionTypes.UPDATE_SELECTED,
      payload: items
    });
  }
}
