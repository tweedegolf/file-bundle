// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    ERROR_GETTING_META_DATA,
    META_DATA_RECEIVED,
} from '../util/constants';
import {
    getUID,
} from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

const createError = (data: string, messages: string[]): PayloadErrorType => {
    const errors = [{
        id: getUID(),
        data,
        type: ERROR_GETTING_META_DATA,
        messages,
    }];
    return { errors };
};

type MetaDataReceivedType = {
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
    selected: ClipboardType,
};
const resolve = (payload: MetaDataReceivedType) => {
    const a: ActionMetaDataType = {
        type: META_DATA_RECEIVED,
        payload,
    };
    dispatch(a);
};

const reject = (payload: PayloadErrorType) => {
    const a: ActionErrorType = {
        type: ERROR_GETTING_META_DATA,
        payload,
    };
    dispatch(a);
};

export default () => {
    const state = store.getState();
    const uiState: UIStateType = state.ui;
    const treeState: TreeStateType = state.tree;
    const tmp1 = R.clone(treeState.filesById);
    const tmp2 = R.clone(treeState.foldersById);

    if (tmp1 === null || tmp2 === null) {
        reject(createError('getting metadata', ['invalid state']));
        return;
    }
    const filesById: FilesByIdType = tmp1;
    const foldersById: FoldersByIdType = tmp2;
    const selected: ClipboardType = { ...uiState.selected };

    api.getMetaData(
        selected.fileIds,
        selected.folderIds,
        (files: Array<FileType>, folders: Array<FolderType>) => {
            R.forEach((f: FileType) => {
                if (R.isNil(f) === false) {
                    filesById[f.id] = f;
                }
            }, files);

            R.forEach((f: FolderType) => {
                if (R.isNil(f) === false) {
                    foldersById[f.id] = f;
                }
            }, folders);

            const fileIds = selected.fileIds.filter((id: string): boolean =>
                R.isNil(filesById[id]) === false);
            const folderIds = selected.folderIds.filter((id: string): boolean =>
                R.isNil(foldersById[id]) === false);

            console.log(fileIds, R.isNil(filesById[fileIds[0]]) === false);

            resolve({
                foldersById,
                filesById,
                selected: {
                    fileIds,
                    folderIds,
                },
            });
        },
        (messages: Array<string>) => {
            reject(createError(`Error getting metadata for files ${selected.fileIds.join(',')} and folders ${selected.folderIds.join(',')}`, messages));
        },
    );
};
