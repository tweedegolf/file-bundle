// @flow
/**
 * Functions that perform actions on the JSON dummy database. Every time the
 * server runs the same set of initial data is imported from ./data.js. This
 * data gets altered by the functions below, but all changes are volatile.
 */
import R from 'ramda';
import data from './data.json';
import { createFolderDescription, RECYCLE_BIN_ID } from '../util';
import { getFileCount, getFolderCount } from '../../../../src/util/util';

type ErrorType = {
    error: string,
};

type SuccessType = {
    msg: string,
};


type OpenFolderType = {
    files: FileType[],
    folders: FolderType[],
};

const openFolder = (folderId: string): ErrorType | OpenFolderType => {
    // fake and real errors
    const folderData: TreeFolderType = data.tree[folderId];
    if (typeof folderData === 'undefined' || folderId === 1000) {
        // folder id 1000 is a test id -> this alway generates an error
        if (folderId !== 1000) {
            console.error('this should not happen!');
        }
        return {
            error: 'Could not open folder: folder not found',
        };
    }

    // map file and folder ids to their corresponding description objects
    const { fileIds, folderIds } = folderData;
    return {
        files: R.map((id: string): FileType => data.files[id], fileIds),
        folders: R.map((id: string): FolderType => data.folders[id], folderIds),
    };
};


type AddFolderType = {
    new_folders: FolderType[],
    errors: string[],
};
const addFolder = (name: string, parentId: string): ErrorType | AddFolderType => {
    // fake error
    if (name === 'errorfolder') {
        return {
            error: 'Could not create folder "errorfolder"',
        };
    }

    // add metadata to folder like creation date
    const folder: FolderType = createFolderDescription({
        name,
        parent: parentId,
        file_count: 0,
        folder_count: 0,
    });

    // store the new folder in the database
    data.folders[folder.id] = folder;
    data.tree[folder.id] = {
        fileIds: [],
        folderIds: [],
    };

    // update the parent folder of the new folder
    data.tree[parentId].folderIds.push(folder.id);
    data.folders[parentId].folder_count += 1;

    return {
        new_folders: [folder],
        errors: [],
    };
};


const renameFolder = (folderId: string, newName: string): ErrorType | SuccessType => {
    // fake error
    if (newName === 'errorfolder') {
        return {
            error: 'Could not create folder "errorfolder"',
        };
    }

    // store the new folder with the new name in the database
    const folder: FolderType = data.folders[folderId];
    data.folders[folder.id] = { ...folder, name: newName };

    return { msg: 'ok' };
};


// util function: recurse into all nested sub folders and retrieve the ids of all files and folders
const getItemIds = (folderId: string, collectedIds: { files: string[], folders: string[] }) => {
    const folder: TreeFolderType = data.tree[folderId];
    collectedIds.files.push(...folder.fileIds);
    const subFolderIds = folder.folderIds;
    collectedIds.folders.push(folderId, ...subFolderIds);
    subFolderIds.forEach((id: string) => {
        getItemIds(id, collectedIds);
    });
};

const deleteFolder = (deletedFolderId: string): ErrorType | SuccessType => {
    // test error
    if (deletedFolderId === 1000) {
        return {
            error: 'Folder could not be deleted',
        };
    }
    const collectedItemIds: { files: string[], folders: string[] } = {
        files: [],
        folders: [],
    };
    getItemIds(deletedFolderId, collectedItemIds);

    data.tree[RECYCLE_BIN_ID].folderIds.push(deletedFolderId);

    R.uniq(collectedItemIds.files).forEach((id: string) => {
        const file = data.files[id];
        data.files[id] = { ...file, isTrashed: true };
    });

    R.uniq(collectedItemIds.folders).forEach((id: string) => {
        const folder = data.folders[id];
        data.folders[id] = { ...folder, isTrashed: true };
    });
    // TODO: update file_count and folder_count
    return {
        msg: 'ok',
    };
};


const addFiles = (files: FileType[], folderId: string): SuccessType => {
    // console.log(files, folderId)
    files.forEach((file: FileType) => {
        data.files[file.id] = file;
        data.tree[folderId].fileIds.push(file.id);
    });
    data.folders[folderId].file_count = data.tree[folderId].fileIds.length;

    return {
        msg: 'ok',
    };
};


const moveItems = (
    fileIds: string[],
    folderIds: string[],
    targetFolderId: string): ErrorType | SuccessType => {
    // test error
    if (targetFolderId === 1000) {
        return {
            error: 'Could not move files to folder with id "1000"',
        };
    }

    // add files and folders to current folder
    R.forEach((id: string) => {
        const file = data.files[id];
        data.files[id] = { ...file, isTrashed: false };
        data.tree[targetFolderId].fileIds.push(id);
    }, fileIds);
    data.folders[targetFolderId].file_count =
        getFileCount(data.tree[targetFolderId].fileIds, data.files);

    R.forEach((id: string) => {
        const folder = data.folders[id];
        data.folders[id] = { ...folder, parent: targetFolderId, isTrashed: false };
        data.tree[targetFolderId].folderIds.push(id);
    }, folderIds);
    data.folders[targetFolderId].folder_count =
        getFolderCount(data.tree[targetFolderId].folderIds, data.folders);

    // remove files and folders from original location
    const filterTargetFolder = ([id]: [string]): boolean => id !== targetFolderId;
    R.forEach(([key, treeFolder]: [string, TreeFolderType]) => {
        data.tree[key].fileIds = R.without(fileIds, treeFolder.fileIds);
        data.tree[key].folderIds = R.without(folderIds, treeFolder.folderIds);
    }, R.compose(R.filter(filterTargetFolder), R.toPairs)(data.tree));

    return {
        msg: 'ok',
    };
};


const deleteFile = (fileId: string): ErrorType | SuccessType => {
    // for testings error messages
    if (fileId === 1000) {
        // fileId 1000 does probably not really exist so no need to remove it
        return {
            error: 'File could not be deleted!',
        };
    }

    // delete file from folder object
    const file: FileType = data.files[fileId];
    file.isTrashed = true;
    data.files[fileId] = file;
    data.tree[RECYCLE_BIN_ID].fileIds.push(fileId);

    // find folderId of folder
    const checkId = (id: string): boolean => id === fileId;
    const inFolder = R.filter((folderId: string): boolean =>
        R.findIndex(checkId, data.tree[folderId].fileIds) !== -1, R.keys(data.tree));

    if (R.length(inFolder) > 0) {
        const folderId = inFolder[0];
        const fileCount = data.folders[folderId].file_count;
        data.folders[folderId].file_count = fileCount - 1;
    }

    return {
        msg: 'ok',
    };
};

type ItemType = FolderType | FileType;
const reduceToMap = (arr: ItemType[]): {[id: string]: ItemType} =>
    R.reduce((acc: {[id: string]: ItemType}, item: ItemType): {[id: string]: ItemType} =>
        ({ ...acc, [item.id]: item }), {}, arr);

const filterDeleted = (arr: string[]): null | [string, TreeFolderType] =>
    R.map((key: string): null | [string, TreeFolderType] => {
        if (R.isNil(data.folders[key])) {
            return null;
        }
        const item = data.tree[key];
        const t = {
            fileIds: R.filter((id: string): boolean =>
                R.isNil(data.files[id]) === false, item.fileIds),
            folderIds: R.filter((id: string): boolean =>
                R.isNil(data.folders[id]) === false, item.folderIds),
        };
        return [key, t];
    }, arr);

const emptyRecycleBin = (): OpenFolderType => {
    // find all files with the isTrashed flag set to 'true' and delete them
    data.files = R.compose(
        reduceToMap,
        R.filter((f: FileType): boolean => f.isTrashed !== true),
    )(R.values(data.files));

    data.folders = R.compose(
        reduceToMap,
        R.filter((f: FolderType): boolean => f.isTrashed !== true),
    )(R.values(data.folders));

    data.tree = R.compose(R.fromPairs, R.reject(R.isNil), filterDeleted)(R.keys(data.tree));

    data.tree[RECYCLE_BIN_ID] = {
        fileIds: [],
        folderIds: [],
    };

    return {
        files: data.files,
        folders: data.folders,
    };
};


const restoreFromRecycleBin = (fileIds: string[], folderIds: string[]): OpenFolderType => {
    // console.log('restore files:', fileIds, 'restore folders:', folderIds);
    fileIds.forEach((id: string) => {
        data.files[id].isTrashed = false;
    });

    folderIds.forEach((id: string) => {
        data.folders[id].isTrashed = false;
    });

    const bin = { ...data.tree[RECYCLE_BIN_ID] };
    data.tree[RECYCLE_BIN_ID] = {
        fileIds: R.without(fileIds, bin.fileIds),
        folderIds: R.without(folderIds, bin.folderIds),
    };

    // TODO: get all items in folder because the client does not
    // pass all ids if the folder in the recycle bin hasn't been opened yet!

    return {
        files: data.files,
        folders: data.folders,
    };
};

export default{
    openFolder,
    addFolder,
    renameFolder,
    deleteFolder,
    addFiles,
    moveItems,
    deleteFile,
    emptyRecycleBin,
    restoreFromRecycleBin,
    getData: (): TreeType => data,
};
