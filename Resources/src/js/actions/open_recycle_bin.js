// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    OPEN_RECYCLE_BIN,
    RECYCLE_BIN_FROM_CACHE,
    RECYCLE_BIN_OPENED,
    ERROR_OPENING_RECYCLE_BIN,
    RECYCLE_BIN_ID,
} from '../util/constants';
import {
    createError,
} from '../util/util';

// START FLOW TYPES

type PayloadRecycleBinOpenedType = {
    currentFolderId: string,
    currentFolderIdTmp: string,
    recycleBin: RecycleBinType,
};

export type ActionRecycleBinFromCacheType = {
    type: 'RECYCLE_BIN_FROM_CACHE',
    payload: PayloadRecycleBinOpenedType,
};


export type ActionRecycleBinOpenedType = {
    type: 'RECYCLE_BIN_OPENED',
    payload: PayloadRecycleBinOpenedType,
};

// END FLOW TYPES

const DELAY: number = 100;

const getCurrentFolder = (store: StoreType<StateType, GenericActionType>): [string, string] => {
    let currentFolderId = store.getState().ui.currentFolderId;
    let currentFolderIdTmp = store.getState().ui.currentFolderIdTmp;
    if (currentFolderId !== RECYCLE_BIN_ID) {
        currentFolderIdTmp = currentFolderId;
        currentFolderId = RECYCLE_BIN_ID;
    }
    return [currentFolderId, currentFolderIdTmp];
};

const optimisticUpdate = (store: StoreType<StateType, GenericActionType>): boolean => {
    const recycleBin = store.getState().tree[RECYCLE_BIN_ID];
    const [currentFolderId, currentFolderIdTmp] = getCurrentFolder(store);
    const payload: PayloadRecycleBinOpenedType = {
        recycleBin,
        currentFolderId,
        currentFolderIdTmp,
    };
    const a: ActionRecycleBinFromCacheType = {
        type: RECYCLE_BIN_FROM_CACHE,
        payload,
    };
    store.dispatch(a);
    return true;
};

const openRecycleBin = (
    store: StoreType<StateType, GenericActionType>,
    resolve: (PayloadRecycleBinOpenedType) => mixed,
    reject: (PayloadErrorType) => mixed,
) => {
    api.openRecycleBin(
        (folders: Array<FolderType>, files: Array<FileType>) => {
            const [currentFolderId, currentFolderIdTmp] = getCurrentFolder();
            resolve({
                recycleBin: {
                    files,
                    folders,
                },
                currentFolderId,
                currentFolderIdTmp,
            });
        },
        (messages: Array<string>) => {
            const err = createError(ERROR_OPENING_RECYCLE_BIN, messages, { id: RECYCLE_BIN_ID });
            reject({
                errors: [err],
            });
        },
    );
};

export default () => {
    const store: StoreType<StateType, GenericActionType> = getStore();
    const dispatch: DispatchType = store.dispatch;
    const id = RECYCLE_BIN_ID;
    const forceLoad = false;
    let delay = 0;
    dispatch({
        type: OPEN_RECYCLE_BIN,
        payload: { id },
    });

    if (forceLoad === false) {
        const fromCache = optimisticUpdate(store);
        if (fromCache) {
            delay = DELAY;
        }
    }

    setTimeout(() => {
        openRecycleBin(
            store,
            (payload: PayloadRecycleBinOpenedType) => {
                dispatch({
                    type: RECYCLE_BIN_OPENED,
                    payload,
                });
            },
            (payload: PayloadErrorType) => {
                dispatch({
                    type: ERROR_OPENING_RECYCLE_BIN,
                    payload,
                });
            },
        );
    }, delay);
};
