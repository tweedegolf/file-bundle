import R from 'ramda';
import { waitFor } from './util';
import config from './config';

// declare functions
let checkParentFolder;

const openParentFolder = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `openParentFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM openParentFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = conf.page.evaluate(() => {
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                if (folders) {
                    const folder = folders[0];
                    const chevronUp = folder.querySelector('td:nth-child(2) > span.fa-chevron-up');
                    let buttonClicked = false;
                    let parentFolderName = null;
                    if (chevronUp) {
                        buttonClicked = true;
                        parentFolderName = folder.querySelector('td:nth-child(3)').innerHTML;
                        chevronUp.click();
                    }
                    return {
                        ready: true,
                        buttonClicked,
                        parentFolderName,
                    };
                }
                return null;
            });
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                conf.onError({ id, error });
            } else if (data.buttonClicked === false || data.parentFolderName === null) {
                conf.page.render(`${config.SCREENSHOTS_PATH}/parent-folder-not-found.png`);
                conf.onError({ id, error: 'no parent folder found' });
            } else {
                checkParentFolder({ ...conf, ...data });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `openParentFolder: ${msg}` });
        },
    });
};

checkParentFolder = (conf) => {
    const {
        id,
        page,
        onReady,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `openParentFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM openParentFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((parentFolderName) => {
                const folderNames = Array.from(document.querySelectorAll('tr.folder > td:nth-child(3) > span'));
                const index = folderNames.findIndex(name => name === parentFolderName);
                if (folderNames) {
                    return {
                        ready: true,
                        opened: index === -1,
                        numFiles: document.querySelectorAll('tr.cutable').length,
                        numFolders: document.querySelectorAll('tr.folder').length,
                    };
                }
                return null;
            }, conf.parentFolderName);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (R.isNil(data.opened) || data.opened === false) {
                onError({ id, error: `parent folder of ${conf.currentFolder} not opened` });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/parent-folder-of-${conf.currentFolder}-opened.png`);
                onReady({
                    id,
                    name: conf.parentFolderName,
                    numFiles: data.numFiles,
                    numFolders: data.numFolders,
                });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `checkParentFolder: ${msg}` });
        },
    });
};

export default openParentFolder;
