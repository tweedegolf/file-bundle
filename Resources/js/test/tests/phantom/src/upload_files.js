import { waitFor } from './util';
import config from './config';

// declare functions
let check; // checks if the file(s) have successfully been uploaded


/**
 * Uploads one or multiple files to the server
 *
 * @param      {Object}    conf     The configuration object
 * @property   {string}    id       The id of the task that executes this
 *                                  function
 * @property   {Object}    page     The phantomjs WebPage object
 * @property   {Array}     files    Array containing the local path(s) to the
 *                                  file(s) to be uploaded.
 * @property   {functon}   onReady  The function called after the file(s) have
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
    /**
     * We can't start uploading file until the page has fully loaded. Therefor we
     * test if we can find an input[type=file] in the page.
    */

    waitFor({
        onTest() {
            const loaded = page.evaluate(() =>
                document.querySelectorAll('input[type=file]'));

            if (typeof loaded === 'undefined' || loaded.length === 0) {
                // console.log(false, loaded);
                return false;
            }
            // console.log(true, loaded[0].type);
            return true;
        },
        onReady() {
            if (multiple === true) {
                page.uploadFile('input[type=file]', files);
            } else {
                page.uploadFile('input[type=file]', files[0]);
            }
            check(conf);
        },
        onError(error) {
            onError({ id, error });
        },
    });
};


/**
 * Newly uploaded file appear at the top of the browser list so by testing if
 * the name of the first file in the list is equal to one of the files we have
 * just uploaded we know that the upload has successfully finished.
 *
 * @param      {Object}  conf    The configuration object; this is the same
 *                               object as the one that is passed to the
 *                               uploadFiles function
 * @return     {Void}  function has no return value
 */
check = (conf) => {
    const {
        id,
        page,
        files,
        onReady,
        onError,
    } = conf;

    const multiple = files.length > 1;

    let data = '';
    waitFor({
        onTest() {
            data = page.evaluate(() => {
                // freshly uploaded files appear at the top of the list
                const f = document.querySelectorAll('tr.cutable')[0];
                let name = null;
                if (f) {
                    name = f.querySelector('td:nth-child(3)').innerHTML;
                }
                return {
                    name,
                    numFiles: document.querySelectorAll('tr.cutable').length,
                };
            });
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
            if (multiple === true) {
                page.render(`${config.SCREENSHOTS_PATH}/multiple-files-uploaded.png`);
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/single-file-uploaded.png`);
            }
            onReady({ id, uploaded: true, multiple, ...data });
        },
        onError(error) {
            onError({ id, error });
        },
    });
};

export default uploadFiles;
