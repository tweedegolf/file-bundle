import R from 'ramda';
import config from './config';

// declare functions
let check; // check if the folder has been opened

const openFolderById = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let error = null;
    page.onError = (err) => {
        error = err;
    };

    const data = page.evaluate((index) => {
        const folders = Array.from(document.querySelectorAll('tr.folder'));
        if (folders) {
            const folder = folders[index];
            const name = folder.querySelector('td:nth-child(3) > span').innerHTML;
            // const aap = R.isNil(name);
            folder.click();
            return {
                name,
                numFiles: document.querySelectorAll('tr.cutable').length,
                numFolders: folders.length,
            };
        }
        return null;
    }, conf.index);

    if (R.isNil(data) || R.isNil(error) === false) {
        onError({ id, error });
    } else if (R.isNil(data.name)) {
        onError({ id, error: `could not find folder with index: ${conf.index}` });
    } else {
        check({ ...conf, ...data });
    }
};

const openFolderByName = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let error = null;
    page.onError = (err) => {
        error = err;
    };

    const data = page.evaluate((name) => {
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
                numFiles: document.querySelectorAll('tr.cutable').length,
                numFolders: folders.length,
            };
        }
        return null;
    }, conf.name);

    if (R.isNil(data) || R.isNil(error) === false) {
        onError({ id, error });
    } else if (data.index === -1) {
        onError({ id, error: `could not find folder with index: ${conf.name}` });
    } else {
        check({ conf, ...data });
    }
};

check = (conf) => {
    const {
        id,
        page,
        onError,
        onReady,
    } = conf;

    let error = null;
    page.onError = (err) => {
        error = err;
    };

    const data = conf.page.evaluate((name) => {
        const folderNames = Array.from(document.querySelectorAll('tr.folder > td:nth-child(3) > span'));
        if (folderNames) {
            const index = folderNames.findIndex(n => n === name);
            return {
                opened: index === -1,
            };
        }
        return null;
    }, conf.name);

    if (R.isNil(data) || R.isNil(error) === false) {
        onError({ id, error });
    } else if (data.opened === false) {
        const folder = R.isNil(conf.name) ? conf.index : conf.name;
        onError({ id, error: `could not open folder: ${folder}` });
    } else {
        page.render(`${config.SCREENSHOTS_PATH}/folder-${conf.name}-opened.png`);
        onReady({ id,
            name: conf.name,
            numFiles: conf.numFiles,
            numFolders: conf.numFolders,
        });
    }
};

export { openFolderById, openFolderByName };
