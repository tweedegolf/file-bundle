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
//     isTrashed?: boolean,
// };
type ItemType = FolderType | FileType;

// const resetNew = array => R.map(f => ({ ...f, isNew: false }), array);
const filterTrashed = (array: ItemType[]): ItemType[] =>
    R.filter((f: ItemType): boolean => (f.isTrashed !== true), array);
const filterTrashedInverted = (array: ItemType[]): ItemType[] =>
    R.filter((f: ItemType): boolean => (f.isTrashed === true), array);

const sortAscendingBy = (key: string, array: ItemType[]): ItemType[] => 
    // const func = R.ascend();
     R.sortBy(R.prop(key), array);
const sortDescendingBy = (key: string, array: ItemType[]): ItemType[] => 
    // const func = R.descend(R.prop(key));
     R.sortBy(R.prop(key), array);

const getFiles = (ids: string[], filesById: FilesByIdType): FileType[] =>
    R.map((id: string): FileType => filesById[id], ids);

const getFolders = (ids: string[], foldersById: FoldersByIdType): FolderType[] =>
    R.map((id: string): FolderType => foldersById[id], ids);

const getFileCount = (fileIds: string[], filesById: FilesByIdType): number =>
    R.compose(R.length, filterTrashed, getFiles)(fileIds, filesById);
const getFolderCount = (folderIds: string[], foldersById: FoldersByIdType): number =>
    R.compose(R.length, filterTrashed, getFolders)(folderIds, foldersById);


// recurse into sub folders and retrieve the ids of all files and folders
const getItemIds = (folderId: string,
    collectedItemIds: { files: string[], folders: string[] },
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
const reduceToMap = (arr: ItemType[]): {[id: string]: ItemType} =>
    R.reduce((acc: {[id: string]: ItemType}, item: ItemType): {[id: string]: ItemType} =>
        ({ ...acc, [item.id]: item }), {}, arr);

export {
    filterTrashed,
    filterTrashedInverted,
    sortAscendingBy,
    sortDescendingBy,
    getFileCount,
    getFolderCount,
    getItemIds,
    reduceToMap,
};
