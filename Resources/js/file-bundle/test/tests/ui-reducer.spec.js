import * as types from '../../util/constants'
import {ui as reducer} from '../../reducers/ui_reducer'
import jasmine from './index'

const {
    describe,
    it,
    expect
} = jasmine.env

const {
    objectContaining
} = jasmine.jasmine;

let undef; // is undefined

describe('ui reducer', () => {
    it('should set a correct initial state if none is defined', () => {
        const action = {};
        const new_state = reducer(undef, action);
        expect(new_state).toEqual({
            sort: 'create_ts',
            ascending: false,
            expanded: false,
            preview: null,
            confirm_delete: null,
            hover: -1,
            errors: [],
            loading_folder: -1,
            deleting_file: null,
            deleting_folder: null,
            adding_folder: false,
            uploading_files: false,
            scroll_position: null,
            selected: [],
            clipboard: [],
        })
    })


    describe('add folder', () => {
        it('should indicate a folder is being added', () => {
            const action = {
                type: types.ADD_FOLDER,
                payload: {}
            }
            const new_state = reducer(undef, action)
            expect(new_state.adding_folder).toBe(true)
        })
    })


    describe('folder added', () => {
        it('should disable the adding folder indication', () => {
            const action = {
                type: types.FOLDER_ADDED,
                payload: {
                    errors: []
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.adding_folder).toBe(false)
        })
    })


    describe('error adding folder', () => {
        it('should display errors', () => {
            const action = {
                type: types.FOLDER_ADDED,
                payload: {
                    errors: ['error text']
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.errors.length).toBeGreaterThan(0)
        })
    })


    describe('confirm delete', () => {
        it('should show a confirmation popup if it was passed a number', () => {
            const action = {
                type: types.CONFIRM_DELETE,
                payload: {
                    id: 2
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.confirm_delete).toBe(2)
        })

        it('should NOT show a confirmation popup when NOT passed a number', () => {
            const action = {
                type: types.CONFIRM_DELETE,
                payload: {
                    id: null
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.confirm_delete).toBeNull()
        })
    })


    describe('delete file', () => {
        it('should show a progress indicator during the API call', () => {
            const action = {
                type: types.DELETE_FILE,
                payload: {
                    id: 2
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.deleting_file).toEqual(2)
        })
    })


    describe('file deleted', () => {
        it('should remove the progress indicator', () => {
            const action = {
                type: types.FILE_DELETED,
                payload: {}
            }
            const new_state = reducer(undef, action)
            expect(new_state.deleting_file).toBeNull()
        })
    })


    describe('error deleting file', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_DELETING_FILE,
                payload: {
                    errors: ['error text']
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.errors.length).toBeGreaterThan(0)
        })
    })


    describe('delete folder', () => {
        it('should indicate which folder is being deleted', () => {
            const action = {
                type: types.DELETE_FOLDER,
                payload: {
                    folder_id: 2
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.deleting_folder).toEqual(2)
        })
    })


    describe('delete folder null', () => {
        it('should not delete root folder', () => {
            const action = {
                type: types.DELETE_FOLDER,
                payload: {
                    folder_id: null
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.deleting_folder).toEqual(null)
        })
    })


    describe('folder deleted', () => {
        it('should disable the delete folder indication', () => {
            const action = {
                type: types.FOLDER_DELETED,
                payload: {}
            }
            const new_state = reducer(undef, action)
            expect(new_state.deleting_folder).toBeNull()
        })
    })


    describe('error deleting folder', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_DELETING_FOLDER,
                payload: {
                    errors: ['error text']
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.errors.length).toBeGreaterThan(0)
        })
    })


    describe('open folder', () => {
        it('should indicate which folder is loading', () => {
            const action = {
                type: types.OPEN_FOLDER,
                payload: {
                    id: 2
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.loading_folder).toEqual(2)
        })
    })


    describe('folder opened', () => {
        it('should disable the loading folder indication', () => {
            const action = {
                type: types.FOLDER_OPENED,
                payload: {}
            }
            const new_state = reducer(undef, action)
            expect(new_state.loading_folder).toBe(-1)
        })
    })


    describe('error opening folder', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_OPENING_FOLDER,
                payload: {
                    errors: ['error text']
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.errors.length).toBeGreaterThan(0)
        })
    })


    describe('upload start', () => {
        it('should indicate an upload has started', () => {
            const action = {
                type: types.UPLOAD_START,
                payload: {}
            }
            const new_state = reducer(undef, action)
            expect(new_state.uploading_files).toBeTruthy()
        })
    })


    describe('upload done', () => {
        it('should show newly uploaded files at the top of the list', () => {
            const action = {
                type: types.UPLOAD_DONE,
                payload: {
                    errors: []
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state).toEqual(objectContaining({
                ascending: false,
                sort: 'create_ts',
                scroll_position: 0
            }))
        })

        it('should display errors when passed', () => {
            const action = {
                type: types.UPLOAD_DONE,
                payload: {
                    errors: ['error text']
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.errors.length).toBeGreaterThan(0)
        })
    })


    describe('error uploading file', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_UPLOADING_FILE,
                payload: {
                    errors: ['error text']
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.errors.length).toBeGreaterThan(0)
        })
    })


    describe('error moving files', () => {
        it('should display errors', () => {
            const action = {
                type: types.ERROR_UPLOADING_FILE,
                payload: {
                    errors: ['error text']
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.errors.length).toBeGreaterThan(0)
        })
    })


    describe('change sorting', () => {
        it('should sort according to the defined column', () => {
            const action = {
                type: types.CHANGE_SORTING,
                payload: {
                    sort: 'column1337'
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.sort).toEqual('column1337')
        })

        it('should sort ascending or descending depending on current state', () => {
            const action = {
                type: types.CHANGE_SORTING,
                payload: {
                    sort: 'column1337'
                }
            }
            const second_state = reducer(undef, action)
            expect(second_state.ascending).toBe(false)
            const third_state = reducer(second_state, action)
            expect(third_state.ascending).toBe(true)
        })
    })


    describe('dismiss error', () => {
        it('should remove the defined error from the errors list', () => {
            const action = {
                type: types.DISMISS_ERROR,
                payload: {
                    error_id: 2
                }
            }
            const old_state = {
                errors: [{ id: 1 }, { id: 2 }, { id: 3 }]
            }
            const new_state = reducer(old_state, action)
            expect(new_state.errors).toEqual([{ id: 1 }, { id: 3 }])
        })
    })


    describe('show preview', () => {
        it('should show a preview of the selected image', () => {
            const action = {
                type: types.SHOW_PREVIEW,
                payload: {
                    image_url: 'https://placekitten.com/g/200/200'
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.preview).toEqual('https://placekitten.com/g/200/200')
        })
    })


    describe('set hover', () => {
        it('should highlight the correct row on arrow up', () => {
            const action = {
                type: types.SET_HOVER,
                payload: {
                    diff: +1,
                    max: 10
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.hover).toBe(0)
        })

        it('should highlight the correct row on arrow down', () => {
            const action = {
                type: types.SET_HOVER,
                payload: {
                    diff: -1,
                    max: 10
                }
            }
            const new_state = reducer({ hover: 5 }, action)
            expect(new_state.hover).toBe(4)
        })

        it('should start back at the top when passing the last folder', () => {
            const action = {
                type: types.SET_HOVER,
                payload: {
                    diff: +1,
                    max: 10
                }
            }
            const new_state = reducer({ hover: 10 }, action)
            expect(new_state.hover).toBe(0)
        })

        it('should highlight the last folder when going up from the first', () => {
            const action = {
                type: types.SET_HOVER,
                payload: {
                    diff: -1,
                    max: 10
                }
            }
            const new_state = reducer({ hover: 0 }, action)
            expect(new_state.hover).toBe(9)
        })
    })


    describe('set scroll position', () => {
        it('should scroll to the correct position', () => {
            const action = {
                type: types.SET_SCROLL_POSITION,
                payload: {
                    scroll: 8
                }
            }
            const new_state = reducer(undef, action)
            expect(new_state.scroll_position).toBe(8)
        })
    })


    describe('expand browser', () => {
        it('should toggle the expanded setting for the file browser', () => {
            const action = {
                type: types.EXPAND_BROWSER,
                payload: {}
            }
            const second_state = reducer(undef, action)
            expect(second_state.expanded).toBe(true)
            const third_state = reducer(second_state, action)
            expect(third_state.expanded).toBe(false)
        })
    })
})
