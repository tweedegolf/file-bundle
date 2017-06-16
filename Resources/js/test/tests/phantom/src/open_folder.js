import R from 'ramda';
import config from './config';
import { waitFor } from './util';

// declare functions
let checkFolder; // check if the folder has been opened

const openFolderById = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `openFolderById: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM openFolderById]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((index) => {
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                if (folders) {
                    const folder = folders[index];
                    const name = folder.querySelector('td:nth-child(3) > span').innerHTML;
                    // const aap = R.isNil(name);
                    folder.click();
                    return {
                        name,
                    };
                }
                return null;
            }, conf.index);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (R.isNil(data.name)) {
                onError({ id, error: `could not find folder with index: ${conf.index}` });
            } else {
                checkFolder({ ...conf, ...data });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `openFolderById: ${msg}` });
        },
    });
};

const openFolderByName = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `openFolderByName: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM openFolderByName]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((name) => {
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                if (folders) {
                    let clicked = false;
                    const index = folders.findIndex((f) => {
                        const td = f.querySelector('td:nth-child(3) > span');
                        if (td) {
                            return td.innerHTML === name;
                        }
                        return false;
                    });
                    if (index !== -1) {
                        const folder = folders[index];
                        if (folder) {
                            folder.click();
                            clicked = true;
                        }
                    }
                    return {
                        index,
                        clicked,
                    };
                }
                return null;
            }, conf.name);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (data.index === -1 || data.clicked === false) {
                onError({ id, error: `could not find folder with index: ${conf.name}` });
            } else {
                checkFolder({ ...conf, ...data });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `openFolderByName: ${msg}` });
        },
    });
};

checkFolder = (conf) => {
    const {
        id,
        page,
        onError,
        onReady,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `checkFolder: ${err}`;
    };

    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM checkFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((name) => {
                const folderNames = Array.from(document.querySelectorAll('tr.folder > td:nth-child(3) > span'));
                if (folderNames) {
                    const index = folderNames.findIndex(n => n === name);
                    return {
                        opened: index === -1,
                        numFiles: document.querySelectorAll('tr.cutable').length,
                        numFolders: document.querySelectorAll('tr.folder').length,
                    };
                }
                return null;
            }, conf.name);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (data.opened === false) {
                const folder = R.isNil(conf.name) ? conf.index : conf.name;
                onError({ id, error: `could not open folder: ${folder}` });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/folder-${conf.name}-opened.png`);
                onReady({ id,
                    name: conf.name,
                    numFiles: data.numFiles,
                    numFolders: data.numFolders,
                });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `checkFolder: ${msg}` });
        },
    });
};

export { openFolderById, openFolderByName };
