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
    let lensPath = R.reduce((acc, item) => [...acc, 'folders', item], [rootFolderId], R.reverse(path));
    if (itemType === 'files') {
        lensPath = R.update(R.length(lensPath) - 2, 'files', lensPath);
    }
    // console.log(lensPath);
    return lensPath;
};

const getItemById = (itemType, { items, lookFor, parentId }) => {
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
    return R.reject(R.isNil, lensPath);
};

export const getFileById = R.curry(getItemById)('files');
export const getFolderById = ({ rootFolder, lookFor }) => {
    // console.log(rootFolder, lookFor);
    const rootFolderId = rootFolder.id;
    if (lookFor === rootFolderId) {
        return rootFolder;
    }
    const items = rootFolder.folders;
    let lensPath = lookupTable[lookFor];
    if (R.isNil(lensPath)) {
        lensPath = getItemById('folders', { items, lookFor, rootFolderId });
        lookupTable[lookFor] = lensPath;
    }
    const foundFolder = R.view(R.lensPath(lensPath), rootFolder);
    // console.log(lensPath, foundFolder);
    return foundFolder;
};

export const replaceFolderById = ({ folderId, folder, rootFolder }) => {
    // console.log(folderId);
    if (folderId === rootFolder.id) {
        return folder;
    }

    let lensPath = lookupTable[folderId];
    if (R.isNil(lensPath)) {
        lensPath = getItemById('folders', { rootFolder, folderId, rootFolderId: rootFolder.id });
        lookupTable[folderId] = lensPath;
    }
    // console.log(lensPath, folder);
    return R.set(R.lensPath(lensPath), folder, rootFolder);
};
