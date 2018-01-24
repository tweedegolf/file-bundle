// @flow
import {
    CLOSE_RECYCLE_BIN,
} from '../util/constants';
import { openFolder } from '../actions';

export default (): ReduxThunkType => {
    return (dispatch: DispatchType, getState: () => StateType) => {
        const state = getState();
        const id = state.ui.currentFolderIdTmp;
        const apiUrl = state.ui.apiUrl;
        dispatch({
            type: CLOSE_RECYCLE_BIN,
        });
        openFolder(apiUrl, id);
    };
};
