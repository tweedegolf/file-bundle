// @flow
import { compose, applyMiddleware, createStore, combineReducers } from 'redux';
import createLogger from 'redux-logger';
import { autoRehydrate } from 'redux-persist';
// import thunkMiddleware from 'redux-thunk'
import type { CombinedReducer } from 'redux';
import { ui, uiInitialState } from './ui_reducer';
import { tree, treeInitialState } from './tree_reducer';

const initialState: StateType = {
    ui: uiInitialState,
    tree: treeInitialState,
};

const combinedReducers: CombinedReducer<StateType, GenericActionType> = combineReducers({ ui, tree });
// create dummy store to prevent a null value, use the boolean initialized instead of a null check
// to see if a store has already been created (singleton-ish)
let store: StoreType<StateType, GenericActionType> = createStore(combinedReducers, initialState);

export const getNewStore = (): StoreType<StateType, GenericActionType> => {
    store = createStore(
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
    return store;
}

export function getStore(): StoreType<StateType, GenericActionType> {
    return store;
}
