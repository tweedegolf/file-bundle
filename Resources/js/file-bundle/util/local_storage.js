/**
 * Utility functions that handle saving to and retrieving from local storage
 */


// for parsing JSON, not needed for now
const reviver = function (k, v) {
    const tmp = parseInt(v, 10);
    if (isNaN(tmp) === false) {
        return tmp;
    } else if (v === 'null') {
        return null;
    }
    return v;
};

/**
 * Retrieves the state from the local storage. If nothing has been saved to
 * local storage yet, default values will be returned.
 *
 * @return     {Object}  The current state.
 */
export function getLocalState() {
  // default values
    let allFiles = {};
    let allFolders = {
        null: {
            id: null,
            name: '..',
            file_count: 0,
            folder_count: 0,
        },
    };
    let selected = [];
    let currentFolderId = null;

    let tree = localStorage.getItem('tree');
    if (tree !== null) {
        tree = JSON.parse(tree);
        allFiles = JSON.parse(localStorage.getItem('all_files'));
        allFolders = JSON.parse(localStorage.getItem('all_folders'));
        currentFolderId = JSON.parse(localStorage.getItem('current_folder_id'));
        selected = JSON.parse(localStorage.getItem('selected'));

        if (selected === null) {
            selected = [];
        } else {
      /**
       * Only the ids of the selected files are stored but the state expects
       * File description objects in the selected array; so we replace the ids
       * by their corresponding File objects
       */
            selected = selected.map(fileId => allFiles[fileId]);
        }
    } else {
        tree = {};
    }

    return {
        currentFolderId,
        selected,
        tree,
        allFiles,
        allFolders,
    };
}

/**
 * Stores a value to local storage. If the selected array is passed, only the
 * ids of the selected files will be stored.
 *
 * @param      {Array}  args    The values to be stored
 */
export function storeLocal(...args) {
  // bypass for now
    return;

    args.forEach((arg) => {
        const key = Object.keys(arg)[0];
        let value = arg[key];

        switch (key) {
        case 'selected':
            value = value.map(f => f.id);
            break;

        default:
        // imagine the sound of one hand clapping
        }

        localStorage.setItem(key, JSON.stringify(value));
    });
}
