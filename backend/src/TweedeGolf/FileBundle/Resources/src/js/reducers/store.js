// @flow
import { compose, createStore, combineReducers } from 'redux';
import createLogger from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import type { CombinedReducer } from 'redux';
import thunk from 'redux-thunk';
import { applyMiddleware, namespaced } from 'redux-subspace'
import { ui, uiInitialState } from './ui_reducer';
import { tree, treeInitialState } from './tree_reducer';

const config = {
    key: 'root',
    storage: createWebStorage('local'),
};

const createNameSpacedStore = (apps: string[]): StoreType<StateType, GenericActionType> => {
    const combined = {};
    const initialState = {};
    apps.forEach((id: string) => {
        combined[id] = combineReducers({
            ui: namespaced(id)(ui),
            tree: namespaced(id)(tree),
        });
        initialState[id] = {
            ui: uiInitialState,
            tree: treeInitialState,
        }
    });
    const combinedReducers: CombinedReducer<State2Type, GenericActionType> = combineReducers(combined);
    const reducer = persistReducer(config, combinedReducers);
    const store = createStore(
        reducer,
        initialState,
        compose(
            applyMiddleware(
                thunk,
                // createLogger({ collapsed: true }),
            ),
        ),
    );
    const persistor = persistStore(store);
    return { persistor, store };
}

export default createNameSpacedStore;
