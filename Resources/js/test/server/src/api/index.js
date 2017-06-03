/**
 * Ties together all API calls and exports them as an object. For documentation
 * of every individual method see ./api/index.js
 */
import R from 'ramda';
import database from '../database';
import { getIdFromUrl } from '../util';
import { uploadFiles } from './upload_files';

const openFolder = (req, res) => {
    const folderId = getIdFromUrl(req.url);
    console.log(`[API] getting contents of folder ${folderId}`);

    const data = database.openFolder(folderId);
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};

const addFolder = (req, res) => {
    const folderId = getIdFromUrl(req.url);
    console.log(`[API] adding new folder "${req.body.name}" in folder ${folderId}`);

    const data = database.addFolder(req.body.name, folderId);
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const renameFolder = (req, res) => {
    const folderId = getIdFromUrl(req.url);
    console.log(`[API] renaming folder ${folderId} to "${req.body.name}"`);

    const data = database.renameFolder(folderId, req.body.name);
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const deleteFolder = (req, res) => {
    const folderId = getIdFromUrl(req.url);
    console.log(`[API] deleting folder ${folderId}`);

    const data = database.deleteFolder(folderId);
    // data.error = 'Oops, something went wrong!';
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const deleteFile = (req, res) => {
    const fileId = getIdFromUrl(req.url);
    console.log(`[API] deleting file ${fileId}`);

    const data = database.deleteFile(fileId);
    // data.error = 'Oops, something went wrong!';
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const moveItems = (req, res) => {
    const parentId = getIdFromUrl(req.url);
    console.log(`[API] moving files to folder ${parentId}`);
    let fileIds = req.body['fileIds[]'] || [];
    let folderIds = req.body['folderIds[]'] || [];
    if ((R.length(fileIds) === 1 ||
        fileIds instanceof Array === false) &&
        R.isNil(fileIds) === false
    ) {
        fileIds = [fileIds];
    }
    if ((R.length(folderIds) === 1 ||
        folderIds instanceof Array === false) &&
        R.isNil(folderIds) === false
    ) {
        folderIds = [folderIds];
    }
    // console.log(fileIds, folderIds);
    const data = database.moveItems(fileIds, folderIds, parentId);
    // data.error = 'Oops, something went wrong';
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const emptyRecycleBin = (req, res) => {
    console.log('[API] empty recycle bin');

    const data = database.emptyRecycleBin();
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const getMetaData = (req, res) => {
    console.log('[API] get metadata for files and folders');
    let fileIds = req.body['fileIds[]'] || req.body.fileIds || [];
    let folderIds = req.body['folderIds[]'] || req.body.folderIds || [];
    if ((R.length(fileIds) === 1 || fileIds instanceof Array === false) && R.isNil(fileIds) === false) {
        fileIds = [fileIds];
    }
    if ((R.length(folderIds) === 1 || folderIds instanceof Array === false) && R.isNil(folderIds) === false) {
        folderIds = [folderIds];
    }

    const data = database.getMetaData(fileIds, folderIds);
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const restoreFromRecycleBin = (req, res) => {
    console.log('[API] restore from recycle bin');
    let fileIds = req.body['fileIds[]'] || req.body.fileIds || [];
    let folderIds = req.body['folderIds[]'] || req.body.folderIds || [];
    if ((R.length(fileIds) === 1 || fileIds instanceof Array === false) && R.isNil(fileIds) === false) {
        fileIds = [fileIds];
    }
    if ((R.length(folderIds) === 1 || folderIds instanceof Array === false) && R.isNil(folderIds) === false) {
        folderIds = [folderIds];
    }

    const data = database.restoreFromRecycleBin(fileIds, folderIds);
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const getData = (req, res) => {
    console.log('[API] get data');

    res.setHeader('Content-Type', 'application/json');
    res.send(database.getData());
};


const closeServer = (req, res) => {
    console.log('[API] closing server');
    res.setHeader('Content-Type', 'text/plain');
    res.send('server closed');
    process.exit();
};


export default{
    openFolder,
    addFolder,
    renameFolder,
    deleteFolder,
    uploadFiles,
    moveItems,
    deleteFile,
    closeServer,
    emptyRecycleBin,
    restoreFromRecycleBin,
    getMetaData,
    getData,
};
