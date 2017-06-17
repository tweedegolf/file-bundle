// import R from 'ramda';
import { waitFor } from './util';
import config from './config';

// declare functions
let checkUpload; // checks if the file(s) have successfully been uploaded

/**
 * Uploads one or multiple files to the server
 *
 * @param      {Object}    conf     The configuration object
 * @property   {string}    id       The id of the task that executes this
 *                                  function
 * @property   {Object}    page     The phantomjs WebPage object
 * @property   {Array}     files    Array containing the local path(s) to the
 *                                  file(s) to be uploaded.
 * @property   {function}  onReady  The function called after the file(s) have
 *                                  been uploaded
 * @property   {function}  onError  The function called if the onTest() function
 *                                  returns false or reaches the timeout.
 * @return     {Void}      No return value
 */
const uploadFiles = (conf) => {
    const {
        id,
        page,
        files,
        onError,
    } = conf;

    const multiple = files.length > 1;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `uploadFiles: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM uploadFiles]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate(() => {
                const input = document.querySelectorAll('input[type=file]');
                if (input) {
                    return true;
                }
                return null;
            });
            return data !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else {
                if (multiple === true) {
                    page.uploadFile('input[type=file]', files);
                } else {
                    page.uploadFile('input[type=file]', files[0]);
                }
                checkUpload(conf);
            }
        },
        onTimeout(msg) {
            onError({ id, error: msg });
        },
    });
};

/**
 * Newly uploaded file(s) appear(s) at the top of the browser list so by testing if
 * the name of the first file in the list is equal to one of the files we have
 * just uploaded we know that the upload has successfully finished.
 *
 * @param      {Object}  conf    The configuration object; this is the same
 *                               object as the one that is passed to the
 *                               uploadFiles function
 * @return     {Void}  function has no return value
 */
checkUpload = (conf) => {
    const {
        id,
        page,
        files,
        onError,
        onReady,
    } = conf;

    const multiple = files.length > 1;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `checkUpload: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM checkUpload]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate(() => {
                // freshly uploaded files appear at the top of the list
                const file = document.querySelectorAll('tr.cutable')[0];
                let name = null;
                if (file) {
                    name = file.querySelector('td:nth-child(3)').innerHTML;
                    return {
                        name,
                        numFiles: document.querySelectorAll('tr.cutable').length,
                    };
                }
                return null;
            });
            if (data === null) {
                return false;
            }
            if (data.name === null) {
                return false;
            }
            if (multiple === true) {
                // console.log(file, data.name, file.indexOf(data.name))
                return files.some(file => file.indexOf(data.name) !== -1);
            }
            // console.log(files[0], files[0].indexOf(data.name))
            return files[0].indexOf(data.name) !== -1;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else {
                if (multiple === true) {
                    page.render(`${config.SCREENSHOTS_PATH}/multiple-files-uploaded.png`);
                } else {
                    page.render(`${config.SCREENSHOTS_PATH}/single-file-uploaded.png`);
                }
                onReady({ id, uploaded: true, multiple, ...data });
            }
        },
        onTimeout(msg) {
            onError({ id, error: msg });
        },
    });
};

export default uploadFiles;
