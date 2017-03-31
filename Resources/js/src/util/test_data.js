export default {
    null: {
        id: null,
        folders: [{
            id: 1,
            folders: [{
                id: 11,
                name: 'konijn',
                folders: [{
                    name: 'aap',
                    id: 111,
                    folders: [{
                        id: 1111,
                    }],
                }],
            }, {
                id: 12,
                name: 'mus',
                folders: [{
                    name: 'winterkoninkje',
                    id: 121,
                }],
            }, {
                id: 13,
                name: 'aap',
                folders: [{
                    name: 'hond',
                    id: 131,
                }, {
                    name: 'kip',
                    id: 132,
                }],
                files: [{
                    id: 444,
                    name: 'I am the only file here!',
                }],
            }],
        }, {
            id: 2,
            folders: [{
                id: 21,
                name: 'haan',
                folders: [{
                    name: 'aap',
                    id: 211,
                    folders: [{
                        id: 2111,
                    }],
                }],
            }],
        }],
    },
};


// getFileById({ items: data.null.folders, lookFor: 444, parentId: null });
// getFileById({ items: data.null.folders, lookFor: 445, parentId: null });
// getFolderById({ items: data.null.folders, lookFor: 445, parentId: null });
// getFolderById({ items: data.null.folders, lookFor: 13, parentId: null });