import R from 'ramda';
import { waitFor } from './util';
import config from './config';

// declare functions
let check; // check if the folder has been opened


/**
 * Opens a folder by clicking in the row that represents the folder in the
 * browser list. We test if the browser list is available by checking for a <tr>
 * with css class folder.
 *
 * @param      {Object}    conf     Configuration object
 * @property   {string}    id       The id of the task that executes this
 *                                  function
 * @property   {Object}    page     The phantomjs WebPage object
 * @property   {number}    index    The index in the list of the folder to be
 *                                  opened
 * @property   {string}    name     The name of the folder to be opened (not
 *                                  implemented yet)
 * @property   {functon}   onReady  The function called after the folder's
 *                                  contents has been loaded
 * @property   {function}  onError  The function called if the onTest() function
 *                                  returns false or reaches the timeout.
 * @return     {void}      no return value
 */
const openFolder = (conf) => {
    const {
        id,
        page,
        index = null,
        name = null,
        onError,
    } = conf;

    let data;
    waitFor({
        onTest() {
            data = page.evaluate((i, n) => {
                // get the table row representing the folder by index or by folder name
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                let folder;
                // const name = null;
                const rect = null;
                // if (folders) {
                //     // no index passed, so we search by folder name
                //     if (i === null) {
                //         i = R.findIndex(f =>
                //             f.querySelector('td:nth-child(3)').innerHTML === n, Array.from(folders));
                //     }
                //     folder = folders[i];
                //     console.log('->', folder);
                //     // name = folder.querySelector('td:nth-child(3) > span').innerHTML;
                //     console.log('->', name);
                //     // rect = folder.getBoundingClientRect();
                //     // folder.click();
                // }
                return {
                    folders,
                    browser: document.getElementById('tg_file_browser'),
                    name: 'beer',
                    rect,
                };
            }, index, name);
            console.log('browser', data.browser);
            return R.isNil(data) === false && data.name !== '';
        },
        onReady() {
            // page.sendEvent('click', data.rect.left + data.rect.width / 2, data.rect.top + data.rect.height / 2)
            check({ ...conf, ...data });
        },
        onError(error) {
            onError({ id, error });
        },
    });
};


/**
 * By clicking on the folder the application will request its contents from the
 * server. This may take a while. In the waitFor function we test whether the
 * contents of the newly opened folder has been loaded or not. We do this by
 * testing if the name of the opened folder is still listed in the browser list;
 * once it is not listed anymore we know that the folder's contents has been
 * loaded.
 *
 * @param      {Object}  conf    Configuration object, this is the same object
 *                               that is passed as argument to openFolder()
 * @return     {void}    no return value
 */
check = (conf) => {
    const {
    id,
    page,
    name,
    onReady,
    onError,
  } = conf;

    let data;
    waitFor({
        onTest() {
            data = page.evaluate((folderName) => {
                const folderNames = document.querySelectorAll('tr.folder > td:nth-child(3n)');
                console.log(folderNames);
                if (typeof folderNames === 'undefined') {
                    return { loaded: false };
                }
                let loaded = true;
                // let names = []
                Array.from(folderNames).forEach((n) => {
                    // names.push(n.innerHTML)
                    if (n.innerHTML === folderName) {
                        loaded = false;
                    }
                });
                return {
                    loaded,
                    // folderNames: names,
                    numFiles: document.querySelectorAll('tr.cutable').length,
                    numFolders: document.querySelectorAll('tr.folder').length,
                };
            }, name);
            return data.loaded;
        },
        onReady() {
            page.render(`${config.SCREENSHOTS_PATH}/folder-${name}-opened.png`);
            onReady({ id, name, ...data });
        },
        onError(error) {
            onError({ id, error });
        },
    });
};


export default openFolder;
