// @flow
import R from 'ramda';

let uid = 0;
/**
 * Returns an id that is unique whithin this application
 *
 * @return     {string}  The uid.
 */
export function getUID(): string {
    uid += 1;
    return `${uid}${Date.now()}`;
}

/**
 * Returns a globally unique id
 */
export function getUUID() {
    // not needed yet
    // see: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
}

// type ItemType = {
//     is_trashed?: boolean,
// };
type ItemType = FolderType | FileType;

// const resetNew = array => R.map(f => ({ ...f, is_new: false }), array);

// Note that files and folders can be undefined during the first run when the state get
// rehydrated from the local storage: see updates.md
const filterTrashed = (array: ItemType[]): ItemType[] =>
    R.filter((f: ItemType): boolean => (R.isNil(f) === false && f.is_trashed !== true), array);
// R.filter((f: ItemType): boolean => (f.is_trashed !== true), array);
const filterTrashedInverted = (array: ItemType[]): ItemType[] =>
    R.filter((f: ItemType): boolean => (R.isNil(f) === false && f.is_trashed === true), array);
// R.filter((f: ItemType): boolean => (f.is_trashed === true), array);

const sortAscendingBy = (key: string, array: ItemType[]): ItemType[] =>
    R.sortBy(R.prop(key), array);
// R.sortBy(R.ascend(R.prop(key)), array);
const sortDescendingBy = (key: string, array: ItemType[]): ItemType[] =>
    R.sortBy(R.prop(key), array);
// R.sortBy(R.descend(R.prop(key)), array);
/*
 const sortAscendingBy = (key: string, array: ItemType[]): ItemType[] =>
 R.sort((a: ItemType, b: ItemType): number => {
 let propA = a[key];
 let propB = b[key];
 if (typeof propA === 'string') {
 propA = propA.toLowerCase();
 propB = propB.toLowerCase();
 }
 // console.log('asc', key, propA, propB);
 if (propA < propB) {
 return -1;
 }
 if (propA > propB) {
 return 1;
 }
 return 0;
 }, array);

 const sortDescendingBy = (key: string, array: ItemType[]): ItemType[] =>
 R.sort((a: ItemType, b: ItemType): number => {
 let propA = a[key];
 let propB = b[key];
 if (typeof propA === 'string') {
 propA = propA.toLowerCase();
 propB = propB.toLowerCase();
 }
 // console.log('desc', key, propA, propB);
 if (propB < propA) {
 return -1;
 }
 if (propB > propA) {
 return 1;
 }
 return 0;
 }, array);
 */
const getFiles = (ids: string[], filesById: FilesByIdType): FileType[] =>
    R.map((id: string): FileType => filesById[id], ids);

const getFolders = (ids: string[], foldersById: FoldersByIdType): FolderType[] =>
    R.map((id: string): FolderType => foldersById[id], ids);

const getFileCount = (fileIds: string[], filesById: FilesByIdType): number =>
    R.compose(R.length, filterTrashed, getFiles)(fileIds, filesById);

const getFolderCount = (folderIds: (string)[], foldersById: FoldersByIdType): number =>
    R.compose(R.length, filterTrashed, getFolders)(folderIds, foldersById);


// recurse into sub folders and retrieve the ids of all files and folders
const getItemIds = (folderId: string,
    collectedItemIds: { files: string[], folders: (string)[] },
    tree: TreeType,
) => {
    const folder: TreeFolderType = tree[folderId];
    if (typeof folder === 'undefined') {
        return;
    }
    collectedItemIds.files.push(...folder.fileIds);
    // collectedItemIds.files = R.uniq(collectedItemIds.files);
    const subFolderIds = folder.folderIds;
    collectedItemIds.folders.push(folderId, ...subFolderIds);
    // collectedItemIds.folders = R.uniq(collectedItemIds.folders);
    subFolderIds.forEach((id: string) => {
        getItemIds(id, collectedItemIds, tree);
    });
};


// type ItemType = FolderType | FileType;
const reduceToMap = (arr: ItemType[]): { [id: string]: ItemType } =>
    R.reduce((acc: { [id: string]: ItemType }, item: ItemType): { [id: string]: ItemType } =>
        ({ ...acc, [item.id]: item }), {}, arr);

const createError = (type: string, messages?: string[], data?: { [string]: string }): ErrorType => ({
    id: getUID(),
    data,
    type,
    messages: messages || [],
});

// remove entries from the tree that don't exist anymore in filesById and foldersById
const shakeTree = (tree: TreeType, filesById: FilesByIdType, foldersById: FoldersByIdType): TreeType => {
    const treeClone = { ...tree };
    R.forEach((id: string) => {
        if (typeof foldersById[id] === 'undefined') {
            console.log('shaking folder', id, 'from tree');
            delete treeClone[id];
        } else {
            const files = tree[id].fileIds;
            const filtered = R.filter((id2: string): boolean => {
                if (typeof filesById[id2] === 'undefined') {
                    console.log('shaking file', id2, 'from tree');
                    return false;
                }
                return true;
            }, files);
            treeClone[id].fileIds = filtered;
        }
    }, R.keys(tree));

    return treeClone;
};

export {
    filterTrashed,
    filterTrashedInverted,
    sortAscendingBy,
    sortDescendingBy,
    getFileCount,
    getFolderCount,
    getItemIds,
    reduceToMap,
    createError,
    shakeTree,
};
