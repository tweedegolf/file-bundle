import R from 'ramda';
import { waitFor } from './util';
import config from './config';

const filesInFolder = [];
let confirmDeleteFolder;
let checkDeletedFolder;
let openRecyleBin;
let checkRecyleBin;

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
                // get the table row representing the folder by index or by folder name
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
            data = conf.page.evaluate((index) => {
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
                        ready: true,
                        buttonClicked,
                    };
                }

                return {
                    ready: false,
                };
            }, conf.index);
            return data.ready === true;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (
                R.isNil(data.buttonClicked) ||
                data.buttonClicked === false) {
                conf.onError({ id: conf.id, error: `confirmDeleteFolder: ${data.buttonClicked}` });
            } else {
                // conf.page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}-confirm.png`);
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
            data = conf.page.evaluate((name) => {
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
                        ready: true,
                        deletedFromList: index === -1,
                    };
                }

                return {
                    ready: false,
                };
            }, conf.name);
            return data.ready === true;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (
                R.isNil(data.deletedFromList) ||
                data.deletedFromList === false) {
                conf.onError({ id: conf.id, error: `checkList: ${data.deletedFromList}` });
            } else {
                conf.page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}-confirmed.png`);
                openRecyleBin(conf);
            }
        },
        onTimeout(msg) {
            onError({ id, error: `checkDeletedFolder: ${msg}` });
        },
    });
};


openRecyleBin = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `openRecyleBin: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM openRecyleBin]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = conf.page.evaluate(() => {
                const recycleBinButton = document.querySelector('div.toolbar > button > span.fa-trash-o');
                if (recycleBinButton) {
                    recycleBinButton.parentNode.click();
                    return {
                        ready: true,
                    };
                }
                return {
                    ready: false,
                };
            });
            return data.ready === true;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else {
                conf.page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}-recycle-bin.png`);
                checkRecyleBin(conf);
            }
        },
        onTimeout(msg) {
            onError({ id, error: `openRecyleBin: ${msg}` });
        },
    });
};

checkRecyleBin = (conf) => {
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
        console.log(`[PHANTOM checkRecyleBin]: ${msg}`);
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
                        ready: true,
                        folderInRecycleBin: index !== -1,
                    };
                }
                return {
                    ready: false,
                };
            }, conf.name);
            return data.ready;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (
                R.isNil(data.folderInRecycleBin) ||
                data.folderInRecycleBin === false) {
                onError({ id, error: `checkRecycleBin: folder "${conf.name}" not found in recycle bin! ${data.folderInRecycleBin}` });
            } else {
                onReady({ id, deletedFolder: conf.name });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `checkRecyleBin: ${msg}` });
        },
    });
};

export default deleteFolder;
