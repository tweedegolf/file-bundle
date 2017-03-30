import R from 'ramda';

const data = {
    null: {
        id: null,
        folders: [{
            id: 1,
            folders: [{
                id: 11,
                name: 'konijn',
                create_ts: 143239123123123123,
                folders: [{
                    name: 'aap',
                    create_ts: 1231239123123123123,
                    id: 111,
                    folders: [{
                        id: 1111,
                    }],
                }],
            }, {
                id: 12,
                name: 'mus',
                create_ts: 243239123123123123,
                folders: [{
                    name: 'winterkoninkje',
                    create_ts: 1231239123123123123,
                    id: 121,
                }],
            }],
        }],
    },
};

const isNotLast = (max, acc, i) => {
    console.log('isNotLast', max, i);
    return i !== max;
};
const isNotFound = (test, acc, folder) => test !== folder.id;

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
