import * as ActionTypes from '../constants';
import getStore from '../get_store';

const store = getStore();
const dispatch = store.dispatch;

export default {

  selectItems(files) {
    dispatch({
      type: ActionTypes.SELECT_ITEMS,
      payload: [items]
    });
  }
}
