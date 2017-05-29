/**
 * Function that handles the uploading of files. The files are stored in the
 * ./media folder and if the file is a picture, a thumbnail will be created and
 * stored in the ./media/thumb folder.
 *
 * Note: unlike the real server, currently there are no restraints implemented
 * concerning file type of file size.
 */
import fs from 'fs';
import path from 'path';
import gm from 'gm';
import database from '../database';
import { cleanup, getIdFromUrl, createFileDescription, isImage, mapMimeType } from '../util';

// compile the path to the directory where files will be saved
const mediaDir = process.argv[1].replace('src/index.js', 'media');
console.log('media dir:', mediaDir);
// this array stores all the files that are uploaded during a session; by
// keeping track of the uploads we can easily remove them from disk after the
// node process stops, see cleanup function at the very bottom of this file.
const sessionUploads = [];

// uncomment this if you want to use imageMagick instead of graphicsMagick
const im = gm.subClass({ imageMagick: true });

/**
 * Returns a promise that creates a thumbnail from an uploaded picture
 *
 * @param      {string}   uniqueName  The unique name of the file
 * @return     {Promise}  Resolves with no value if the thumb was created
 *                        successfully, else it resolves with the error message.
 *                        Note: reject is never called because the promise will
 *                        be stored in an array and called by Promise.all()
 */
function createThumbPromise(uniqueName) {
  // create a path for thumbs, after all uploaded files have been saved we
  // create thumbnails for images
    const file = path.join(mediaDir, uniqueName);
    const thumb = path.join(mediaDir, 'thumb', uniqueName);

    return new Promise((resolve) => {
        im(file)
        .resize(24)
        .write(thumb, (err) => {
            if (typeof err === 'undefined') {
                // add the path to the session uploads so we can clean them up when
                // the server stops or crashes
                resolve();
                sessionUploads.push(thumb);
            } else {
                // Resolve with error messages instead of reject. We add these error
                // messages to the errors array and this array will be sent back to the
                // client to we can display errors if necessary -> No: errors are
                // disabled; in case of an error, the original file will double as a
                // thumbnail

                console.error(err);
                // let origName = path.basename(uniqueName).substring()
                // origName = origName.substring(origName.indexOf('_') + 1)
                // resolve([origName, 'A non critical error while creating thumbnail occurred, please install GraphicsMagick or ImageMagick'])

                resolve();
                fs.createReadStream(file).pipe(fs.createWriteStream(thumb));
                sessionUploads.push(thumb);
            }
        });
    });
}


/**
 * Handles the file upload.
 *
 * @param      {ServerRequest}   req     The request of the http call
 * @param      {ServerResponse}  res     The response of the http call
 */
export function uploadFiles(req, res) {
    const errors = {};
    const uploads = [];
    const paths = [];
    const folderId = getIdFromUrl(req.url);

    console.log(`[API] uploading files to folder ${folderId}`);

    if (req.busboy) {
        req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            // create a unique name, this allows users to upload the same file, or files with the same name more than once
            const uniqueName = `${new Date().getTime().toString(16)}_${filename}`;
            // create the path to the save location
            const saveTo = path.join(mediaDir, uniqueName);
            const writer = fs.createWriteStream(saveTo);

            // get the file's size in bytes
            let sizeBytes = 0;
            file.on('data', (data) => {
                sizeBytes += data.length;
            });

            file.on('end', () => {
                // add the path to the session uploads so we can clean them up when the
                // server stops or crashes
                sessionUploads.push(saveTo);
                // add the unique filename to the paths array; this will be used to create
                // thumbnails of images after all files have been uploaded
                if (isImage(mimetype)) {
                    paths.push(uniqueName);
                }
                // console.log(filename, mimetype);

                // create a file description object and add it to the uploads array;
                // this array will be sent back to the client
                const fileDescr = createFileDescription({
                    name: filename,
                    size_bytes: sizeBytes,
                    uniqueName,
                    mimetype: mapMimeType(mimetype),
                });
                uploads.push(fileDescr);
            });

            file.pipe(writer);
        });

        req.busboy.on('finish', () => {
            const promises = paths.map(filePath => createThumbPromise(filePath));
            Promise.all(promises).then((values) => {
                // values are error messages that were yielded while creating thumbnails
                values.forEach((value) => {
                    if (typeof value !== 'undefined') {
                        errors[value[0]] = [value[1]];
                    }
                    // errors.test = ['Oops, something went wrong'];
                });
                // store the file description object in the database
                database.addFiles(uploads, folderId);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ uploads, errors }));
            });
        });
        req.pipe(req.busboy);
    }
}


// Removes all files that have been uploaded during this session to make sure
// that the next time the test suite is run it will run with the same original
// state. The cleanup function simply unlinks all uploaded files and thumbs
// created during this session.
cleanup(() => {
    sessionUploads.forEach((file) => {
        fs.unlink(file);
    });
});
