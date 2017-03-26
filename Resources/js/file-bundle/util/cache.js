/**
 * The cache stores data that has been retrieved from the server. For instance
 * if a user opens a folder for the first time, its contents will be loaded from
 * the server and stored in the cache. The next time the user requests this
 * folder, its contents will be loaded from the cache (unless the contents has
 * been invalidated, which is not yet implemented).
 *
 * If data is needed from the server, the cache calls the server api. The server
 * api is exclusively called from the cache; as such the cache sits between the
 * user actions requesting data and the server.
 *
 * The success callback of the api typically returns an array of objects
 * describing files and/or folders
 *
 * @see        the description of the {@link FileDescr File} and {@link FolderDescr Folder} in the file ./api.js
 *
 * The API return errors as an array of error messages, the cache turns these
 * messages into an error object that can be processed by the error component.
 *
 * An error object looks like so:
 */
/**
 * @name       APIError
 * @type       {Object}
 * @property   {Number}    id        Unique id for every error
 * @property   {String}    type      Type of the error, can be omitted for a
 *                                   generic error, otherwise you can use the
 *                                   same constants as used by the Actions, see
 *                                   ./constants.js
 * @property   {String}    data      Can be omitted or a string representing
 *                                   anything; for instance in case the contents
 *                                   of a folder can not be loaded the data key
 *                                   could hold the name of that folder.
 * @property   {String[]}  messages  The error messages sent by the server
 */
import R from 'ramda';
import api from './api';
import { getUID } from './util';
import * as Constants from './constants';
import { getLocalState, storeLocal } from './local_storage';

let tree;
let allFiles;
let allFolders;
let currentFolderId;


/**
 * Utility function that removes files from all folders that contain these
 * files: if a file exists in multiple folders, it will be removed in all of
 * these folders. Used by moveFiles()
 *
 * @param      {String[]}  fileIds           The ids of the files that need to
 *                                           be removed.
 * @param      {Number}    excludeFolderId   The id of a folder that should be
 *                                           skipped; files in this folder will
 *                                           not be removed. May be left
 *                                           undefined. Note that if you set it
 *                                           to null, the root folder will be
 *                                           skipped since the id of the root
 *                                           folder is null (not: "null"!)
 */
const removeFilesFromFolders = (fileIds, excludeFolderId) => {
    // Object keys are strings! We can't convert them to int because the folder id
    // could be 'null' as well (i.e. in case the folder is the root folder).
    // Therefor we convert excludeFolderId to string.
    const excludeFolderIdString = `${excludeFolderId}`;
    Object.keys(tree).forEach((folderId) => {
        if (folderId !== excludeFolderIdString) {
            const filesInFolder = tree[folderId].fileIds;
            fileIds.forEach((id) => {
                const index = filesInFolder.indexOf(id);
                if (index !== -1) {
                    tree[folderId].fileIds.splice(index, 1);
                    allFolders[folderId].file_count -= 1;
                }
            });
        }
    });
};


/**
 * The init folder hydrates the initial states of the reducers. If data is
 * stored in the local storage it will be loaded into the states of the relevant
 * reducers. Otherwise the states will be hydrated with default values.
 *
 * @return     {?number}  The id of the lastly opened folder, this id is retrieved
 *                        from local storage. If not set, the id will default to
 *                        null, which means the top root folder will be opened
 *
 * @see        the code of the reducers in the reducers folder
 */
const init = () => {
    ({
        tree,
        allFiles,
        allFolders,
        currentFolderId,
    } = getLocalState());
    return currentFolderId;
};


/**
 * @name       openFolderResolve
 * @type       {Object}
 * @property   {Object}   currentFolder  Data object that describes the
 *                                        currently opened folder such as number
 *                                        of files and folders, creation date
 *                                        and so on.
 * @property   {?number}  parentFolder   Id of the parent folder, will be null
 *                                        if the parent folder is the top root
 *                                        folder.
 * @property   {Array}    files           Array containing File data objects for
 *                                        each file in the current folder. The
 *                                        data objects describe the file (name,
 *                                        creation date, size, etc.)
 * @property   {Array}    folders         Array containing Folder data objects
 *                                        for each folder in the current folder.
 *                                        The data objects describe the folder
 *                                        (name, number of files and folders,
 *                                        parent folder, etc.) describe the
 *                                        folder
 * @property   {Array}    selected        Array containing data objects for each
 *                                        file that is selected in the current
 *                                        folder.
 *
 * @see        the description of the {@link FileDescr File} and {@link FolderDescr Folder} in the file ./api.js
 */

/**
 * Loads a folder. If the contents of this folder has been cached, the contents
 * will be loaded from cache, otherwise the contents will be loaded from the
 * server.
 *
 * @param      {?number}  folderId  The id of the folder whose contents needs
 * @return     {Promise}  {@link openFolderResolve resolve} {@link APIError
 *                        reject}
 */
const loadFolder = (folderId) => {
    return new Promise((resolve, reject) => {
        let currentFolder;
        currentFolderId = folderId;
        storeLocal({ currentFolderId });

        let treeFolder = tree[folderId];
        let parentFolder = null;

        if (folderId !== null) {
            parentFolder = { ...allFolders[allFolders[folderId].parent] };
        }

        if (typeof treeFolder !== 'undefined' && treeFolder.needsUpdate === false) {
            const files = treeFolder.fileIds.map((id) => {
                const f = allFiles[id];
                f.new = false;
                return f;
            });
            const folders = treeFolder.folderIds.map((id) => {
                const f = allFolders[id];
                f.new = false;
                return f;
            });

            if (folderId === null) {
                allFolders[folderId].file_count = files.length;
                allFolders[folderId].folder_count = folders.length;
            }

            resolve({
                currentFolder: { ...allFolders[folderId] },
                parentFolder,
                files,
                folders,
            });
        } else {
            currentFolder = { ...allFolders[folderId] };
            api.openFolder(
                folderId,
                (folders, files) => {
                    treeFolder = {};
                    treeFolder.needsUpdate = false;
                    treeFolder.folderIds = [];
                    treeFolder.fileIds = [];

                    folders.forEach((f) => {
                        allFolders[f.id] = f;
                        treeFolder.folderIds.push(f.id);
                    });

                    files.forEach((f) => {
                        allFiles[f.id] = f;
                        treeFolder.fileIds.push(f.id);
                    });

                    tree[folderId] = treeFolder;
                    storeLocal({ tree }, { allFiles }, { allFolders });

                    if (folderId === null) {
                        allFolders[folderId].file_count = files.length;
                        allFolders[folderId].folder_count = folders.length;
                    }

                    resolve({
                        currentFolder,
                        parentFolder,
                        files,
                        folders,
                    });
                },
                (messages) => {
                    const errors = [{
                        id: getUID(),
                        data: currentFolder.name,
                        type: Constants.ERROR_OPENING_FOLDER,
                        messages,
                    }];
                    reject({ errors });
                },
            );
        }
    });
};

/**
 * @name       uploadResolve
 * @type       {Object}
 * @property   {number}    file_count  Updated number of files in the current
 *                                     folder
 * @property   {Object[]}  files       Array containing {@link FileDescr File}
 *                                     objects representing the newly uploaded
 *                                     files.
 * @property   {string[]}  errors      Array containing error messages for the
 *                                     files that could not be uploaded, for
 *                                     instance because they were too large or
 *                                     of an unsupported file format.
 */

/**
 * Adds files to a folder. The files will be uploaded to the server and an array
 * of file objects representing these files will be returned
 *
 * @param      {Array}    file_list  FileList with all uploads converted to an
 *                                   Array
 * @param      {Number}   folderId  The id of the folder where the files get
 *                                   stored.
 * @return     {Promise}  promise {@link uploadResolve resolve} {@link APIError
 *                        reject}
 */
const addFiles = (fileList, folderId) => {
    const treeFolder = tree[folderId];

    return new Promise((resolve, reject) => {
        api.upload(fileList, folderId,
            (rejected, files) => {
                files.forEach((f) => {
                    allFiles[f.id] = f;
                    treeFolder.fileIds.push(f.id);
                    f.new = true;
                });

                const errors = Object.keys(rejected).map(key => ({
                    id: getUID(),
                    type: Constants.ERROR_UPLOADING_FILE,
                    data: key,
                    messages: rejected[key],
                }));

                const fileCount = treeFolder.fileIds.length;
                allFolders[folderId].file_count = fileCount;

                storeLocal({ tree }, { allFiles }, { allFolders });

                resolve({
                    fileCount,
                    files,
                    errors,
                });
            },
            (error) => {
                // console.log(error)
                const errors = [];
                Array.from(fileList).forEach((f) => {
                    errors.push({
                        id: getUID(),
                        type: Constants.ERROR_UPLOADING_FILE,
                        data: f.name,
                        messages: error,
                    });
                });
                reject({ errors });
            },
        );
    });
};


/**
 * @name       pasteFilesResolve
 * @type       {Object}
 * @property   {Array}   files       Array containing the {@link FileDescr File}
 *                                   objects representing the files in the
 *                                   current folder.
 * @property   {number}  file_count  The number of files in the current folder
 */

/**
 * Move file(s) to another folder
 *
 * @param      {Array<number>}  files      Array containing the ids of the files
 *                                         to be moved
 * @param      {?number}        folderId  The id of the folder where the files
 *                                         will be moved to
 * @return     {Promise}        {@link pasteFilesResolve resolve} {@link
 *                              APIError reject}
 */
const moveFiles = (files, folderId) => {
    return new Promise((resolve, reject) => {
        const fileIds = files.map(file => file.id);

        api.paste(fileIds, folderId,
            () => {
                // move files to the new folder
                files.forEach((f) => {
                    f.new = true;
                    tree[folderId].fileIds.push(f.id);
                });
                // get the new file count of the new folder
                const file_count = tree[folderId].fileIds.length;
                allFolders[folderId].file_count = file_count;

                // remove the files from the original folder(s)
                removeFilesFromFolders(fileIds, folderId);
                /*
                        @todo: implementation is buggy; needs some rethinking

                        // In case a file has been moved out of the parent folder of the new
                        // folder, we need to update the file_count so we can update the number
                        // next to the file icon at the top of the browser list (or remove the
                        // icon alltogether in case no files are left in the parent folder)
                        let file_count_parent = 0
                        if(typeof allFolders[folderId] !== 'undefined'){
                          let parentId = allFolders[folderId].parent
                          if(typeof parentId !== 'undefined'){
                            file_count_parent = allFolders[parentId].file_count
                          }
                        }
                        //console.log(parentId, file_count_parent)
                */
                storeLocal({ tree }, { allFolders });
                resolve({
                    // file_count_parent,
                    file_count,
                    files,
                });
            },
            (messages) => {
                const errors = files.map(file => ({
                    id: getUID(),
                    data: file.name,
                    type: Constants.ERROR_MOVING_FILES,
                    messages,
                }));
                reject({ errors });
            },
        );
    });
};

/**
 * @typedef    {Object}  deleteFileResolve
 *
 * @property   {Array}   files       Array containing the {@link FileDescr File}
 *                                   object of the files in the folder.
 * @property   {number}  file_count  The number of the files in the folder.
 */

/**
 * Deletes a single file
 *
 * @param      {number}   file_id    The id of the file to be deleted
 * @param      {?number}  folderId  The id of the folder that contains the file
 * @return     {Promise}  {@link deleteFileResolve resolve} {@link APIError
 *                        reject}
 */
const deleteFile = (fileId, folderId) => {
    const treeFolder = tree[folderId];

    return new Promise((resolve, reject) => {
        api.deleteFile(fileId,
            () => {
                const files = [];
                const fileIds = [];
                treeFolder.fileIds.forEach((id) => {
                    if (id !== fileId) {
                        files.push(allFiles[id]);
                        fileIds.push(id);
                    }
                });
                const fileCount = fileIds.length;
                treeFolder.fileIds = fileIds;
                allFolders[folderId].file_count = fileCount;

                delete allFiles[fileId];
                storeLocal({ tree }, { allFiles }, { allFolders });
                resolve({
                    fileCount,
                    files,
                });
            },
            (messages) => {
                const file = allFiles[fileId];
                const errors = [{
                    id: getUID(),
                    data: file.name,
                    type: Constants.ERROR_DELETING_FILE,
                    messages,
                }];
                reject({ errors });
            },
        );
    });
};

/**
 * @name       addFolderResolve
 * @type       {object}
 * @property   {number}    folder_count  The number of folders in the current
 *                                       folder, inclusive the new folder
 * @property   {Array}     folders       Array containing the {@link FolderDescr
 *                                       Folder} objects representing the
 *                                       folders in the current folder
 * @property   {string[]}  error         Array containing error messages, only
 *                                       when the server had yielded errors
 */

/**
 * Creates a new emtpy folder in the current folder
 *
 * @param      {string}   folder_name       The name of the new folder.
 * @param      {?number}  parentFolderId  The id of the parent folder (the
 *                                          current folder).
 * @return     {Promise}  promise {@link addFolderResolve resolve} {@link
 *                        APIError reject}
 */
const addFolder = (folderName, parentFolderId) => {
    const treeFolder = tree[parentFolderId];

    return new Promise((resolve, reject) => {
        api.addFolder(folderName, parentFolderId,
            (folders, errorMessages) => {
                folders.forEach((f) => {
                    allFolders[f.id] = f;
                    treeFolder.folderIds.push(f.id);
                    f.new = true;
                });

                const folderCount = treeFolder.folderIds.length;
                treeFolder.folderCount = folderCount;
                allFolders[parentFolderId].folder_count = folderCount;
                storeLocal({ tree }, { allFolders });

                let errors = [];
                if (errorMessages.length > 0) {
                    errors = [{
                        id: getUID(),
                        data: folderName,
                        type: Constants.ERROR_ADDING_FOLDER,
                        messages: errorMessages,
                    }];
                }

                resolve({
                    folderCount,
                    folders,
                    errors,
                    //errors: [{id: 7777, type: 'generic', messages: ['oh my, this is an error!']}]
                });
            },
            (messages) => {
                const errors = [{
                    id: getUID(),
                    data: folderName,
                    type: Constants.ERROR_ADDING_FOLDER,
                    messages,
                }];
                reject({ errors });
            },
        );
    });
};

/**
 * @name       deleteFolderResolve
 * @type       {Object}  deleteFolderResolve
 * @property   {number}  folder_count  The number of folders still left in the
 *                                     current folder
 * @property   {Array}   folders       Array containing the {@link FolderDescr
 *                                     Folder} objects in the current folder
 */

/**
 * Deletes an emptied folder
 *
 * @param      {number}   folderId         The id of the folder to be deleted
 * @param      {?number}  parentFolderId  The id of the parent folder
 * @return     {Promise}  {@link deleteFolderResolve resolve} {@link APIError
 *                        reject}
 */
const deleteFolder = (folderId, parentFolderId) => {
    const treeFolder = tree[parentFolderId];

    return new Promise((resolve, reject) => {
        api.deleteFolder(folderId,
            () => {
                const folders = [];
                const folderIds = [];
                treeFolder.folderIds.forEach((id) => {
                    if (id !== folderId) {
                        folders.push(allFolders[id]);
                        folderIds.push(id);
                    }
                });
                const folderCount = folderIds.length;
                treeFolder.folderIds = folderIds;
                allFolders[parentFolderId].folder_count = folderCount;

                delete allFolders[folderId];
                storeLocal({ tree }, { allFolders });

                resolve({
                    folderCount,
                    folders,
                });
            },
            (message) => {
                let folder = 'no name';
                if (folderId) {
                    folder = allFolders[folderId];
                    if (typeof folder !== 'undefined') {
                        folder = folder.name;
                    }
                }
                const errors = [{
                    id: getUID(),
                    type: Constants.ERROR_DELETING_FOLDER,
                    data: folder,
                    messages: [message],
                }];
                reject({ errors });
            },
        );
    });
};


const getItemCount = (folderId) => {
    const folder = tree[folderId];
    return folder.fileIds.length + folder.folderIds.length;
};


const getFileById = (id) => {
    for (let fileId of Object.keys(allFiles)) {
        fileId = parseInt(fileId, 10);
        if (fileId === id) {
            return allFiles[fileId];
        }
    }
    return null;
};


const getFilesByIds = (ids) => {
    const result = [];
    ids.forEach((id) => {
        const file = getFileById(id);
        if (file !== null) {
            result.push(file);
        }
    });
};


export default {
    init,
    loadFolder,
    addFiles,
    moveFiles,
    deleteFile,
    addFolder,
    deleteFolder,
    getItemCount,
    getFilesByIds,
    getFileById,
};
