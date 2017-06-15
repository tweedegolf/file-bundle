import R from 'ramda';
import { waitFor } from './util';
import config from './config';

// declare functions
let check; // check if the folder has been opened

const openFolderById = (conf) => {
    let data;
    waitFor({
        onTest() {
            data = conf.page.evaluate((index) => {
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                if (folders) {
                    const folder = folders[index];
                    const name = folder.querySelector('td:nth-child(3) > span').innerHTML;
                    folder.click();
                    return {
                        ready: true,
                        name,
                    };
                }
                return {
                    ready: false,
                };
            }, conf.index);
            return data.ready === true;
        },
        onReady() {
            if (R.isNil(data.name)) {
                conf.onError({ id: conf.id, error: `could not find folder with index: ${conf.index}` });
            } else {
                check({ ...conf, name: data.name });
            }
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};

const openFolderByName = (conf) => {
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
                    if (index !== -1) {
                        const folder = folders[index];
                        folder.click();
                    }
                    return {
                        index,
                        ready: true,
                    };
                }
                return {
                    ready: false,
                };
            }, conf.name);
            return data.ready === true;
        },
        onReady() {
            if (R.isNil(data.index) || data.index === -1) {
                conf.onError({ id: conf.id, error: `could not find folder named '${conf.name}'` });
            } else {
                check(conf);
            }
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};


check = (conf) => {
    let data;
    waitFor({
        onTest() {
            data = conf.page.evaluate((name) => {
                const folderNames = Array.from(document.querySelectorAll('tr.folder > td:nth-child(3) > span'));
                if (folderNames) {
                    const index = folderNames.findIndex(n => n === name);
                    return {
                        ready: true,
                        opened: index === -1,
                    };
                }
                return {
                    ready: false,
                };
            }, conf.name);
            return data.ready === true;
        },
        onReady() {
            conf.page.render(`${config.SCREENSHOTS_PATH}/folder-${conf.name}-opened.png`);
            conf.onReady({ id: conf.id, name, ...data });
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};

export { openFolderById, openFolderByName };
