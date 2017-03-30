/* eslint no-use-before-define: off */

import R from 'ramda';

const mapIndexed = R.addIndex(R.map);

const check = ({ item, index, lookFor, parentId, itemType }) => {
    const found = item.id === lookFor;
    if (R.isNil(item[itemType]) === false) {
        const r = loop({ items: item[itemType], lookFor, parentId: item.id, itemType });
        return [{
            index,
            parent: parentId,
            id: item.id,
            found,
        }, ...r];
    }
    return [{
        index,
        parent: parentId,
        id: item.id,
        found,
    }];
};

const loop = ({ items, lookFor, parentId, itemType }) =>
    mapIndexed((item, index) =>
        check({ item, index, lookFor, parentId, itemType }), items);

const getParent = (items, node) => {
    const parentId = node.parent;
    const filtered = R.filter((item) => {
        return item.id === parentId;
    }, items);
    const parent = R.length(filtered) !== 0 ? filtered[0] : null;
    return parent;
};

const getLensPath = ({ items, target, rootFolderId, itemType }) => {
    // console.log(itemType, items, target, rootFolderId);
    const path = [target.index];
    let parent = target;
    while (parent !== null && parent.parent !== rootFolderId) {
        parent = getParent(items, parent);
        // console.log(parent);
        path.push(parent.index);
    }
    const lensPath = R.reduce((acc, item) => [...acc, itemType, item], [null], R.reverse(path));
    return R.lensPath(lensPath);
};

const getItemById = (itemType, { items, lookFor, parentId, rootFolderId = null }) => {
    const tmp = loop({ items, lookFor, parentId, itemType });
    const result = R.flatten(tmp);
    const filterFound = R.filter(o => o.found, R.flatten(result));
    const item = R.length(filterFound) !== 0 ? filterFound[0] : null;
    if (item === null) {
        return `could not find item ${lookFor}`;
    }
    const lensPath = getLensPath({ items: result, target: item, itemType, rootFolderId });
    // console.log(lensPath);
    // console.log(R.view(lensPath, data));
    return lensPath;
};

export const getFileById = R.curry(getItemById)('files');
export const getFolderById = R.curry(getItemById)('folders');
