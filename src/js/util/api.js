// @flow
/**
 * @file       server REST API; updates and queries database
 */

import R from 'ramda';
import request from 'superagent';
import config from '../config.json';

const api = config.api;

type DataType = {
    filesById: FilesByIdType,
    foldersById: FoldersByIdType,
};

type RequestErrorType = {
    toString: (mixed) => string,
};

type Errors1Type = { [id: string]: string };
type Errors2Type = string[];
type Errors3Type = { fileIds: string[], folderIds: string[] };
type ErrorsType =
    | Errors1Type
    | Errors2Type
    | Errors3Type
    ;

type ResponseType = {
    text: string,
    error: {
        message: string,
    },
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
if (typeof port !== 'undefined' && port !== null && port !== '80') {
    server = `http://localhost:${port}`;
}
/**
 * Deletes a file
 *
 * @param      {string}    fileId    The id of the file that will be deleted
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const deleteFile = (
    fileId: string,
    onSuccess: (error: string) => void,
    onError: (string[]) => void,
) => {
    const url = `${server}${api.deleteFile}/${fileId}`;
    const req = request.post(url);
    req.end((err: RequestErrorType, res: ResponseType) => {
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
 * @param      {string}    fileIds   The ids of the files that will be moved
 * @param      {number}    folderId  The id of the folder where the files will
 *                                    be moved to
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const moveItems = (
    fileIds: string[],
    folderIds: string[],
    folderId: string,
    onSuccess: (string[], string[]) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.moveItems}${folderId}`;
    const req = request.post(url).type('form');
    req.send({ 'fileIds[]': fileIds, 'folderIds[]': folderIds });
    req.end((err: RequestErrorType, res: ResponseType) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            const fileIds2 = [];
            const folderIds2 = [];
            if (res.body.errors.fileIds instanceof Array) {
                fileIds2.push(...res.body.errors.fileIds);
            }
            if (res.body.errors.folderIds instanceof Array) {
                folderIds2.push(...res.body.errors.folderIds);
            }
            onSuccess(fileIds2, folderIds2);
        }
    });
};

/**
 * Adds a new folder to the current folder
 *
 * @param      {string}    name       The name of the new folder
 * @param      {number}    folderId   The id of the current folder, i.e. the
 *                                    parent folder of the new folder
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const addFolder = (
    name: string,
    folderId: null | string,
    onSuccess: (FolderType | null, string[]) => void,
    onError: (string[]) => void) => {
    let url;
    if (folderId === null) {
        url = `${server}${api.addFolder}`;
    } else {
        url = `${server}${api.addFolder}/${folderId}`;
    }
    const req = request.post(url).type('form');
    req.send({ name });
    req.end((err: RequestErrorType, res: ResponseType) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            // let errors2: Errors2Type = [];
            // if (res.body.errors instanceof Array) {
            //     errors2 = res.body.errors;
            // }
            // onSuccess(res.body.new_folders, errors2);
            onSuccess(res.body.new_folder, res.body.errors);
        }
    });
};

const renameFolder = (
    folderId: string,
    newName: string,
    onSuccess: (string[]) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.renameFolder}/${folderId}`;
    const req = request.post(url).type('form');
    req.send({ name: newName });
    req.end((err: RequestErrorType, res: ResponseType) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            const e: string[] = res.body.errors;
            onSuccess(e);
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
    folderId: null | string,
    onSuccess: (string[]) => void,
    onError: (string[]) => void) => {
    let url;
    if (folderId === null) {
        url = `${server}${api.deleteFolder}`;
    } else {
        url = `${server}${api.deleteFolder}/${folderId}`;
    }
    const req = request.post(url).type('form');
    req.end((err: RequestErrorType, res: ResponseType) => {
        if (err) {
            // console.log(err)
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.errors);
        }
    });
};

const emptyRecycleBin = (
    onSuccess: (boolean | string) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.emptyRecycleBin}`;
    const req = request.delete(url);
    req.end((err: RequestErrorType, res: ResponseType) => {
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
    folderIds: (null | string)[],
    // onSuccess: (filesById: FilesByIdType, foldersById: FoldersByIdType) => void,
    onSuccess: (files: FileType[], folders: FolderType[]) => void,
    onError: (string[]) => void) => {
    const url = `${server}${api.getMetaData}`;
    const req = request.post(url).type('form');
    req.send({ fileIds, folderIds });
    req.end((err: RequestErrorType, res: ResponseType) => {
        if (err) {
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
    req.end((err: RequestErrorType, res: ResponseType) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess();
        }
    });
};

/**
 * Upload new files to folder
 *
 * fileList: contains all files that will be uploaded
 * folderId:  The id of the current folder, i.e. the folder that will contain the newly uploaded files
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
 * folderId: the id of the folder to load
 * rootFolderId: the chroot folder id of the current user; if a non-null value is provided
 * the server will check if the requested folder is inside the chroot folder
 */
const openFolder = (
    folderId: null | string,
    onSuccess: (FolderType[], FileType[]) => void,
    onError: (string[]) => void) => {
    let url;
    if (folderId !== null) {
        url = `${server}${api.openFolder}/${folderId}`;
    } else {
        url = `${server}${api.openFolder}`;
    }

    const req = request.get(url);
    req.end((err: ErrorType, res: ResponseType) => {
        if (err) {
            // console.log(err: ErrType, res: ResponseType)
            if (res) {
                onError([res.text, res.error.message, err.toString()]);
            } else {
                onError([err.toString()]);
            }
        } else {
            onSuccess(res.body.folders, res.body.files);
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
