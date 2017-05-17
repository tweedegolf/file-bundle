/**
 * Ties together all API calls and exports them as an object. For documentation
 * of every individual method see ./api/index.js
 */
import database from '../database';
import { getIdFromUrl } from '../util';
import { uploadFiles } from './upload_files';

const openFolder = (req, res) => {
    const parentId = getIdFromUrl(req.url);
    console.log(`[API] getting contents of folder ${parentId}`);

    const data = database.openFolder(parentId);
    if (typeof data.error !== 'undefined') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};

const addFolder = (req, res) => {
    const parentId = getIdFromUrl(req.url);
    console.log(`[API] adding new folder "${req.body.name}" in folder ${parentId}`);

    const data = database.addFolder(req.body.name, parentId);
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
    if (data.error !== false) {
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
    if (data.error !== false) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(data.error);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const moveFiles = (req, res) => {
    const parentId = getIdFromUrl(req.url);
    console.log(`[API] moving files to folder ${parentId}`);

    const data = database.moveFiles(req.body['files[]'], parentId);
    if (data.error !== false) {
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
    if (data.error !== false) {
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
    moveFiles,
    deleteFile,
    closeServer,
    emptyRecycleBin,
    getData,
};
