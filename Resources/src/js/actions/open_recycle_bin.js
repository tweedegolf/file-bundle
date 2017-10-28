// @flow
import R from 'ramda';
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

const getCurrentFolder = (state: StateType): [string, string] => {
    let currentFolderId = state.ui.currentFolderId;
    let currentFolderIdTmp = state.ui.currentFolderIdTmp;
    if (currentFolderId !== RECYCLE_BIN_ID) {
        currentFolderIdTmp = currentFolderId;
        currentFolderId = RECYCLE_BIN_ID;
    }
    return [currentFolderId, currentFolderIdTmp];
};

const optimisticUpdate = (state: StateType): GenericActionType => {
    const recycleBin = state.tree[RECYCLE_BIN_ID];
    const [currentFolderId, currentFolderIdTmp] = getCurrentFolder(state);
    const payload: PayloadRecycleBinOpenedType = {
        recycleBin,
        currentFolderId,
        currentFolderIdTmp,
    };
    return {
        type: RECYCLE_BIN_FROM_CACHE,
        payload,
    };
};

const openRecycleBin = (
    state: StateType,
    resolve: (PayloadRecycleBinOpenedType) => mixed,
    reject: (PayloadErrorType) => mixed,
) => {
    api.openRecycleBin(
        (folders: Array<FolderType>, files: Array<FileType>) => {
            const [currentFolderId, currentFolderIdTmp] = getCurrentFolder(state);
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

export default (): ReduxThunkType => {
    return (dispatch: DispatchType, getState: () => StateType) => {
        const state = getState();
        const id = RECYCLE_BIN_ID;
        const forceLoad = false;
        let delay = 0;
        dispatch({
            type: OPEN_RECYCLE_BIN,
            payload: { id },
        });

        if (forceLoad === false) {
            const action = optimisticUpdate(state);
            dispatch(action);
            delay = DELAY;
        }

        setTimeout(() => {
            openRecycleBin(
                state,
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
};
