// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    OPEN_FOLDER,
    FOLDER_FROM_CACHE,
    SHOW_RECYCLE_BIN,
    FOLDER_OPENED,
    ERROR_OPENING_FOLDER,
    RECYCLE_BIN_ID,
} from '../util/constants';
import {
    createError,
    getFileCount,
    getFolderCount,
} from '../util/util';

const DELAY: number = 100;
const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const optimisticUpdate = (): boolean => {
    const recycleBin = store.getState().tree.recycleBin;
    // recycle bin has not been loaded earlier so not in cache
    if (typeof recycleBin.folders === 'undefined') {
        return false;
    }

    const a: ActionFolderFromCacheType = {
        type: FOLDER_FROM_CACHE,
        payload: {
            currentFolderId: RECYCLE_BIN_ID,
        },
    };
    dispatch(a);
    return true;
};

const resolve = (payload: PayloadFolderOpenedType) => {
    const a: ActionFolderOpenedType = {
        type: FOLDER_OPENED,
        payload,
    };
    dispatch(a);
};

const reject = (payload: PayloadErrorOpenFolderType) => {
    const a: ActionErrorOpenFolderType = {
        type: ERROR_OPENING_FOLDER,
        payload,
    };
    dispatch(a);
};

const getRecycleBin = () => {
    api.getRecycleBin(
        (folders: Array<FolderType>, files: Array<FileType>) => {
            const recycleBin = {
                files,
                folders,
            };

            resolve({
                recycleBin,
            });
        },
        (messages: Array<string>) => {
            const err = createError(ERROR_OPENING_FOLDER, messages, { id: RECYCLE_BIN_ID });
            reject({
                errors: [err],
                currentFolderId: parentFolderId,
                foldersById,
                tree,
            });
        },
    );
};

export default () => {
    const id = RECYCLE_BIN_ID;
    const forceLoad = false;
    let delay = 0;
    dispatch({
        type: SHOW_RECYCLE_BIN,
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
