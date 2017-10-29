// @flow
/* eslint no-use-before-define: 0 */

export type BasicActionType = {
    type: string,
};

export type GenericActionType = {
    type: string,
    payload: *,
};

export type ActionErrorType = {
    type: 'ERROR_DELETING_FILE'
    | 'ERROR_DELETING_FOLDER'
    | 'ERROR_ADDING_FOLDER'
    | 'ERROR_UPLOADING_FILE'
    | 'ERROR_MOVING_ITEMS'
    | 'ERROR_RENAMING_FOLDER'
    | 'ERROR_EMPTY_RECYCLE_BIN'
    | 'ERROR_RESTORE_FROM_RECYCLE_BIN'
    | 'ERROR_GETTING_META_DATA',
    payload: PayloadErrorType,
};

export type PayloadErrorType = {
    errors: ErrorType[],
};

/*
export type ActionUnionTreeReducerType =
    | ActionInitType
    | ActionMetaDataReceivedType
    | ActionFolderOpenedType
    | ActionRecycleBinFromCacheType
    | ActionDeleteType
    | ActionDeletedType
    | ActionFolderAddedType
    | ActionErrorType
;

export type ActionUnionType =
    | ActionInitType

    | ActionDeleteFileType
    | ActionFileDeletedType

    | ActionDeleteFolderType
    | ActionFolderDeletedType

    | ActionFolderOpenedType

    | ActionAddFolderType
    | ActionFolderAddedType

    | ActionErrorType
    | ActionUploadStartType
    | ActionUploadDoneType
    | ActionItemsMovedType
    | ActionDismissErrorType
    | ActionChangeSortingType
    | ActionItemsMovedType
;
*/
