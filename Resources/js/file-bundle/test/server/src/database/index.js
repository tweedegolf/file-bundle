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
    const parentId = folder.parent;
    // the array of folders inside the parent folder
    const folders = data.tree[parentId].folders;
    // find the index of the folder that will be deleted
    const index = folders.indexOf(folderId);
    // remove the folder id of the folder that will be deleted
    if (index !== -1) {
        data.tree[parentId].folders.splice(index, 1);
    }
    // update parent folder
    data.folders[parentId].folder_count--;
    // perform the actual delete
    delete data.folders[folderId];
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
const removeFilesFromFolders = function (file_ids, exclude_folder_id) {
    Object.keys(data.folders).forEach((folder_id) => {
        if (folder_id !== exclude_folder_id) {
      // console.log(`checking folder ${folder_id}`)
            const folder = data.folders[folder_id];
      // array containing ids of all the files in this folder
            const ids = data.tree[folder_id].files;
      // console.log(` - files in this folder ${ids}`)
      // filter files
            file_ids.forEach((id) => {
                const index = ids.indexOf(id);
        // console.log(` - filtering ${id} found at index ${index}`)
                if (index !== -1) {
          // console.log(`removing file '${id}'' from folder '${folder_id}'`)
                    data.tree[folder_id].files.splice(index, 1);
                    folder.file_count--;
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
const moveFiles = (fileIds, folderId) => {
  // test error
    if (folderId === 1000) {
        return {
            error: 'Could not move files to folder with id "1000"',
        };
    }

  // remove files from their original location
    if (fileIds instanceof Array === false) {
        fileIds = [fileIds];
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
};


const emptyRecycleBin = () => {
    // find all files with the isTrashed flag set to 'true' and delete them
    // use: removeFilesFromFolders
};


export default{
    getFolder,
    addFolder,
    deleteFolder,
    addFiles,
    moveFiles,
    deleteFile,
};
