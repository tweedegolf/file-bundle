/**
 * Ties together all API calls and exports them as an object. For documentation
 * of every individual method see ./api/index.js
 */
import R from 'ramda';
import database from '../database';
import { getIdFromUrl, getIdAndRootFromUrl } from '../util';
import { uploadFiles } from './upload_files';

const openFolder = (req, res) => {
    const { folderId, rootFolderId } = getIdAndRootFromUrl(req.url);
    if (rootFolderId !== 'null') {
        console.log(`[API] checking chroot; root folder: "${rootFolderId}"`);
        if (folderId === '101') {
            res.setHeader('Content-Type', 'application/json');
            res.send({ error: `Fake error; not allowed to get contents of folder with id "${folderId}"` });
            return;
        }
    }
    console.log(`[API] getting contents of folder "${folderId}"`);

    if (folderId === '103') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('Fake error; could not open folder 103');
    } else if (folderId === '104') {
        res.setHeader('Content-Type', 'application/json');
        res.send({ error: 'Fake error; could not open folder 104' });
    } else {
        const data = database.openFolder(folderId);
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const addFolder = (req, res) => {
    const folderId = getIdFromUrl(req.url);
    const folderName = req.body.name;
    console.log(`[API] adding new folder "${folderName}" in folder "${folderId}"`);

    if (folderName === 'servererror') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(`Fake error: could not create folder "${folderName}"`);
    } else if (folderName === 'errorfolder') {
        res.setHeader('Content-Type', 'application/json');
        res.send({
            new_folders: [],
            errors: [`Fake error: could not create folder "${folderName}"`, 'And another fake error'],
        });
    } else {
        const data = database.addFolder(req.body.name, folderId);
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const renameFolder = (req, res) => {
    const folderId = getIdFromUrl(req.url);
    const newName = req.body.name;
    console.log(`[API] renaming folder ${folderId} to "${newName}"`);

    if (newName === 'servererror') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send(`Fake error: could not rename folder to "${newName}"`);
    } else if (newName === 'errorfolder') {
        res.setHeader('Content-Type', 'application/json');
        res.send({ error: `Fake error: could not rename folder to "${newName}"` });
    } else {
        const data = database.renameFolder(folderId, newName);
        setTimeout(() => {
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        }, 0);
    }
};


const deleteFolder = (req, res) => {
    const folderId = getIdFromUrl(req.url);
    console.log(`[API] deleting folder ${folderId}`);

    if (folderId === '102') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('Fake error: could not delete folder "102"');
    } else if (folderId === '103') {
        res.setHeader('Content-Type', 'application/json');
        res.send({ error: 'Fake error: could not delete folder "103"' });
    } else {
        const data = database.deleteFolder(folderId);
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const deleteFile = (req, res) => {
    const fileId = getIdFromUrl(req.url);
    console.log(`[API] deleting file ${fileId}`);

    if (fileId === '102') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('Fake error: could not delete file "102"');
    } else if (fileId === '103') {
        res.setHeader('Content-Type', 'application/json');
        res.send({ error: 'Fake error: could not delete file "103"' });
    } else {
        const data = database.deleteFile(fileId);
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
    if (fileIds.indexOf('101') !== -1) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('Fake error: could not move file with id "101"');
    } else if (fileIds.indexOf('102') !== -1 && folderIds.indexOf('101') !== -1) {
        res.setHeader('Content-Type', 'application/json');
        res.send({ errors: {
            fileIds: ['102'],
            folderIds: ['101'],
        } });
    } else {
        const data = database.moveItems(fileIds, folderIds, parentId);
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
};


const emptyRecycleBin = (req, res) => {
    console.log('[API] empty recycle bin');

    const fakeError = false;
    if (fakeError) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('Fake error: can\'t empty recycle bin');
    } else {
        const data = database.emptyRecycleBin();
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

    const fakeError = false;
    if (fakeError) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('Fake error: can\'t get metadata');
    } else {
        const data = database.getMetaData(fileIds, folderIds);
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

    const fakeError = false;
    if (fakeError) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('Fake error: could not restore items from recycle bin');
    } else {
        const data = database.restoreFromRecycleBin(fileIds, folderIds);
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
