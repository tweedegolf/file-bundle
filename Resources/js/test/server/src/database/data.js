/**
 * This initial set of data that gets read into the database everytime the
 * server starts.
 */

/*
export default {
  tree: {
    null: {
      files: [],
      folders: []
    }
  }
}
*/
export default {
    files: {
        1: {
            create_ts: 1470914525,
            created: '11-08-2016 13:22',
            id: 1,
            name: 'DodgerBlue.jpg',
            original: '/media/57ac5fdd4f51a_DodgerBlue.jpg',
            thumb: '/media/thumb/57ac5fdd4f51a_DodgerBlue.jpg',
            type: 'jpg',
            size: '2 kB',
            size_bytes: 2086,
        },
    },
    folders: {
        0: {
            file_count: 1,
            folder_count: 1,
            id: 0,
            type: 'folder',
        },
        1: {
            create_ts: 1470914525,
            created: '11-08-2016 13:22',
            file_count: 0,
            folder_count: 0,
            id: 1,
            name: 'colors',
            parent: 0,
            size: '',
            size_bytes: 0,
            // thumb: null,
            type: 'folder',
        },
    },
    tree: {
        0: {
            files: [1],
            folders: [1],
        },
        1: {
            files: [],
            folders: [],
        },
    },
};
