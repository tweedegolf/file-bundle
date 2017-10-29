import * as types from '../src/js/util/constants';
import { ui as reducer } from '../src/js/reducers/ui_reducer';
import jasmine from './index';

const {
    describe,
    it,
    expect,
} = jasmine.env;

const {
    objectContaining,
} = jasmine.jasmine;

let undef; // is undefined

describe('ui reducer', () => {
    it('#1 should set a correct initial state if none is defined', () => {
        const action = {};
        const newState = reducer(undef, action);
        expect(newState).toEqual({
            currentFolderId: null,
            currentFolderIdTmp: null,
            rootFolderId: null,
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
            multiple: true,
            language: 'en-GB',
            imagesOnly: false,
            allowNewFolder: false,
            allowUpload: false,
            allowDelete: false,
            allowEdit: false,
            showingRecycleBin: false,
        });
    });

    describe('#2 add folder', () => {
        it('should indicate a folder is being added', () => {
            const action = {
                type: types.ADD_FOLDER,
                payload: {},
            };
            const newState = reducer(undef, action);
            expect(newState.isAddingFolder).toBe(true);
        });
    });

    describe('#3 folder added', () => {
        it('should disable the adding folder indication', () => {
            const action = {
                type: types.FOLDER_ADDED,
                payload: {
                    errors: [],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.isAddingFolder).toBe(false);
        });
    });

    /* #4
    describe('error adding folder', () => {
        it('should display errors', () => {
            const action = {
                type: types.FOLDER_ADDED,
                payload: {
                    errors: ['error text'],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.errors.length).toBeGreaterThan(0);
        });
    });
    */

    describe('#4 confirm delete file', () => {
        it('should show a confirmation popup if it was passed a string', () => {
            const action = {
                type: types.CONFIRM_DELETE_FILE,
                payload: {
                    id: '2',
                },
            };
            const newState = reducer(undef, action);
            expect(newState.deleteFileWithId).toBe('2');
        });

        it('should NOT show a confirmation popup when NOT passed a string', () => {
            const action = {
                type: types.CONFIRM_DELETE_FILE,
                payload: {
                    id: null,
                },
            };
            const newState = reducer(undef, action);
            expect(newState.deleteFileWithId).toBeNull();
        });
    });


    describe('#5 delete file', () => {
        it('should show a progress indicator during the API call', () => {
            const action = {
                type: types.DELETE_FILE,
                payload: {
                    id: '2',
                },
            };
            const newState = reducer(undef, action);
            expect(newState.deletingFileWithId).toEqual('2');
        });
    });

    describe('#6 file deleted', () => {
        it('should remove the progress indicator', () => {
            const action = {
                type: types.FILE_DELETED,
                payload: {
                    errors: [],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.deletingFileWithId).toBeNull();
        });
    });

    describe('#7 error deleting file', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_DELETING_FILE,
                payload: {
                    errors: ['error text'],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.errors.length).toBeGreaterThan(0);
        });
    });


    describe('#8 confirm delete folder', () => {
        it('should show a confirmation popup if it was passed a string', () => {
            const action = {
                type: types.CONFIRM_DELETE_FOLDER,
                payload: {
                    id: '2',
                },
            };
            const newState = reducer(undef, action);
            expect(newState.deleteFolderWithId).toBe('2');
        });

        it('should NOT show a confirmation popup when NOT passed a string', () => {
            const action = {
                type: types.CONFIRM_DELETE_FOLDER,
                payload: {
                    id: null,
                },
            };
            const newState = reducer(undef, action);
            expect(newState.deleteFileWithId).toBeNull();
        });
    });


    describe('#9 delete folder', () => {
        it('should indicate which folder is being deleted', () => {
            const action = {
                type: types.DELETE_FOLDER,
                payload: {
                    id: '2',
                },
            };
            const newState = reducer(undef, action);
            expect(newState.deletingFolderWithId).toEqual('2');
        });
    });


    describe('#10 folder deleted', () => {
        it('should disable the delete folder indication', () => {
            const action = {
                type: types.FOLDER_DELETED,
                payload: {
                    errors: [],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.deletingFolderWithId).toBeNull();
        });
    });


    describe('error deleting folder', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_DELETING_FOLDER,
                payload: {
                    errors: ['error text'],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.errors.length).toBeGreaterThan(0);
        });
    });


    describe('open folder', () => {
        it('should indicate which folder is loading', () => {
            const action = {
                type: types.OPEN_FOLDER,
                payload: {
                    id: '2',
                },
            };
            const newState = reducer(undef, action);
            expect(newState.loadingFolderWithId).toEqual('2');
        });
    });


    describe('folder opened', () => {
        it('should disable the loading folder indication', () => {
            const action = {
                type: types.FOLDER_OPENED,
                payload: {},
            };
            const newState = reducer(undef, action);
            expect(newState.loadingFolderWithId).toBe(null);
        });
    });


    describe('error opening folder', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_OPENING_FOLDER,
                payload: {
                    errors: ['error text'],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.errors.length).toBeGreaterThan(0);
        });
    });


    describe('upload start', () => {
        it('should indicate an upload has started', () => {
            const action = {
                type: types.UPLOAD_START,
                payload: {},
            };
            const newState = reducer(undef, action);
            expect(newState.isUploadingFiles).toBeTruthy();
        });
    });


    describe('upload done', () => {
        it('should show newly uploaded files at the top of the list', () => {
            const action = {
                type: types.UPLOAD_DONE,
                payload: {
                    errors: [],
                },
            };
            const newState = reducer(undef, action);
            expect(newState).toEqual(objectContaining({
                ascending: false,
                sort: 'create_ts',
                scrollPosition: 0,
            }));
        });

        it('should display errors when passed', () => {
            const action = {
                type: types.UPLOAD_DONE,
                payload: {
                    errors: ['error text'],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.errors.length).toBeGreaterThan(0);
        });
    });


    describe('error uploading file', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_UPLOADING_FILE,
                payload: {
                    errors: ['error text'],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.errors.length).toBeGreaterThan(0);
        });
    });


    describe('error moving files', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_UPLOADING_FILE,
                payload: {
                    errors: ['error text'],
                },
            };
            const newState = reducer(undef, action);
            expect(newState.errors.length).toBeGreaterThan(0);
        });
    });


    describe('change sorting', () => {
        it('should sort according to the defined column', () => {
            const action = {
                type: types.CHANGE_SORTING,
                payload: {
                    sort: 'column1337',
                },
            };
            const newState = reducer(undef, action);
            expect(newState.sort).toEqual('column1337');
        });

        it('should sort ascending or descending depending on current state', () => {
            const action = {
                type: types.CHANGE_SORTING,
                payload: {
                    sort: 'column1337',
                },
            };
            const secondState = reducer(undef, action);
            expect(secondState.ascending).toBe(false);
            const thirdState = reducer(secondState, action);
            expect(thirdState.ascending).toBe(true);
        });
    });


    describe('dismiss error', () => {
        it('should remove the defined error from the errors list', () => {
            const action = {
                type: types.DISMISS_ERROR,
                payload: {
                    id: 2,
                },
            };
            const oldState = {
                errors: [{ id: 1 }, { id: 2 }, { id: 3 }],
            };
            const newState = reducer(oldState, action);
            expect(newState.errors).toEqual([{ id: 1 }, { id: 3 }]);
        });
    });


    describe('show preview', () => {
        it('should show a preview of the selected image', () => {
            const action = {
                type: types.SHOW_PREVIEW,
                payload: {
                    imageUrl: 'https://placekitten.com/g/200/200',
                },
            };
            const newState = reducer(undef, action);
            expect(newState.previewUrl).toEqual('https://placekitten.com/g/200/200');
        });
    });


    describe('set hover', () => {
        it('should highlight the correct row on arrow up', () => {
            const action = {
                type: types.SET_HOVER,
                payload: {
                    diff: +1,
                    max: 10,
                },
            };
            const newState = reducer(undef, action);
            expect(newState.hover).toBe(0);
        });

        it('should highlight the correct row on arrow down', () => {
            const action = {
                type: types.SET_HOVER,
                payload: {
                    diff: -1,
                    max: 10,
                },
            };
            const newState = reducer({ hover: 5 }, action);
            expect(newState.hover).toBe(4);
        });

        it('should start back at the top when passing the last folder', () => {
            const action = {
                type: types.SET_HOVER,
                payload: {
                    diff: +1,
                    max: 10,
                },
            };
            const newState = reducer({ hover: 10 }, action);
            expect(newState.hover).toBe(0);
        });

        it('should highlight the last folder when going up from the first', () => {
            const action = {
                type: types.SET_HOVER,
                payload: {
                    diff: -1,
                    max: 10,
                },
            };
            const newState = reducer({ hover: 0 }, action);
            expect(newState.hover).toBe(9);
        });
    });


    describe('set scroll position', () => {
        it('should scroll to the correct position', () => {
            const action = {
                type: types.SET_SCROLL_POSITION,
                payload: {
                    scroll: 8,
                },
            };
            const newState = reducer(undef, action);
            expect(newState.scrollPosition).toBe(8);
        });
    });


    describe('expand browser', () => {
        it('should toggle the expanded setting for the file browser', () => {
            const action = {
                type: types.EXPAND_BROWSER,
                payload: {},
            };
            const second_state = reducer(undef, action);
            expect(second_state.expanded).toBe(true);
            const third_state = reducer(second_state, action);
            expect(third_state.expanded).toBe(false);
        });
    });
});
