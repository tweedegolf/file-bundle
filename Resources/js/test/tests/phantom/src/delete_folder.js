import R from 'ramda';
import { waitFor } from './util';
import config from './config';

const filesInFolder = [];
let confirmDelete;
let checkList;
let openRecyleBin;
let checkRecyleBin;

const deleteFolder = (conf) => {
    let data;
    waitFor({
        onTest() {
            data = conf.page.evaluate((name) => {
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
                        ready: true,
                        buttonClicked,
                        index,
                    };
                }
                return {
                    ready: false,
                };
            }, conf.name);
            return data.ready === true;
        },
        onReady() {
            if (
                R.isNil(data.buttonClicked) ||
                R.isNil(data.index) ||
                data.buttonClicked === false ||
                data.index === -1) {
                conf.onError({ id: conf.id, error: `deleteFolder: ${data.buttonClicked} ${data.index}` });
            } else {
                conf.page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}.png`);
                confirmDelete({ ...conf, index: data.index });
            }
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};

confirmDelete = (conf) => {
    let data;
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
            if (
                R.isNil(data.buttonClicked) ||
                data.buttonClicked === false) {
                conf.onError({ id: conf.id, error: `confirmDelete: ${data.buttonClicked}` });
            } else {
                // conf.page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}-confirm.png`);
                checkList(conf);
            }
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};

checkList = (conf) => {
    let data;
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
            if (
                R.isNil(data.deletedFromList) ||
                data.deletedFromList === false) {
                conf.onError({ id: conf.id, error: `checkList: ${data.deletedFromList}` });
            } else {
                conf.page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}-confirmed.png`);
                openRecyleBin(conf);
            }
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};


openRecyleBin = (conf) => {
    let data;
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
            conf.page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}-recycle-bin.png`);
            checkRecyleBin(conf);
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};

checkRecyleBin = (conf) => {
    let data;
    waitFor({
        onTest() {
            data = conf.page.evaluate((name) => {
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
            if (
                R.isNil(data.folderInRecycleBin) ||
                data.folderInRecycleBin === false) {
                conf.onError({ id: conf.id, error: `checkRecycleBin: folder "${conf.name}" not found in recycle bin! ${data.folderInRecycleBin}` });
            } else {
                conf.onReady({ id: conf.id, deletedFolder: conf.name });
            }
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};

export default deleteFolder;
