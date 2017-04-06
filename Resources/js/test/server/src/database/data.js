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
        100: {
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
        101: {
            create_ts: 1491402237100,
            created: '05-04-2017 16:23',
            id: 101,
            name: '57ac5fdd3cf12_Olive.jpg',
            original: '/media/15b3e80249e_57ac5fdd3cf12_Olive.jpg',
            thumb: '/media/thumb/15b3e80249e_57ac5fdd3cf12_Olive.jpg',
            type: 'jpeg',
            size: '2.09 kB',
            size_bytes: 2087,
        },
        102: {
            create_ts: 1470914525,
            created: '11-08-2016 13:22',
            id: 2,
            name: 'RosyBrown.jpg',
            original: '/media/57ac5fdd5a124_RosyBrown.jpg',
            thumb: '/media/thumb/57ac5fdd5a124_RosyBrown.jpg',
            type: 'jpg',
            size: '2.09 kB',
            size_bytes: 2087,
        },
        103: {
            create_ts: 1491402237102,
            created: '05-04-2017 16:23',
            id: 103,
            name: '57ac5fdd56af0_PeachPuff.jpg',
            original: '/media/15b3e8024a5_57ac5fdd56af0_PeachPuff.jpg',
            thumb: '/media/thumb/15b3e8024a5_57ac5fdd56af0_PeachPuff.jpg',
            type: 'jpeg',
            size: '2.09 kB',
            size_bytes: 2086,
        },
        104: {
            create_ts: 1491402237102,
            created: '05-04-2017 16:23',
            id: 104,
            name: '57ac5fdd60a47_Ivory.jpg',
            original: '/media/15b3e8024a6_57ac5fdd60a47_Ivory.jpg',
            thumb: '/media/thumb/15b3e8024a6_57ac5fdd60a47_Ivory.jpg',
            type: 'jpeg',
            size: '2.09 kB',
            size_bytes: 2087,
        },
        105: {
            create_ts: 1491402237102,
            created: '05-04-2017 16:23',
            id: 105,
            name: '57ac5fdd534fa_Peru.jpg',
            original: '/media/15b3e8024a6_57ac5fdd534fa_Peru.jpg',
            thumb: '/media/thumb/15b3e8024a6_57ac5fdd534fa_Peru.jpg',
            type: 'jpeg',
            size: '2.09 kB',
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
            isTrashed: false,
        },
        2: {
            create_ts: 1470914525,
            created: '11-08-2016 13:22',
            file_count: 0,
            folder_count: 0,
            id: 2,
            name: 'subfolder colors',
            parent: 1,
            size: '',
            size_bytes: 0,
            // thumb: null,
            type: 'folder',
        },
    },
    tree: {
        0: {
            files: [101, 102],
            folders: [1],
        },
        1: {
            files: [103],
            folders: [2],
        },
        2: {
            files: [104],
            folders: [],
        },
    },
};
