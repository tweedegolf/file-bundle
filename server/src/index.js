// @no-flow

/**
 * Entry point of server application; sets up express server and links urls to
 * API calls. Cleanup after the node process shuts down or crashes is handled in
 * the cleanup function defined in ../util.js and called from ./upload_files.js
 */

import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import busboy from 'connect-busboy';
import request from 'request';
import proxy from 'http-proxy-middleware';
import api from './api';

if (fs.existsSync(path.join(__dirname, '../', 'media')) === false) {
    fs.mkdirSync(path.join(__dirname, '../', 'media'));
    if (fs.existsSync(path.join(__dirname, '../', 'media', 'thumb')) === false) {
        fs.mkdirSync(path.join(__dirname, '../', 'media', 'thumb'));
    }
}

const app = express();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    return next();
});

app.use('/', express.static('public'));

console.log('API', process.env.API);
console.log('PORT', process.env.PORT);

if (process.env.API === '1') {
    // app.get('/admin/*', (req, res) => {
    //     const url = `http://localhost:8080${req.originalUrl}`;
    //     request(url, (error, response, body) => {
    //         if (!error && response.statusCode === 200) {
    //             res.setHeader('content-type', 'application/json');
    //             res.send(body);
    //         }
    //     });
    // });

    // app.get('/media/*', (req, res) => {
    //     const url = `http://localhost:8080${req.originalUrl}`;
    //     request(url, (error, response, body) => {
    //         if (!error && response.statusCode === 200) {
    //             // res.setHeader(response.getHeaders());
    //             // console.log(response.getHeaders());
    //             res.send(body);
    //         }
    //     });
    // });

    const apiProxy = proxy('/admin', { target: 'http://localhost:8080' });
    app.use('/admin', apiProxy);

    const mediaProxy = proxy('/media', { target: 'http://localhost:8080' });
    app.use('/media', mediaProxy);
} else {
    app.use('/locales/', express.static('src/js/locales'));
    app.use('/media', express.static('server/media'));

    // bodyparser middleware so the client can post JSON
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false,
    }));

    // add busboy middleware for multipart support
    app.use(busboy());

    // app.post('/admin/file/list*', api.getFolder);
    app.get('/admin/file/list*', api.openFolder);
    app.post('/admin/file/upload*', api.uploadFiles);
    app.post('/admin/file/move*', api.moveItems);
    app.post('/admin/file/create/folder*', api.addFolder);
    app.post('/admin/file/delete/folder/*', api.deleteFolder);
    app.post('/admin/file/rename/folder/*', api.renameFolder);
    app.post('/admin/file/delete/*', api.deleteFile);
    app.delete('/admin/file/recycle-bin/empty', api.emptyRecycleBin);
    app.post('/admin/file/recycle-bin/restore', api.restoreFromRecycleBin);
    app.post('/admin/file/metadata', api.getMetaData);
    app.get('/data', api.getData);
    app.get('/close', api.closeServer);
}


const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`server listening at port ${port}`);
});
