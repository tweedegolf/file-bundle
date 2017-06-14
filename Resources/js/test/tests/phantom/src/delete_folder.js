import R from 'ramda';
import { waitFor } from './util';
import config from './config';

const filesInFolder = [];
let sendEnter;
let check;

const renameFolder = (conf) => {
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
                    let found = false;
                    if (deleteBtn) {
                        found = true;
                        deleteBtn.parentNode.click();
                    }

                    return {
                        ready: true,
                        found,
                        numFolders: folders.length,
                    };
                }
                return {
                    ready: false,
                    numFolders: folders.length,
                };
            }, conf.name);
            if (data) {
                console.log(data.found);
            }
            return data.ready === true;
        },
        onReady() {
            conf.page.render(`${config.SCREENSHOTS_PATH}/delete-folder-${conf.name}.png`);
            // sendEnter({ ...conf, index: data.index });
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};


sendEnter = (conf) => {
    waitFor({
        onTest() {
            // press <enter>, this will submit the new name to the server
            conf.page.sendEvent('keypress', conf.page.event.key.Enter);
            return true;
        },
        onReady() {
            check(conf);
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
            data = conf.page.evaluate((index, newName) => {
                const spans = Array.from(document.querySelectorAll('tr.folder > td:nth-child(3) > span'));
                if (spans) {
                    const folderNames = spans.map(span => span.innerHTML);
                    return {
                        numFolders: folderNames.length,
                        ready: folderNames[index] === newName,
                    };
                }
                return {
                    ready: false,
                };
            }, conf.index, conf.newName);
            // console.log(data.numFolders, conf.index);
            return data.ready;
        },
        onReady() {
            conf.page.render(`${config.SCREENSHOTS_PATH}/folder-${conf.name}-renamed-to-${conf.newName}.png`);
            conf.onReady({ id: conf.id, renamed: data.renamed, ready: data.ready });
        },
        onError(error) {
            conf.onError({ id: conf.id, error });
        },
    });
};

export default renameFolder;
