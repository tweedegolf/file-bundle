/* eslint no-use-before-define: off */

import R from 'ramda';

const mapIndexed = R.addIndex(R.map);

// Here we store all data paths for memoization
const lookupTable = {};

// Main loop that traverses the tree
const loop = ({ items, lookFor, parentId, itemType }) =>
    mapIndexed((item, index) =>
        check({ item, index, lookFor, parentId, itemType }), items);

// Check if the item is the item we are looking for and recurses into
// subfolders. In case we are looking for a file we also loop through
// the files arrays
const check = ({ item, index, lookFor, parentId, itemType }) => {
    // console.log(item, lookFor, parentId);
    const found = item.id === lookFor;
    const r = {
        index,
        parent: parentId,
        id: item.id,
        item,
        found,
    };
    let r1 = [];
    let r2 = [];

    if (R.isNil(item.folders) === false) {
        r1 = loop({ items: item.folders, lookFor, parentId: item.id, itemType });
    }

    if (itemType === 'files' && R.isNil(item.files) === false) {
        r2 = loop({ items: item.files, lookFor, parentId: item.id, itemType });
    }

    return [r, ...r1, ...r2];
};

const getParent = (items, node) => {
    const parentId = node.parent;
    const filtered = R.filter(item => item.id === parentId, items);
    const parent = R.length(filtered) !== 0 ? filtered[0] : null;
    return parent;
};

// Creates a data path to the found item; this data path consist of the index of
// the item itself in the folders or files array and all indexes of the parent
// folders. We trace the path back to the root folder, then we alternate the
// found indexes with the 'folders' and 'files' keys, see below.
const getPath = ({ items, target, rootFolderId, itemType }) => {
    // console.log(itemType, items, target, rootFolderId);
    const path = [target.index];
    let parent = target;
    while (parent !== null && parent.parent !== rootFolderId) {
        parent = getParent(items, parent);
        path.push(parent.index);
    }
    // the folders array is bound to a key 'folders' in the tree, so here we
    // interleave the index values with the 'folders' key
    const lensPath = R.reduce((acc, item) => [...acc, 'folders', item], [0], R.reverse(path));
    // const lensPath1 = R.compose(R.tail, R.reject(R.isNil))(lensPath);
    if (itemType === 'files') {
        // files are stored in an array that is bound to a key 'files', so we
        // replace the last occurrence of 'folders' by 'files'
        return R.update(R.length(lensPath) - 2, 'files', lensPath);
    }
    return lensPath;
};

// Find the item by id and return the item and other data; this other data (the index of
// the item in the array, the id of its parent folder) is used to create an array
// that describes the data path to this item. The array is stored in the lookupTable
// for memoization. The data that can be converted to a Ramda lensPath for super fast future
// lookups.
const findItemById = (itemType, { items, lookFor, parentId }) => {
    // console.log(items, lookFor, parentId);
    const tmp = loop({ items, lookFor, parentId, itemType });
    const result = R.flatten(tmp);
    // console.log(result);
    const filterFound = R.filter(o => o.found, result);
    // console.log(filterFound);
    const item = R.length(filterFound) !== 0 ? filterFound[0] : null;
    if (item === null) {
        const error = `could not find ${R.dropLast(1, itemType)} with id ${lookFor}`;
        console.error(error);
        return error;
    }
    const lensPath = getPath({ items: result, target: item, itemType, rootFolderId: parentId });
    // console.log(R.view(lensPath, data));
    lookupTable[lookFor] = lensPath;
    return R.clone(item.item);
};

// checks if there is a valid lensPath for this item
const lookup = (itemType, { rootFolder, itemId }) => {
    const lensPath = lookupTable[itemId];
    if (R.isNil(lensPath)) {
        return findItemById(itemType, { items: [rootFolder], lookFor: itemId, parentId: rootFolder.id });
    }

    const foundItem = R.view(R.lensPath(lensPath), [rootFolder]);
    if (R.isNil(foundItem)) {
        lookupTable[itemId] = null;
        return findItemById(itemType, { items: [rootFolder], lookFor: itemId, parentId: rootFolder.id });
    }
    // console.log('found', lensPath, foundItem);
    return foundItem;
};

const replaceItemById = (itemType, { itemId, item, rootFolder }) => {
    let lensPath = lookupTable[itemId];
    if (R.isNil(lensPath)) {
        findItemById(itemType, { items: [rootFolder], lookFor: itemId, rootFolderId: rootFolder.id });
        lensPath = lookupTable[itemId];
    }
    // console.log(itemId, lensPath, item);
    const result = R.compose(R.head, R.set(R.lensPath(lensPath), item))([rootFolder]);
    return result;
};


export const getFolderById = ({ rootFolder, folderId }) => {
    if (folderId === rootFolder.id) {
        return rootFolder;
    }
    return lookup('folders', { rootFolder, itemId: folderId });
};

export const getFileById = ({ rootFolder, fileId }) =>
    lookup('files', { rootFolder, itemId: fileId });

export const replaceFolderById = ({ folderId, folder, rootFolder }) => {
    if (folderId === rootFolder.id) {
        return folder;
    }
    return replaceItemById('folders', { itemId: folderId, item: folder, rootFolder });
};

export const replaceFileById = ({ fileId, file, rootFolder }) =>
    replaceItemById('files', { itemId: fileId, item: file, rootFolder });

