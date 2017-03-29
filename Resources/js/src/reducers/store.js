import { compose, applyMiddleware, createStore, combineReducers } from 'redux';
import createLogger from 'redux-logger';
import { autoRehydrate, persistStore } from 'redux-persist';
// import thunkMiddleware from 'redux-thunk'
import { ui, uiInitialState } from '../reducers/ui_reducer';
import { tree, treeInitialState } from '../reducers/tree_reducer';

let store = null;

export const getNewStore = () => {
    const s = createStore(
        combineReducers({
            ui,
            tree,
        }), {
            ui: uiInitialState,
            tree: treeInitialState,
        },
        compose(
            autoRehydrate(),
            applyMiddleware(
                // thunkMiddleware,
                createLogger({ collapsed: true }),
            ),
        ),
    );
    persistStore(s);
    setTimeout(() => {
        console.log(s.getState().tree);
    }, 10);
    return s;
};

/**
 * Singleton function that returns the global Redux state. Sometimes we need to
 * access the store outside Redux' <tt>connect()</tt> function; in those cases
 * we can use <tt>getStore()</tt>, it does not create a new global state
 * instance if it has already been created.
 */
export function getStore() {
    if (store === null) {
        store = getNewStore();
    }
    return store;
}
