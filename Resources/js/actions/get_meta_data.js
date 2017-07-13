// @flow
import R from 'ramda';
import { getStore } from '../reducers/store';
import api from '../util/api';
import {
    ERROR_GETTING_META_DATA,
    META_DATA_RECEIVED,
} from '../util/constants';
import { createError } from '../util/util';

const store: StoreType<StateType, ActionUnionType> = getStore();
const dispatch: DispatchType = store.dispatch;

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
        const err = createError(ERROR_GETTING_META_DATA, ['invalid state']);
        reject({ errors: [err] });
        return;
    }
    const filesById: FilesByIdType = tmp1;
    const foldersById: FoldersByIdType = tmp2;
    const selected: ClipboardType = { ...uiState.selected };
    const fileIds = selected.fileIds;
    const folderIds = selected.folderIds;

    api.getMetaData(
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

            const fileIdsF = fileIds.filter((id: string): boolean => {
                const f = filesById[id];
                return R.isNil(f) === false && f.isTrashed !== true;
            });

            const folderIdsF = folderIds.filter((id: string): boolean => {
                const f = foldersById[id];
                return R.isNil(f) === false && f.isTrashed !== true;
            });

            // console.log(fileIdsF, folderIdsF);

            resolve({
                foldersById,
                filesById,
                selected: {
                    fileIds: fileIdsF,
                    folderIds: folderIdsF,
                },
            });
        },
        (messages: Array<string>) => {
            const err = createError(ERROR_GETTING_META_DATA, messages, {
                fileIds: selected.fileIds.join(','),
                folderIds: selected.folderIds.join(','),
            });
            reject({ errors: [err] });
        },
    );
};
