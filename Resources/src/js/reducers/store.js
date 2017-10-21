// @flow
import { compose, applyMiddleware, createStore, combineReducers } from 'redux';
import createLogger from 'redux-logger';
import { autoRehydrate } from 'redux-persist';
// import thunkMiddleware from 'redux-thunk'
import type { CombinedReducer } from 'redux';
import { ui, uiInitialState } from './ui_reducer';
import { tree, treeInitialState } from './tree_reducer';


export type State2Type = {
    [id: string]: StateType,
};

const stores: {
    [id: string]: StoreType<StateType, GenericActionType>
} = {};


export const getNewStore = (id: string): StoreType<StateType, GenericActionType> => {
    const combinedReducer: CombinedReducer<StateType, GenericActionType> = combineReducers({ ui, tree });
    const initialState: StateType = {
        ui: uiInitialState,
        tree: treeInitialState,
    };
    stores[id] = createStore(
        combinedReducer,
        initialState,
        compose(
            autoRehydrate(),
            applyMiddleware(
                // thunkMiddleware,
                createLogger({ collapsed: true }),
            ),
        ),
    );
    return stores[id];
}

export const getStore = (id: string): StoreType<StateType, GenericActionType> => stores[id];
