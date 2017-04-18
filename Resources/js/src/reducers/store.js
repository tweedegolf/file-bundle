// @flowoff
import { compose, applyMiddleware, createStore, combineReducers } from 'redux';
import createLogger from 'redux-logger';
import { autoRehydrate, persistStore } from 'redux-persist';
// import thunkMiddleware from 'redux-thunk'
import R from 'ramda';
import type { CombinedReducer } from 'redux';
import { ui, uiInitialState } from '../reducers/ui_reducer';
import { tree, treeInitialState } from '../reducers/tree_reducer';

const initialState: StateType = {
    ui: uiInitialState,
    tree: treeInitialState,
};

const combinedReducers: CombinedReducer<StateType, ActionUnionType> = combineReducers({ ui, tree });
// create dummy store to prevent a null value, use the boolean initialized instead of a null check
// to see if a store has already been created (singleton-ish)
let store: StoreType<StateType, ActionUnionType> = createStore(combinedReducers, initialState);
let initialized: boolean = false;

export const getNewStore = (): StoreType<StateType, ActionUnionType> => {
    const s = createStore(
        combinedReducers,
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
