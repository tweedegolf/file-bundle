import R from 'ramda';

const data = {
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

const getIds = (array) => R.map(item => item.id, array);

const isNotLast = (max, acc, i) => {
    console.log('isNotLast', max, i);
    return i !== max;
};
const isNotFound = (test, acc, folder) => test !== folder.id;

const findInArray = (id, array) => R.filter(item => item.id === id, array);

const find = (folder, id, level) => {
    // console.log(folder.folders);
    if (folder.id === id) {
        return [true];
    } else if (R.isNil(folder.folders) === false) {
        level += 1;
        const t = R.map(f => find(f, id, level), folder.folders);
        console.log(level, folder.id, getIds(folder.folders), t);
        return t;
    }
    return [false];
};
const n = null;
// const r = find(data[n], 3, 0);
// const r = findInArray(3, data.null.folders);

const check = (item, index, lookFor, parentId, level) => {
    const c = item.id === lookFor;
    if (R.isNil(item.folders) === false) {
        level += 1;
        const r = loop(item.folders, lookFor, item.id, level);
        // console.log(item.id, R.flatten(r))
        return [{
            level,
            index,
            parent: parentId,
            id: item.id,
            found: c,
        }, ...r];
    }
    return [{
        level,
        index,
        parent: parentId,
        id: item.id,
        found: c,
    }];
};

const mapIndexed = R.addIndex(R.map);

const loop = (items, lookFor, parentId, level) => {
    // console.log(id, level);
    return mapIndexed((item, index) => check(item, index, lookFor, parentId, level), items);
};
const parentId = null;
const lookFor = 132;
const level = 0;
const tmp = loop(data.null.folders, lookFor, parentId, level);
const result = R.flatten(tmp);

const filterFound = R.filter(o => o.found, R.flatten(result));
console.log(filterFound);
const found = R.length(filterFound) !== 0 ? filterFound[0] : null;
console.log(found);


const getParent = (items, node) => {
    const parentId = node.parent;
    const filtered = R.filter((item) => {
        return item.id === parentId;
    }, items);
    const parent = R.length(filtered) !== 0 ? filtered[0] : null;
    // console.log(parentId, parent);
    return parent;
};

const getPath = (items, target) => {
    const path = [target.index];
    let parent = getParent(items, target);
    if (parent === null) {
        return path;
    }
    path.push(parent.index);
    let level = parent.level;
    while(level > 1) {
        parent = getParent(items, parent);
        path.push(parent.index);
        level = parent.level;
    }
    const reverse = R.reverse(path);
    return R.reduce((acc, item) => [...acc, 'folders', item], [null], reverse);
};

const p = getPath(result, found);
const lensPath = R.lensPath(p);
console.log(p);
console.log(R.view(lensPath, data));

export default 42;

/*
const traverseTree = (folder, id, accum) => {
    // if (R.isNil(folder.folders)) {
    //     // const isNotLastCurried = R.curry(isNotLast)(accum.depth * 2);
    //     // const tmp = R.takeLastWhile(isNotLastCurried, accum.path);
    //     const tmp = accum.path.slice(0, R.length(accum.path) - (accum.depth * 2));
    //     console.log('dead end', accum.path, accum.depth * 2, tmp);
    //     return {
    //         path: tmp,
    //         index: accum.index + 1,
    //         depth: 0,
    //     };
    // }
    // console.log('accum', accum.path);
    // let path = [...accum.path, 'folders'];
    // const last = R.takeLast(1, accum.path);
    // if (R.length(last) !== 0 && last[0] !== 0) {
    //     console.log(R.take(R.length(accum.path) - 2, accum.path));
    //     path = [...R.take(R.length(accum.path) - 2, accum.path), last[0], 'folders'];
    // }
    // console.log('clone', path);
    //
    //
    console.log('searching in', folder.id, 'has folders', R.isNil(folder.folders) === false);

    if (R.isNil(folder.folders) === false) {
        const accum1 = {
            path: [...accum.path, 'folders'],
            index: accum.index,
            depth: accum.depth + 1,
        };

        const isNotFoundCurried = R.curry(isNotFound)(id);

        return R.reduceWhile(isNotFoundCurried, (acc, subfolder) => {
            const acc1 = {
                path: [...acc.path, acc.index],
                index: acc.index,
                depth: acc.depth,
            };
            return traverseTree(subfolder, id, acc1);
        }, { index: accum.index, depth: accum1.depth, path: accum1.path }, folder.folders);
    } else {
        return true;
    }
};


const findInTree = (tree, id, idRootFolder) => {
    if (id === idRootFolder) {
        return [idRootFolder];
    }
    const result = traverseTree(tree[idRootFolder], id, { index: 0, depth: 0, path: [] });
    // console.log(result);
    // return [idRootFolder, ...result.path, result.index];
    return false;
};

const rootFolderId = null; // easy way to chroot!
const path = findInTree(data, 3, rootFolderId);
// const lensPath = R.lensPath(path);

// console.log('path', path);
// console.log('found', R.view(lensPath, data));
*/