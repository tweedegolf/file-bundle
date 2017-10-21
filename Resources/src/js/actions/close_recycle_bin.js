// @flow
import { getStore } from '../reducers/store';
import {
    CLOSE_RECYCLE_BIN,
} from '../util/constants';
import { openFolder } from '../actions';

export default (storeId: string) => {
    const store = getStore(storeId);
    const dispatch: DispatchType = store.dispatch;
    const id = store.getState().ui.currentFolderIdTmp;
    dispatch({
        type: CLOSE_RECYCLE_BIN,
    });

    openFolder(storeId, id);
};
