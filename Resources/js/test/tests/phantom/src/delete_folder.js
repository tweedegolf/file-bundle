// import R from 'ramda';
import { waitFor } from './util';
import config from './config';

const filesInFolder = []; // not use yet
let confirmDeleteFolder;
let checkDeletedFolder;
let openRecycleBin;
let checkRecycleBin;

const deleteFolder = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `deleteFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM deleteFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((name) => {
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                if (folders) {
                    const index = folders.findIndex((f) => {
                        const td = f.querySelector('td:nth-child(3) > span');
                        if (td) {
                            return td.innerHTML === name;
                        }
                        return false;
                    });
                    const folder = folders[index];
                    const deleteBtn = folder.querySelector('td > div.actions > button > span.fa-trash-o');
                    let buttonClicked = false;
                    if (deleteBtn) {
                        deleteBtn.parentNode.click();
                        buttonClicked = true;
                    }
                    return {
                        buttonClicked,
                        index,
                    };
                }
                return null;
            }, conf.name);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (data.buttonClicked === false || data.index === -1) {
                onError({ id, error: `deleteFolder: ${data.buttonClicked} ${data.index}` });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}.png`);
                confirmDeleteFolder({ ...conf, index: data.index });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `deleteFolder: ${msg}` });
        },
    });
};

confirmDeleteFolder = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `confirmDeleteFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM confirmDeleteFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((index) => {
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                if (folders) {
                    const folder = folders[index];
                    const confirmBtn = folder.querySelector('td > div.actions > div.confirm > button.btn-danger');
                    let buttonClicked = false;
                    if (confirmBtn) {
                        confirmBtn.click();
                        buttonClicked = true;
                    }
                    return {
                        buttonClicked,
                    };
                }
                return null;
            }, conf.index);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (data.buttonClicked === false) {
                onError({ id, error: 'confirmDeleteFolder: could not find "confirm delete" button' });
            } else {
                // page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}-confirm.png`);
                checkDeletedFolder(conf);
            }
        },
        onTimeout(msg) {
            onError({ id, error: `confirmDeleteFolder: ${msg}` });
        },
    });
};

checkDeletedFolder = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `checkDeletedFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM checkDeletedFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((name) => {
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                if (folders) {
                    const index = folders.findIndex((f) => {
                        const td = f.querySelector('td:nth-child(3) > span');
                        if (td) {
                            return td.innerHTML === name;
                        }
                        return false;
                    });
                    return {
                        deletedFromList: index === -1,
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
            } else if (data.deletedFromList === false) {
                onError({ id, error: `checkDeletedFolder: folder "${conf.name}" is still listed` });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}-confirmed.png`);
                openRecycleBin({
                    ...conf,
                    numFiles: data.numFiles,
                    numFolders: data.numFolders,
                });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `checkDeletedFolder: ${msg}` });
        },
    });
};


openRecycleBin = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `openRecycleBin: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM openRecycleBin]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate(() => {
                const recycleBinButton = document.querySelector('div.toolbar > button > span.fa-trash-o');
                if (recycleBinButton) {
                    recycleBinButton.parentNode.click();
                    return true;
                }
                return null;
            });
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}-recycle-bin.png`);
                checkRecycleBin(conf);
            }
        },
        onTimeout(msg) {
            onError({ id, error: `openRecycleBin: ${msg}` });
        },
    });
};

checkRecycleBin = (conf) => {
    const {
        id,
        page,
        onError,
        onReady,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `checkRecyleBin: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM checkRecycleBin]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((name) => {
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                if (folders) {
                    const index = folders.findIndex((f) => {
                        const td = f.querySelector('td:nth-child(3)');
                        if (td) {
                            return td.innerHTML === name;
                        }
                        return false;
                    });

                    return {
                        folderInRecycleBin: index !== -1,
                    };
                }
                return null;
            }, conf.name);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (data.folderInRecycleBin === false) {
                onError({ id, error: `checkRecycleBin: folder "${conf.name}" not found in recycle bin!` });
            } else {
                onReady({
                    id,
                    deleted: true,
                    numFiles: conf.numFiles,
                    numFolders: conf.numFolders,
                });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `checkRecycleBin: ${msg}` });
        },
    });
};

export default deleteFolder;
