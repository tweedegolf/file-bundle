/* eslint no-use-before-define: off */

import R from 'ramda';

const mapIndexed = R.addIndex(R.map);

const lookupTable = {};

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

const loop = ({ items, lookFor, parentId, itemType }) =>
    mapIndexed((item, index) =>
        check({ item, index, lookFor, parentId, itemType }), items);

const getParent = (items, node) => {
    const parentId = node.parent;
    const filtered = R.filter(item => item.id === parentId, items);
    const parent = R.length(filtered) !== 0 ? filtered[0] : null;
    return parent;
};

const getPath = ({ items, target, rootFolderId, itemType }) => {
    // console.log(itemType, items, target, rootFolderId);
    const path = [target.index];
    let parent = target;
    while (parent !== null && parent.parent !== rootFolderId) {
        parent = getParent(items, parent);
        // console.log(parent);
        path.push(parent.index);
    }
    const lensPath = R.reduce((acc, item) => [...acc, 'folders', item], [0], R.reverse(path));
    // const lensPath1 = R.compose(R.tail, R.reject(R.isNil))(lensPath);
    // console.log(lensPath);
    if (itemType === 'files') {
        return R.update(R.length(lensPath) - 2, 'files', lensPath);
    }
    return lensPath;
};

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
    return R.clone(item);
};

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
    // console.log(lensPath, foundItem);
    return foundItem;
};

const replaceItemById = (itemType, { itemId, item, rootFolder }) => {
    let lensPath = lookupTable[itemId];
    if (R.isNil(lensPath)) {
        findItemById(itemType, { items: [rootFolder], lookFor: itemId, rootFolderId: rootFolder.id });
        lensPath = lookupTable[itemId];
    }
    R.set(R.lensPath(lensPath), item, [rootFolder]);
    return rootFolder;
};


export const getFolderById = ({ rootFolder, folderId }) => {
    if (folderId === rootFolder.id) {
        return rootFolder;
    }
    return lookup('folders', { rootFolder, itemId: folderId });
};

export const getFileById = ({ rootFolder, fileId }) =>
    lookup('files', { rootFolder, itemId: fileId });

export const replaceFolderById = ({ folderId, folder, rootFolder }) =>
    replaceItemById('folders', { itemId: folderId, item: folder, rootFolder });

export const replaceFileById = ({ fileId, file, rootFolder }) =>
    replaceItemById('files', { itemId: fileId, item: file, rootFolder });

