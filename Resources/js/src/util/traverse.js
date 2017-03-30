/* eslint no-use-before-define: off */

import R from 'ramda';
import data from './test_data';

const mapIndexed = R.addIndex(R.map);

const check = ({ item, index, lookFor, parentId, itemType }) => {
    const found = item.id === lookFor;
    if (R.isNil(item.folders) === false) {
        const r = loop({ items: item.folders, lookFor, parentId: item.id, itemType });
        const r1 = [{
            index,
            parent: parentId,
            id: item.id,
            found,
        }, ...r];

        if (itemType === 'files' && R.isNil(item.files) === false) {
            const r2 = loop({ items: item.files, lookFor, parentId: item.id, itemType });
            return [...r1, ...r2];
        }
        return r1;
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
    let lensPath = R.reduce((acc, item) => [...acc, 'folders', item], [null], R.reverse(path));
    if (itemType === 'files') {
        const length = R.length(lensPath);
        lensPath = mapIndexed((item, index) => ((index === length - 2) ? 'files' : item), lensPath);
    }
    // console.log(lensPath);
    return R.lensPath(lensPath);
};

const getItemById = (itemType, { items, lookFor, parentId, rootFolderId = null }) => {
    // console.log(items, lookFor, parentId);
    const tmp = loop({ items, lookFor, parentId, itemType });
    const result = R.flatten(tmp);
    const filterFound = R.filter(o => o.found, R.flatten(result));
    const item = R.length(filterFound) !== 0 ? filterFound[0] : null;
    if (item === null) {
        const error = `could not find ${R.dropLast(1, itemType)} with id ${lookFor}`;
        console.error(error);
        return error;
    }
    const lensPath = getLensPath({ items: result, target: item, itemType, rootFolderId });
    // console.log(result);
    console.log(R.view(lensPath, data));
    return lensPath;
};

export const getFileById = R.curry(getItemById)('files');
export const getFolderById = R.curry(getItemById)('folders');

getFileById({ items: data.null.folders, lookFor: 444, parentId: null });
getFileById({ items: data.null.folders, lookFor: 445, parentId: null });
getFolderById({ items: data.null.folders, lookFor: 445, parentId: null });
getFolderById({ items: data.null.folders, lookFor: 13, parentId: null });
