// @flow
/**
 * @file       server REST API; updates and queries database
 *
 *
 */

/**
 * @name       FolderDescr
 * @type       {Object}
 * @param      {number}  create_ts     Creation time stamp in Unix time
 * @param      {string}  created       Creation date in format: 'DD-MM-YYYY
 *                                     HH:mm'
 * @param      {number}  file_count    Number of files in this folder
 * @param      {number}  folder_count  Number of sub folders in this folder
 * @param      {number}  id            Unique id of this folder: there is and
 *                                     will be no other file or folder that uses
 *                                     this id
 * @param      {string}  name          Folder name
 * @param      {number}  parent        Parent folder id
 * @param      {string}  size          Size in human friendly format, e.g. 54.1
 *                                     kB
 * @param      {number}  size_bytes    Size in bytes
 * @param      {string}  thumb         Remains a mystery, probably superfluous
 * @param      {string}  type          Always "folder"
 */

/**
 * @name       FileDescr
 * @type       {Object}
 * @param      {number}  create_ts  Creation time stamp in Unix time
 * @param      {string}  created    Creation date in format: 'DD-MM-YYYY
 * @param      {number}  id         Unique id of this folder: there is and will
 *                                  be no other file or folder that uses this
 *                                  id
 * @param      {string}  name       Name of the file
 * @param      {string}  original   Url of the original file, i.e. not the url
 *                                  of the thumbnail in case the file is an
 *                                  image
 * @param      {string}  thumb      Url of the thumbnail, only set if the file
 *                                  is an image
 * @param      {string}  type       Type of the file, any of: pdf, doc, docx,
 *                                  ppt, pptx, xls, xlsx
 */

import request from 'superagent';
import config from '../config.json';

const api = config.api;

type ErrorType = {
    toString: () => string,
    message: string,
};

type DataType = {
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};

type Errors1Type = { [id: string]: string };
type Errors2Type = string[];
type ErrorsType = Errors1Type | Errors2Type;

type ResponseType = {
    text: string,
    error: ErrorType,
    body: {
        error: string,
        errors: ErrorsType,
        new_folders: FolderType[],
        folder: FolderType,
        uploads: FileType[],
        folders: FolderType[],
        files: FileType[],
        filesById: FilesByIdType[],
        foldersById: FoldersByIdType[],
        data: DataType,
    },
};

/**
 * In case we want to run the test suite using the dummy test server, we need to
 * change the server url. This is done by setting the node environment variable
 * PORT to any value other than 80 or 8080 (and above 1024). In the code below
 * we check whether this variable has been set and if so we adjust the server
 * url accordingly.
 *
 * @type       {string}
 */
let server = ''; // if no environment variable has been set, we don't need to specify a server url
const port = process.env.PORT;
// console.log(process.env.PORT)
if (typeof port !== 'undefined' && port !== null && port !== 80 && port !== 8080) {
    server = `http://localhost:${port}`;
}


/**
 * Deletes a file
 *
 * @param      {string}    file_id    The id of the file that will be deleted
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const deleteFile = (
    fileId: string,
    onSuccess: (error: string) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.deleteFile}${fileId}`;
    const req = request.post(url);
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.error);
        }
    });
};

/**
 * Moves a file or folder to another location
 *
 * @param      {string}    file_ids   The ids of the files that will be moved
 * @param      {number}    folder_id  The id of the folder where the files will
 *                                    be moved to
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const moveItems = (
    fileIds: string[],
    folderIds: string[],
    folderId: string,
    onSuccess: () => void,
    onError: (string[]) => void) => {
    // console.log('[API]', file_ids, folder_id);
    const url = `${server}${api.moveItems}${folderId}`;
    const req = request.post(url).type('form');
    req.send({ 'fileIds[]': fileIds, 'folderIds[]': folderIds });
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.errors);
        }
    });
};

/**
 * Adds a new folder to the current folder
 *
 * @param      {string}    name       The name of the new folder
 * @param      {number}    folder_id  The id of the current folder, i.e. the
 *                                    parent folder of the new folder
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const addFolder = (
    name: string,
    folderId: string,
    onSuccess: (FolderType[], string[]) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.addFolder}${folderId}`;
    const req = request.post(url).type('form');
    req.send({ name });
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            let errors2: Errors2Type = [];
            if (res.body.errors instanceof Array) {
                errors2 = res.body.errors;
            }
            onSuccess(res.body.new_folders, errors2);
        }
    });
};

const renameFolder = (
    folderId: string,
    newName: string,
    onSuccess: (boolean | string) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.renameFolder}${folderId}`;
    const req = request.post(url).type('form');
    req.send({ name: newName });
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.error);
        }
    });
};


/**
 * Delete a folder
 *
 * @param      {?number}   folderId   The id of the folder that will be deleted
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const deleteFolder = (
    folderId: string,
    onSuccess: (boolean | string) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.deleteFolder}${folderId}`;
    const req = request.post(url).type('form');
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            // console.log(err)
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.error);
        }
    });
};

const emptyRecycleBin = (
    onSuccess: (boolean | string) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.emptyRecycleBin}`;
    const req = request.get(url);
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            // console.log(err)
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.error);
        }
    });
};


const getMetaData = (
    fileIds: string[],
    folderIds: string[],
    // onSuccess: (filesById: FilesByIdType, foldersById: FoldersByIdType) => void,
    onSuccess: (files: FileType[], folders: FolderType[]) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.getMetaData}`;
    const req = request.post(url).type('form');
    req.send({ fileIds, folderIds });
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            // console.log(err)
            onError([res.text, res.error.message, err.toString()]);
        } else {
            // onSuccess(res.body.filesById, res.body.foldersById);
            onSuccess(res.body.files, res.body.folders);
        }
    });
};

// not in use!
const restoreFromRecycleBin = (
    fileIds: string[],
    folderIds: string[],
    onSuccess: () => void,
    onError: (string[]) => void) => {
    const url = `${server}/admin/file/recycle-bin/restore`;
    const req = request.post(url).type('form');
    req.send({ fileIds, folderIds });
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            // console.log(err)
            onError([res.text, res.error.message, err.toString()]);
        } else {
            // console.log(res.body.data);
            // onSuccess(res.body.data);
            onSuccess();
        }
    });
};

/**
 * Upload new files to folder
 *
 * @param      {Array}     file_list  The FileList converted to an Array,
 *                                    contains all files that will be uploaded
 * @param      {?number}   folder_id  The id of the current folder, i.e. the
 *                                    folder that will contain the newly
 *                                    uploaded files
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const upload = (
    fileList: File[],
    folderId: string,
    onSuccess: (FileType[], { [id: string]: string }) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.uploadFiles}${folderId ? `/${folderId}` : ''}`;
    const req = request.post(url);
    fileList.forEach((file: File) => {
        // console.log(file)
        req.attach(file.name, file);
    });
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            let errors1: Errors1Type = {};
            if (res.body.errors instanceof Object) {
                errors1 = res.body.errors;
            }
            onSuccess(res.body.uploads, errors1);
        }
    });
};


/**
 * Loads the contents of a folder
 *
 * @param      {?number}   folder_id  The id of the folder
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const openFolder = (
    folderId: string,
    rootFolderId: string,
    onSuccess: (boolean | string, FolderType[], FileType[]) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.openFolder}${folderId}`;
    // let url = '/admin/file/list/999'
    // const req = request.post(url).type('form');
    const req = request.get(url);
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            // console.log(err: ErrType, res: ResponseType)
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.error, res.body.folders, res.body.files);
        }
    });
};

export default {
    deleteFile,
    moveItems,
    addFolder,
    renameFolder,
    deleteFolder,
    upload,
    openFolder,
    emptyRecycleBin,
    restoreFromRecycleBin,
    getMetaData,
};
