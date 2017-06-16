import R from 'ramda';
import { waitFor } from './util';
import config from './config';

let pressEnterKey;
let checkRenamedFolder;

const renameFolder = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `renameFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM renameFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((name, newName) => {
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
                    const folderName = folder.querySelector('td:nth-child(3) > span');
                    folderName.click();

                    const input = folder.querySelector('td:nth-child(3) > input');
                    input.value = newName;

                    let classNames = '';
                    if (input) {
                        classNames = input.classList.toString();
                    }

                    return {
                        index,
                        numFolders: folders.length,
                        classNames,
                    };
                }
                return null;
            }, conf.name, conf.newName);
            return data !== null;
        },
        onReady() {
            if (R.isNil(error) === false) {
                onError({ id, error });
            } else if (R.isNil(data.index === -1)) {
                onError({ id, error: `could not find folder with index: ${conf.index}` });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/folder-${conf.name}-rename-to-${conf.newName}.png`);
                pressEnterKey({ ...conf, index: data.index });
            }
        },
        onTimeout(msg) {
            onError({ id, error: msg });
        },
    });
};


pressEnterKey = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let error = null;
    page.onError = (err) => {
        error = `sendEnter: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM sendEnter]: ${msg}`);
    };

    waitFor({
        onTest() {
            // press <enter>, this will submit the new name to the server
            page.sendEvent('keypress', page.event.key.Enter);
            return true;
        },
        onReady() {
            if (R.isNil(error) === false) {
                onError({ id, error });
            } else {
                checkRenamedFolder(conf);
            }
        },
        onTimeout(msg) {
            onError({ id, error: msg });
        },
    });
};

checkRenamedFolder = (conf) => {
    const {
        id,
        page,
        onError,
        onReady,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `checkRenamedFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM checkRenamedFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = conf.page.evaluate((index, newName) => {
                const folders = Array.from(document.querySelectorAll('tr.folder'));
                if (folders) {
                    const folder = folders[index];
                    const renamed = folder.querySelector('td:nth-child(3) > span').innerHTML === newName;
                    return {
                        renamed,
                    };
                }
                return null;
            }, conf.index, conf.newName);
            return data !== null;
        },
        onReady() {
            if (R.isNil(error) === false) {
                onError({ id, error });
            } else if (data.renamed === false) {
                onError({ id, error: `could not rename folder with index: ${conf.index} to "${conf.newName}"` });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/folder-${conf.name}-renamed-to-${conf.newName}.png`);
                onReady({ id, renamed: data.renamed });
            }
        },
        onTimeout(msg) {
            onError({ id, error: msg });
        },
    });
};

export default renameFolder;
