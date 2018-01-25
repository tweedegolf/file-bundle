// @flow
/* eslint no-case-declarations: 0 */
import type { ActionInitType } from '../actions/init';
import type { ActionDeleteFileType, ActionFileDeletedType } from '../actions/delete_file';
import type { ActionDeleteFolderType, ActionConfirmDeleteFolderType, ActionFolderDeletedType } from '../actions/delete_folder';
import type { ActionAddFolderType, ActionFolderAddedType } from '../actions/add_folder';
import type { ActionRenameFolderType, ActionConfirmRenameFolderType, ActionFolderRenamedType } from '../actions/rename_folder';
import type { ActionChangeSortingType, ActionDismissErrorType } from '../actions/index';
import type { ActionOpenFolderType, ActionFolderOpenedType } from '../actions/open_folder';
import type { ActionUploadStartType, ActionUploadDoneType } from '../actions/upload_files';
import type { ActionItemsMovedType } from '../actions/move_items';
import type { ActionRecycleBinEmptiedType } from '../actions/empty_recycle_bin';

type ActionUnionType =
    | ActionInitType

    | ActionDeleteFileType
    | ActionFileDeletedType

    | ActionDeleteFolderType
    | ActionConfirmDeleteFolderType
    | ActionFolderDeletedType

    | ActionOpenFolderType
    | ActionFolderOpenedType

    | ActionAddFolderType
    | ActionFolderAddedType

    | ActionErrorType

    | ActionUploadStartType
    | ActionUploadDoneType

    | ActionDismissErrorType

    | ActionChangeSortingType

    | ActionItemsMovedType

    | ActionRenameFolderType
    | ActionConfirmRenameFolderType
    | ActionFolderRenamedType

    | ActionRecycleBinEmptiedType
    ;

export const uiInitialState: UIStateType = {
    apiUrl: '',
    browser: true,
    rootFolderId: 'null',
    currentFolderId: 'null',
    currentFolderIdTmp: '',
    sort: 'create_ts',
    ascending: false,
    expanded: false,
    previewUrl: null,
    deleteFileWithId: null,
    deleteFolderWithId: null,
    renameFolderWithId: null,
    deletingFileWithId: null,
    loadingFolderWithId: null,
    deletingFolderWithId: null,
    renamingFolderWithId: null,
    isAddingFolder: false,
    isUploadingFiles: false,
    scrollPosition: null,
    hover: -1,
    errors: [],
    selected: { fileIds: [], folderIds: [] },
    clipboard: { fileIds: [], folderIds: [] },
    language: 'en-GB',
    name: '',
    permissions: {
        imagesOnly: false,
        allowMove: false,
        allowUpload: false,
        allowNewFolder: false,
        allowDeleteFile: false,
        allowDeleteFolder: false,
        allowRenameFolder: false,
        allowSelectMultiple: false,
        allowUploadMultiple: false,
        allowEmptyRecycleBin: false,
    },
    showingRecycleBin: false,
};

export const ui = (
    state: UIStateType = uiInitialState,
    action: ActionUnionType,
): UIStateType => {
    // let type = action.type;
    // if (type.indexOf('@@redux') === -1) {
    //     type = type.substring(type.indexOf('/') + 1);
    // }
    switch (action.type) {
        case 'INIT':
            return {
                ...state,
                name: action.payload.name,
                language: action.payload.language,
                apiUrl: action.payload.apiUrl,
                browser: action.payload.browser,
                expanded: action.payload.expanded,
                rootFolderId: action.payload.rootFolderId,
                currentFolderId: action.payload.currentFolderId,
                errors: action.payload.errors,
                isUploadingFile: action.payload.isUploadingFile,
                isAddingFolder: action.payload.isAddingFolder,
                loadingFolderWithId: action.payload.loadingFolderWithId,
                selected: action.payload.selected,
                permissions: action.payload.permissions,
            };

        case 'META_DATA_RECEIVED':
            return {
                ...state,
                selected: action.payload.selected,
            };

        /**
         * User has added a folder, we can show a progress indicator while we make
         * an API call to the server
         */
        case 'ADD_FOLDER':
            return {
                ...state,
                isAddingFolder: true,
            };

        case 'CONFIRM_RENAME_FOLDER':
            return {
                ...state,
                renameFolderWithId: action.payload.id,
                deleteFolderWithId: null,
                deleteFileWithId: null,
            };

        case 'RENAME_FOLDER':
            return {
                ...state,
                renamingFolderWithId: action.payload.id,
            };

        case 'FOLDER_RENAMED':
            return {
                ...state,
                renameFolderWithId: null,
                renamingFolderWithId: null,
            };

        case 'ERROR_RENAMING_FOLDER':
            return {
                ...state,
                errors: [...state.errors, ...action.payload.errors],
            };

        /**
         * Response from the server; folder has been created, we can remove the
         * progress indicator (if any). In some cases the server returns errors, if
         * this is the case they will be displayed. This action is processed by the
         * tree reducer as well.
         */
        case 'FOLDER_ADDED':
            return {
                ...state,
                isAddingFolder: false,
            };

        /**
         * Something went wrong during connection or at the server, we can remove the
         * progress indicator and show the error(s)
         */
        case 'ERROR_ADDING_FOLDER':
            return {
                ...state,
                isAddingFolder: false,
                errors: [...state.errors, ...action.payload.errors],
            };

        /**
         * User wants to delete a file, if the id in the payload is a number this
         * actions triggers a confirmation popup. If the id is null it means that the
         * confirmation popup was already showing and that the user has clicked on the
         * 'cancel' button, or has clicked anywhere outside the popup.
         */
        case 'CONFIRM_DELETE_FILE':
            return {
                ...state,
                deleteFileWithId: action.payload.id,
                deleteFolderWithId: null,
                renameFolderWithId: null,
            };

        case 'CONFIRM_DELETE_FOLDER':
            return {
                ...state,
                deleteFolderWithId: action.payload.id,
                deleteFileWithId: null,
                renameFolderWithId: null,
            };


        /**
         * User really has confirmed to delete the file, show progress indicator during API call
         */
        case 'DELETE_FILE':
            return {
                ...state,
                deletingFileWithId: action.payload.id,
            };

        /**
         * Response from the server: file has been deleted successfully. This action
         * is also processed by the tree reducer.
         */
        case 'FILE_DELETED':
            return {
                ...state,
                deleteFileWithId: null,
                deletingFileWithId: null,
                selected: {
                    ...state.selected,
                    fileIds: action.payload.selectedFileIds,
                },
                clipboard: {
                    ...state.clipboard,
                    fileIds: action.payload.clipboardFileIds,
                }
            };

        /**
         * Something went wrong, for instance the file has already been deleted by
         * another user or a network error occurred.
         */
        case 'ERROR_DELETING_FILE':
            return {
                ...state,
                deleteFileWithId: null,
                deletingFileWithId: null,
                errors: [...state.errors, ...action.payload.errors],
            };


        /**
         * User wants to delete an empty folder, show progress indicator during API
         * call. Note that no confirmation popup will be showed; the folder will be
         * deleted right away (if it is empty)
         */
        case 'DELETE_FOLDER':
            return {
                ...state,
                deletingFolderWithId: action.payload.id,
            };

        /**
         * Response from server: folder has been deleted successfully. This action is
         * also processed by the tree reducer.
         */
        case 'FOLDER_DELETED':
            return {
                ...state,
                deleteFolderWithId: null,
                deletingFolderWithId: null,
                selected: {
                    fileIds: action.payload.selectedFileIds,
                    folderIds: action.payload.selectedFolderIds,
                },
                clipboard: {
                    fileIds: action.payload.clipboardFileIds,
                    folderIds: action.payload.clipboardFolderIds,
                }
            };

        /**
         * Something went wrong: network error, etc.
         */
        case 'ERROR_DELETING_FOLDER':
            return {
                ...state,
                deleteFolderWithId: null,
                deletingFolderWithId: null,
                errors: [...state.errors, ...action.payload.errors],
            };


        /**
         * User has clicked on a folder to open it; first we try to load its contents
         * from the local storage and if not present or outdated we retrieve it from
         * the server. This action is also processed by the tree reducer.
         */
        case 'OPEN_FOLDER':
        case 'OPEN_RECYCLE_BIN':
            return {
                ...state,
                loadingFolderWithId: action.payload.id,
                deleteFileWithId: null,
                deleteFolderWithId: null,
                renameFolderWithId: null,
            };

        case 'FOLDER_FROM_CACHE':
            return {
                ...state,
                currentFolderId: action.payload.currentFolderId,
                loadingFolderWithId: null,
            };

        case 'FOLDER_OPENED':
            return {
                ...state,
                currentFolderId: action.payload.currentFolderId,
                loadingFolderWithId: null,
            };

        case 'ERROR_OPENING_FOLDER':
            return {
                ...state,
                loadingFolderWithId: null,
                currentFolderId: action.payload.currentFolderId,
                errors: [...state.errors, ...action.payload.errors],
            };

        case 'RECYCLE_BIN_FROM_CACHE':
        case 'RECYCLE_BIN_OPENED':
            return {
                ...state,
                showingRecycleBin: true,
                loadingFolderWithId: null,
                currentFolderId: action.payload.currentFolderId,
                currentFolderIdTmp: action.payload.currentFolderIdTmp,
            };

        case 'CLOSE_RECYCLE_BIN':
            return {
                ...state,
                showingRecycleBin: false,
                currentFolderId: state.currentFolderIdTmp,
            };

        case 'EMPTY_RECYCLE_BIN':
            return {
                ...state,
                // showingRecycleBin: false,
                // currentFolderId: state.currentFolderIdTmp,
            };

        case 'RECYCLE_BIN_EMPTIED':
            return {
                ...state,
                selected: action.payload.selected,
            };

        case 'ERROR_EMPTY_RECYCLE_BIN':
            return {
                ...state,
                errors: [...state.errors, ...action.payload.errors],
            };

        //  case 'RESTORED_FROM_RECYCLE_BIN':
        //     return {
        //         ...state,
        //         showingRecycleBin: false,
        //         currentFolderId: state.currentFolderIdTmp,
        //         selected: {
        //             fileIds: [],
        //             folderIds: [],
        //         },
        //     };

        /**
         * User has selected files to upload; show progress indicator while they are
         * uploaded to the server
         */
        case 'UPLOAD_START':
            return {
                ...state,
                isUploadingFiles: true,
            };

        /**
         * Files have been uploaded successfully, we set sort to ascending and
         * 'create_ts' and scrollPosition to 0 to make the newly uploaded files
         * appear at the top of the browser list. Sometimes the server returns errors,
         * for instance if some of the uploaded files are too large or of an
         * unsupported file type.
         */
        case 'UPLOAD_DONE':
            return {
                ...state,
                ascending: false,
                sort: 'create_ts',
                scrollPosition: 0,
                isUploadingFiles: false,
                errors: [...state.errors, ...action.payload.errors],
            };

        /**
         * This happens only in case of a network or server error
         */
        case 'ERROR_UPLOADING_FILE':
            return {
                ...state,
                isUploadingFiles: false,
                errors: [...state.errors, ...action.payload.errors],
            };

        /**
         * User has clicked on one of the columns of the tool bar. If the chosen
         * column is the same as the sort column in the state we invert the selection.
         * Otherwise a new sorting column will be set and the current sort order
         * (ascending or descending) will be left unaffected.
         */
        case 'CHANGE_SORTING':
            const sort = action.payload.sort;
            let ascending = state.ascending;
            if (state.sort === sort) {
                ascending = !ascending;
            }
            return {
                ...state,
                ascending,
                sort,
                // errors: [...state.errors, {
                //     id: 7777,
                //     type: 'generic',
                //     messages: ['oh my, this is an error!'],
                // }],
            };

        /**
         * User dismisses an error message. Error messages don't disappear
         * automatically; every new error message is added to the existing error
         * messages.
         */
        case 'DISMISS_ERROR':
            const dismissId = action.payload.id;
            const errors: Array<ErrorType> = state.errors.filter((error: ErrorType): boolean =>
                error.id !== dismissId);
            return {
                ...state,
                errors,
            };

        /**
         * User has clicked on a file to show its full screen preview: currently only
         * implemented for images.
         */
        case 'SHOW_PREVIEW':
            return {
                ...state,
                previewUrl: action.payload.imageUrl,
                renameFolderWithId: null,
                deleteFolderWithId: null,
                deleteFileWithId: null,
            };

        /**
         * The user can select files by using the up and down arrow keys of her
         * keyboard. We calculate the new index with 'diff' and 'max':
         */
        case 'SET_HOVER':
            const {
            diff = 0,          // direction: -1 = down, 1 = up
                max = state.hover, // number of items (files and folders) in the current folder
            } = action.payload;

            let hover = state.hover + diff;
            if (hover > max) {
                hover = 0;
            } else if (hover < 0) {
                hover = max - 1;
            }

            return {
                ...state,
                hover,
            };

        /**
         * Sometimes we need to be able to set the scroll position of the browser list
         * by code, for instance if new files have been added we want to show them on
         * top of the list and scroll the list to the top.
         */
        case 'SET_SCROLL_POSITION':
            return {
                ...state,
                scrollPosition: action.payload.scroll,
            };

        /**
         * In filepicker mode the user can collapse and expand the browser window. In
         * browser mode the browser is always expanded.
         */
        case 'EXPAND_BROWSER':
            return {
                ...state,
                expanded: !state.expanded,
            };

        /**
         * User has clicked the checkbox of a file: if this file is not already
         * selected it will be selected, otherwise it will be deselected.
         *
         * @param      {file}     file      The file whose select checkbox has been
         *                                  clicked
         * @param      {boolean}  browser   False if the tool is in filepicker mode
         * @param      {boolean}  multiple  Whether it is allowed to have multiple
         *                                  files selected
         */
        case 'SELECT_FILE':
        case 'SELECT_FOLDER':
            const itemId = action.payload.id;
            const isFolder = action.type === 'SELECT_FOLDER';

            if (typeof itemId === 'undefined' || itemId === null) {
                return state;
            }

            const itemIds: string[] = isFolder ?
                [...state.selected.folderIds] : [...state.selected.fileIds];
            const index = itemIds.findIndex((id: string): boolean => id === itemId);
            let fileIds = [...state.selected.fileIds];
            let folderIds = [...state.selected.folderIds];
            // if (state.browser === false && state.permissions.allowSelectMultiple === false) {
            if (state.permissions.allowSelectMultiple === false) {
                if (index === -1) {
                    if (isFolder) {
                        folderIds = [itemId];
                    } else {
                        fileIds = [itemId];
                    }
                } else if (isFolder) {
                    folderIds = [];
                } else {
                    fileIds = [];
                }
            } else if (index === -1) {
                if (isFolder) {
                    folderIds.push(itemId);
                } else {
                    fileIds.push(itemId);
                }
            } else if (isFolder) {
                folderIds.splice(index, 1);
            } else {
                fileIds.splice(index, 1);
            }

            return {
                ...state,
                selected: {
                    folderIds,
                    fileIds,
                },
                renameFolderWithId: null,
                deleteFolderWithId: null,
                deleteFileWithId: null,
            };

        /**
         * The user cuts the selected file into another folder: as you can see the
         * selected files are moved from the selected array to the clipboard array of
         * the state.
         */
        case 'CUT_ITEMS':
            return {
                ...state,
                clipboard: { ...state.selected },
                selected: {
                    fileIds: [],
                    folderIds: [],
                },
            };

        /**
         * The user cancels a cut action. The contents of the clipboard array is moved
         * back to the selected array.
         */
        case 'CANCEL_MOVE_ITEMS':
            return {
                ...state,
                clipboard: {
                    fileIds: [],
                    folderIds: [],
                },
                selected: { ...state.clipboard },
            };

        /**
         * The paste action of the cut files yields an error. In most cases this is a
         * network or server error. The contents of the clipboard array is moved back
         * to the selected array of the state.
         */
        case 'ERROR_MOVING_ITEMS':
            return {
                ...state,
                clipboard: {
                    fileIds: [],
                    folderIds: [],
                },
                selected: { ...state.clipboard },
                errors: [...state.errors, ...action.payload.errors],
            };

        /**
         * Files are successfully moved to another folder. This action is processed by
         * the tree reducer as well.
         */
        case 'ITEMS_MOVED':
            return {
                ...state,
                clipboard: {
                    fileIds: [],
                    folderIds: [],
                },
                selected: {
                    fileIds: [],
                    folderIds: [],
                },
                errors: [...state.errors, ...action.payload.errors],
            };

        default:
            return state;
    }
};
