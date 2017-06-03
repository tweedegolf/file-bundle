import R from 'ramda';
import { waitFor } from './util';
import config from './config';

const renameFolder = (conf) => {
    let data;
    waitFor({
        onTest() {
            data = conf.page.evaluate((name, newName) => {
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
                    const folderName = folder.querySelector('td:nth-child(3) > span');
                    folderName.click();

                    const input = folder.querySelector('td:nth-child(3) > input');
                    input.value = newName;
                    let classNames = '';
                    if (input) {
                        classNames = input.classList.toString();
                    }

                    return {
                        classNames,
                        name: folderName,
                        rect: folder.getBoundingClientRect(),
                    };
                }
                return null;
            }, conf.name, conf.newName);
            if (data !== null) {
                console.log(data.index, data.classNames);
            }
            return data !== null;
        },
        onReady() {
            // page.sendEvent('click', data.rect.left + data.rect.width / 2, data.rect.top + data.rect.height / 2)
            // conf.onReady({ ...conf, ...data });
            conf.page.render(`${config.SCREENSHOTS_PATH}/folder-${conf.name}-renamed-to-${conf.newName}.png`);
            conf.onReady({ id: conf.id, renamed: 'ready' });
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};

/*
const check = (conf) => {
    let data;
    waitFor({
        onTest() {
            data = conf.page.evaluate((name) => {
                const folderNames = document.querySelectorAll('tr.folder > td:nth-child(3) > span');
                if (typeof folderNames === 'undefined') {
                    return { loaded: false };
                }
                let loaded = true;
                // let names = []
                Array.from(folderNames).forEach((n) => {
                    // names.push(n.innerHTML)
                    if (n.innerHTML === name) {
                        loaded = false;
                    }
                });
                return {
                    loaded,
                    // folderNames: names,
                    numFiles: document.querySelectorAll('tr.cutable').length,
                    numFolders: document.querySelectorAll('tr.folder').length,
                };
            }, conf.name);
            return data.loaded;
        },
        onReady() {
            conf.page.render(`${config.SCREENSHOTS_PATH}/folder-${name}-opened.png`);
            conf.onReady({ id: conf.id, name, ...data });
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};

*/
export default renameFolder;
