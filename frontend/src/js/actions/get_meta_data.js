// @flow
// get meta data for files and folders that are selected; only used once during initialization
import R from 'ramda';
import api from '../util/api';
import {
    ERROR_GETTING_META_DATA,
    META_DATA_RECEIVED,
} from '../util/constants';
import { createError } from '../util/util';

// START FLOW TYPES

type PayloadActionMetaDataReceivedType = {
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
    selected: ClipboardType,
};

export type ActionMetaDataReceivedType = {
    type: 'META_DATA_RECEIVED',
    payload: PayloadActionMetaDataReceivedType,
};

// END FLOW TYPES

const getMetaData = (
    apiUrl: string,
    state: StateType,
    resolve: (payload: PayloadActionMetaDataReceivedType) => mixed,
    reject: (payload: PayloadErrorType) => mixed,
) => {
    const {
        ui: uiState,
        tree: treeState,
    } = state;
    const filesById: FilesByIdType = { ...treeState.filesById };
    const foldersById: FoldersByIdType = { ...treeState.foldersById };
    const {
        fileIds,
        folderIds,
    } = uiState.selected;

    api.getMetaData(
        apiUrl,
        fileIds,
        folderIds,
        (files: FileType[], folders: FolderType[]) => {
            fileIds.forEach((id: string) => {
                delete filesById[id];
            });

            folderIds.forEach((id: string) => {
                delete foldersById[id];
            });

            files.forEach((f: FileType) => {
                filesById[f.id] = f;
            });

            folders.forEach((f: FolderType) => {
                foldersById[f.id] = f;
            });

            // filter out selected files and folders that have been deleted by meanwhile
            // by other users for instance
            const fileIdsF = fileIds.filter((id: string): boolean => {
                const f = filesById[id];
                return R.isNil(f) === false;
            });

            const folderIdsF = folderIds.filter((id: string): boolean => {
                const f = foldersById[id];
                return R.isNil(f) === false;
            });
            // console.log(fileIdsF, folderIdsF);

            resolve({
                filesById,
                foldersById,
                selected: {
                    fileIds: fileIdsF,
                    folderIds: folderIdsF,
                },
            });
        },
        (messages: Array<string>) => {
            const err = createError(ERROR_GETTING_META_DATA, messages, {
                fileIds: fileIds.join(','),
                folderIds: folderIds.join(','),
            });
            reject({ errors: [err] });
        },
    );
};

export default (apiUrl: string): ReduxThunkType => {
    return (dispatch: DispatchType, getState: () => StateType) => {
        const state = getState();
        getMetaData(
            apiUrl,
            state,
            (payload: PayloadActionMetaDataReceivedType) => {
                const a: ActionMetaDataReceivedType = {
                    type: META_DATA_RECEIVED,
                    payload,
                };
                dispatch(a);
            },
            (payload: PayloadErrorType) => {
                const a: ActionErrorType = {
                    type: ERROR_GETTING_META_DATA,
                    payload,
                };
                dispatch(a);
            },
        );
    };
};
