// @flow
/**
 * Functions that perform actions on the JSON dummy database. Every time the
 * server runs the same set of initial data is imported from ./data.js. This
 * data gets altered by the functions below, but all changes are volatile.
 */
import R from 'ramda';
import data from './data.json';
import { createFolderDescription, RECYCLE_BIN_ID } from '../util';
import { getFileCount, getFolderCount, getItemIds } from '../../../../src/util/util';

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

const {
    tree,
    files: filesById,
    folders: foldersById,
} = data;

const openFolder = (folderId: string): ErrorType | OpenFolderType => {
    // fake and real errors
    const folderData: TreeFolderType = tree[folderId];
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
        files: R.map((id: string): FileType => filesById[id], fileIds),
        folders: R.map((id: string): FolderType => foldersById[id], folderIds),
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
    foldersById[folder.id] = folder;
    tree[folder.id] = {
        fileIds: [],
        folderIds: [],
    };

    // update the parent folder of the new folder
    tree[parentId].folderIds.push(folder.id);
    foldersById[parentId].folder_count += 1;

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
    const folder: FolderType = foldersById[folderId];
    foldersById[folder.id] = { ...folder, name: newName };

    return { msg: 'ok' };
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
    getItemIds(deletedFolderId, collectedItemIds, tree);

    tree[RECYCLE_BIN_ID].folderIds.push(deletedFolderId);

    R.uniq(collectedItemIds.files).forEach((id: string) => {
        const file = filesById[id];
        filesById[id] = { ...file, isTrashed: true };
    });

    R.uniq(collectedItemIds.folders).forEach((id: string) => {
        const folder = foldersById[id];
        foldersById[id] = { ...folder, isTrashed: true };
    });
    // TODO: update file_count and folder_count
    return {
        msg: 'ok',
    };
};


const addFiles = (files: FileType[], folderId: string): SuccessType => {
    // console.log(files, folderId);
    files.forEach((file: FileType) => {
        filesById[file.id] = file;
        tree[folderId].fileIds.push(file.id);
    });
    foldersById[folderId].file_count += files.length;

    return {
        msg: 'ok',
    };
};


const moveItems = (
    fileIds: string[],
    folderIds: string[],
    currentFolderId: string): ErrorType | SuccessType => {
    // test error
    if (currentFolderId === 1000) {
        return {
            error: 'Could not move files to folder with id "1000"',
        };
    }

    const collectedItemIds = {
        files: [],
        folders: [],
    };

    const currentFolder = foldersById[currentFolderId];

    fileIds.forEach((id: string) => {
        tree[currentFolderId].fileIds.push(id);
    });

    folderIds.forEach((id: string) => {
        tree[currentFolderId].folderIds.push(id);
        getItemIds(id, collectedItemIds, tree);
    });

    tree[currentFolderId].fileIds = R.uniq(tree[currentFolderId].fileIds);
    tree[currentFolderId].folderIds = R.uniq(tree[currentFolderId].folderIds);

    // set isTrashed flag to false
    R.forEach((id: string) => {
        const file = filesById[id];
        filesById[id] = { ...file, isTrashed: false };
    }, [...fileIds, ...R.uniq(collectedItemIds.files)]);
    currentFolder.file_count = getFileCount(tree[currentFolderId].fileIds, filesById);

    R.forEach((id: string) => {
        const folder = foldersById[id];
        foldersById[id] = { ...folder, parent: currentFolderId, isTrashed: false };
    }, [...folderIds, ...R.uniq(collectedItemIds.folders)]);
    currentFolder.folder_count = getFolderCount(tree[currentFolderId].folderIds, foldersById);

    foldersById[currentFolderId] = currentFolder;

    // remove files and folders from original location
    const removeCurrentFolder = ([key]: [string]): boolean => key !== currentFolderId;
    R.forEach(([key, treeFolder]: [string, TreeFolderType]) => {
        tree[key].fileIds = R.without(fileIds, treeFolder.fileIds);
        tree[key].folderIds = R.without(folderIds, treeFolder.folderIds);
    }, R.compose(R.filter(removeCurrentFolder), R.toPairs)(tree));

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
    const file: FileType = filesById[fileId];
    file.isTrashed = true;
    filesById[fileId] = file;
    tree[RECYCLE_BIN_ID].fileIds.push(fileId);

    // find folderId of folder
    const checkId = (id: string): boolean => id === fileId;
    const inFolder = R.filter((folderId: string): boolean =>
        R.findIndex(checkId, tree[folderId].fileIds) !== -1, R.keys(tree));

    if (R.length(inFolder) > 0) {
        const folderId = inFolder[0];
        const fileCount = foldersById[folderId].file_count;
        foldersById[folderId].file_count = fileCount - 1;
    }

    return {
        msg: 'ok',
    };
};


const emptyRecycleBin = (): SuccessType => {
    const fileIds = R.filter((id: string): boolean =>
        filesById[id].isTrashed === true, R.keys(filesById));

    const folderIds = R.filter((id: string): boolean =>
        foldersById[id].isTrashed === true, R.keys(foldersById));

    R.forEach((id: string) => {
        delete filesById[id];
    }, fileIds);

    R.forEach((id: string) => {
        delete tree[id];
        delete foldersById[id];
    }, folderIds);

    // clean up tree, this cleans up the recycle bin as well
    R.forEach((id: string) => {
        tree[id].fileIds = R.without(fileIds, tree[id].fileIds);
        tree[id].folderIds = R.without(folderIds, tree[id].folderIds);
    }, R.keys(tree));

    return {
        msg: 'ok',
    };
};
/*
type MetaDataType = {
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};
const getMetaData = (fileIds: string[], folderIds: string[]): MetaDataType => {
    const files = fileIds.reduce((acc: FilesByIdType, id: string): FilesByIdType => {
        acc[id] = filesById[id];
        return acc;
    }, {});

    const folders = folderIds.reduce((acc: FoldersByIdType, id: string): FoldersByIdType => {
        acc[id] = foldersById[id];
        return acc;
    }, {});

    return {
        filesById: files,
        foldersById: folders,
    };
};
*/

const getMetaData = (fileIds: string[], folderIds: string[]): OpenFolderType => {
    const files = fileIds.map((id: string): FileType => filesById[id]);
    const folders = folderIds.map((id: string): FolderType => foldersById[id]);

    return {
        files: files.filter((f: FileType): boolean => R.isNil(f) === false),
        folders: folders.filter((f: FolderType): boolean => R.isNil(f) === false),
    };
};


const restoreFromRecycleBin = (fileIds: string[], folderIds: string[]): SuccessType => {
    // console.log('restore files:', fileIds, 'restore folders:', folderIds);
    fileIds.forEach((id: string) => {
        filesById[id].isTrashed = false;
    });

    folderIds.forEach((id: string) => {
        foldersById[id].isTrashed = false;
    });

    const bin = { ...tree[RECYCLE_BIN_ID] };
    tree[RECYCLE_BIN_ID] = {
        fileIds: R.without(fileIds, bin.fileIds),
        folderIds: R.without(folderIds, bin.folderIds),
    };

    // TODO: get all items in folder because the client does not
    // pass all ids if the folder in the recycle bin hasn't been opened yet!
    return {
        msg: 'ok',
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
    getMetaData,
    getData: (): TreeType => data,
};
