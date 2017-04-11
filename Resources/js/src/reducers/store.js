import { compose, applyMiddleware, createStore, combineReducers } from 'redux';
import createLogger from 'redux-logger';
import { autoRehydrate, persistStore } from 'redux-persist';
// import thunkMiddleware from 'redux-thunk'
import R from 'ramda';
import { ui, uiInitialState } from '../reducers/ui_reducer';
import { tree, treeInitialState } from '../reducers/tree_reducer';

let store = null;

const initialState = {
    ui: uiInitialState,
    tree: treeInitialState,
};

export const getNewStore = () => {
    const s = createStore(
        combineReducers({
            ui,
            tree,
        }),
        initialState,
        compose(
            autoRehydrate(),
            applyMiddleware(
                // thunkMiddleware,
                createLogger({ collapsed: true }),
            ),
        ),
    );
    return s;
};

export function getStore(): StoreType {
    if (R.isNil(store)) {
        store = getNewStore();
    }
    return store;
}
