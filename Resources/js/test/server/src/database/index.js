/**
 * Functions that perform actions on the JSON dummy database. Every time the
 * server runs the same set of initial data is imported from ./data.js. This
 * data gets altered by the functions below, but all changes are volatile.
 */
import R from 'ramda';
import data from './data';
import { createFolderDescription } from '../util';


/**
 * Gets the contents of a folder
 *
 * @param      {number}  folderId  The id of the folder
 * @return     {Object}  Object.files: all files in this folder Object.folders:
 *                       all subfolders in this folder. In some cases a critical
 *                       error is simulated; this returns a fake error message.
 */
const getFolder = (folderId) => {
    // fake and real errors
    // console.log(folderId);
    const folderData = data.tree[folderId];
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
    let { files, folders } = folderData;
    files = files.map(id => data.files[id]);
    folders = folders.map(id => data.folders[id]);

    return {
        files,
        folders,
    };
};


/**
 * Adds a new folder.
 *
 * @param      {string}   name      The name of the new folder
 * @param      {?number}  parentId  The id of the parent folder of the new
 *                                  folder
 * @return     {Object}   Object.new_folders: array containing folder
 *                        description object. Object.errors: array containing
 *                        non critical error messages. In some cases a critial
 *                        error is simulated; this returns an fake error
 *                        message.
 */
const addFolder = (name, parentId) => {
    // fake error
    if (name === 'errorfolder') {
        return {
            error: 'Could not create folder "errorfolder"',
        };
    }

    const folder = createFolderDescription({
        name,
        parent: parentId,
        file_count: 0,
        folder_count: 0,
    });

    // store the new folder in the database
    data.folders[folder.id] = folder;
    data.tree[folder.id] = {
        files: [],
        folders: [],
    };

    // update the parent folder of the new folder
    data.tree[parentId].folders.push(folder.id);
    data.folders[parentId].folder_count = data.tree[parentId].folders.length;

    return {
        new_folders: [folder],
        errors: [],
    };
};


/**
 * Deletes a folder in the database
 *
 * @param      {number}  folderId  The id of the folder to be deleted
 * @return     {Object}  Returns a no-error object, or a fake error message
 */
const deleteFolder = (folderId) => {
    // test error
    if (folderId === 1000) {
        return {
            error: 'Folder could not be deleted',
        };
    }

    const folder = data.folders[folderId];
    folder.isTrashed = true;

    const files = data.tree[folderId].files;
    R.forEach((f) => {
        const f1 = { ...f, isTrashed: true };
        data.files[f.id] = f1;
    }, files);

    const folders = data.tree[folderId].folders;
    R.forEach((f) => {
        const f1 = { ...f, isTrashed: true };
        data.folders[f.id] = f1;
    }, folders);

    return {
        error: false,
    };
};

/**
 * Adds newly uploaded files to the database, called by uploadFiles() defined in
 * ./api/upload_files.js
 *
 * @param      {Array<Object>}  files     Array containing the file description
 *                                        objects of the uploaded files.
 * @param      {?number}        folderId  The id of the folder where the files
 *                                        will be added to
 * @return     {void}           returns void
 */
const addFiles = (files, folderId) => {
    // console.log(files, folderId)
    files.forEach((file) => {
        data.files[file.id] = file;
        data.tree[folderId].files.push(file.id);
    });
    data.folders[folderId].file_count = data.tree[folderId].files.length;
};


/**
 * Utility function that finds files in folders and removes them. Used by
 * moveFiles()
 *
 * @param      {Array<number>}  file_ids           The ids of the files that
 *                                                 will be removed
 * @param      {?number}        exclude_folder_id  The id of the folder whose
 *                                                 contents will not be
 *                                                 affected.
 */
const removeFilesFromFolders = (fileIds, excludeFolderId) => {
    Object.keys(data.folders).forEach((folderId) => {
        if (folderId !== excludeFolderId) {
            // console.log(`checking folder ${folderId}`)
            const folder = data.folders[folderId];
            // array containing ids of all the files in this folder
            const ids = data.tree[folderId].files;
            // console.log(` - files in this folder ${ids}`)
            // filter files
            fileIds.forEach((id) => {
                const index = ids.indexOf(id);
                // console.log(` - filtering ${id} found at index ${index}`)
                if (index !== -1) {
                    // console.log(`removing file '${id}'' from folder '${folderId}'`)
                    data.tree[folderId].files.splice(index, 1);
                    folder.file_count -= 1;
                }
            });
        }
    });
};


/**
 * Moves files from one folder to another. the files can be moved from several
 * different folders but are moved to one single folder
 *
 * @param      {Array<number>}  fileIds   The ids of the files that will be
 *                                        moved
 * @param      {?number}        folderId  The id of the folder where the files
 *                                        will be moved to
 * @return     {Object}         Returns a no-error object, or a fake error
 *                              message
 */
const moveFiles = (aFileIds, folderId) => {
    // test error
    if (folderId === 1000) {
        return {
            error: 'Could not move files to folder with id "1000"',
        };
    }
    let fileIds;
    // remove files from their original location
    if (aFileIds instanceof Array === false) {
        fileIds = [aFileIds];
    } else {
        fileIds = aFileIds;
    }
    fileIds = fileIds.map(id => parseInt(id, 10));
    removeFilesFromFolders(fileIds, folderId);
    // add files to the files array of the new folder
    data.tree[folderId].files.push(...fileIds);
    // update file count
    data.folders[folderId].file_count += fileIds.length;
    // console.log('data %j', data)
    return {
        error: false,
    };
};


/**
 * Deletes a file from the database
 *
 * @param      {number}  fileId  The id of the file that will be removed
 * @return     {Object}  Returns a no-error object, or a faked error message
 */
const deleteFile = (fileId) => {
    // for testings error messages
    if (fileId === 1000) {
        // fileId 1000 does probably not really exist so no need to remove it
        return {
            error: 'File could not be deleted!',
        };
    }
    // perform delete
    const file = R.clone(data.files[fileId]);
    file.isTrashed = true;
    data.files[fileId] = file;
    return {
        error: false,
    };
    // return {
    //     error: 'Dikke vette error man!',
    // };
};

const reduceToMap = arr => R.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}, arr);

const emptyRecycleBin = () => {
    // find all files with the isTrashed flag set to 'true' and delete them
    data.files = R.compose(reduceToMap, R.filter(f => f.isTrashed !== true))(R.values(data.files));
    data.folders = R.compose(reduceToMap, R.filter(f => f.isTrashed !== true))(R.values(data.folders));
    // console.log(data.files);
    // console.log(data.folders);
    const tmp = R.forEach((key) => {
        if (R.isNil(data.folders[key])) {
            return null;
        }
        const item = data.tree[key];
        // console.log(key, item.files);
        // console.log(R.filter(id => R.isNil(data.files[id]) === false, item.files));
        const t = {
            files: R.filter(id => R.isNil(data.files[id]) === false, item.files),
            folders: R.filter(id => R.isNil(data.folders[id]) === false, item.folders),
        };
        console.log(key, t);
        return t;
    }, R.keys(data.tree));
    console.log(tmp);

    return {
        error: false,
        files: data.files,
        folders: data.folders,
    };
};


export default{
    getFolder,
    addFolder,
    deleteFolder,
    addFiles,
    moveFiles,
    deleteFile,
    emptyRecycleBin,
};
