// @flowoff
import { compose, applyMiddleware, createStore, combineReducers } from 'redux';
import createLogger from 'redux-logger';
import { autoRehydrate, persistStore } from 'redux-persist';
// import thunkMiddleware from 'redux-thunk'
import R from 'ramda';
import { ui, uiInitialState } from '../reducers/ui_reducer';
import { tree, treeInitialState } from '../reducers/tree_reducer';

const initialState: StateType = {
    ui: uiInitialState,
    tree: treeInitialState,
};

// create dummy store to prevent a null value
let store: StoreType<StateType, ActionUnionType> = createStore(combineReducers({ ui, tree }), initialState);
let initialized: boolean = false;

export const getNewStore = (): StoreType<StateType, ActionUnionType> => {
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

export function getStore(): StoreType<StateType, ActionUnionType> {
    if (initialized === false) {
        initialized = true;
        store = getNewStore();
    }
    return store;
}
