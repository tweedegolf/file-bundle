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

const DELAY: number = 100;
const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const optimisticUpdate = (): boolean => {
    // const recycleBin = store.getState().tree.recycleBin;
    // // recycle bin has not been loaded earlier so not in cache
    // if (typeof recycleBin.folders === 'undefined') {
    //     return false;
    // }

    let currentFolderId = store.getState().ui.currentFolderId;
    let currentFolderIdTmp = store.getState().ui.currentFolderIdTmp;
    if (currentFolderId !== RECYCLE_BIN_ID) {
        currentFolderIdTmp = currentFolderId;
        currentFolderId = RECYCLE_BIN_ID;
    }

    type ActionRecycleBinFromCacheType = {
        type: 'RECYCLE_BIN_FROM_CACHE',
        payload: {
            currentFolderId: string,
            currentFolderIdTmp: string
        }
    };
    const a: ActionRecycleBinFromCacheType = {
        type: RECYCLE_BIN_FROM_CACHE,
        payload: {
            currentFolderId,
            currentFolderIdTmp,
        },
    };
    dispatch(a);
    return true;
};

const resolve = (payload: {
    recycleBin: RecycleBinType,
    currentFolderId: string,
}) => {
    dispatch({
        type: RECYCLE_BIN_OPENED,
        payload,
    });
};

type RejectPayloadType = {
    errors: ErrorType[],
};
const reject = (payload: RejectPayloadType) => {
    dispatch({
        type: ERROR_OPENING_RECYCLE_BIN,
        payload,
    });
};

const getRecycleBin = () => {
    api.getRecycleBin(
        (folders: Array<FolderType>, files: Array<FileType>) => {
            let currentFolderId = store.getState().ui.currentFolderId;
            let currentFolderIdTmp = store.getState().ui.currentFolderIdTmp;
            if (currentFolderId !== RECYCLE_BIN_ID) {
                currentFolderIdTmp = currentFolderId;
                currentFolderId = RECYCLE_BIN_ID;
            }
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
    const id = RECYCLE_BIN_ID;
    const forceLoad = false;
    let delay = 0;
    dispatch({
        type: OPEN_RECYCLE_BIN,
        payload: { id },
    });

    if (forceLoad === false) {
        const fromCache = optimisticUpdate();
        if (fromCache) {
            delay = DELAY;
        }
    }

    setTimeout(() => {
        getRecycleBin();
    }, delay);
};
