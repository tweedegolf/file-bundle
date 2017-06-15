import R from 'ramda';
import { waitFor } from './util';
import config from './config';

// declare functions
let check;

const openParentFolder = (conf) => {
    const {
        onError,
    } = conf;

    let data;
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
                return {
                    ready: false,
                };
            });
            // console.log(data.parentFolderName);
            return data.ready === true;
        },
        onReady() {
            if (R.isNil(data.buttonClicked) ||
                R.isNil(data.parentFolderName) ||
                data.buttonClicked === false ||
                data.parentFolderName === null) {
                conf.page.render(`${config.SCREENSHOTS_PATH}/parent-folder-not-found.png`);
                conf.onError({ id: conf.id, error: 'no parent folder found' });
            } else {
                check({ ...conf, ...data });
            }
        },
        onError(error) {
            onError({ id: conf.id, error });
        },
    });
};


check = (conf) => {
    const {
    onReady,
    onError,
  } = conf;

    let data;
    waitFor({
        onTest() {
            data = conf.page.evaluate((parentFolderName) => {
                const folderNames = Array.from(document.querySelectorAll('tr.folder > td:nth-child(3) > span'));
                const index = folderNames.findIndex(name => name === parentFolderName);
                if (folderNames) {
                    return {
                        ready: true,
                        opened: index === -1,
                        parentFolderName,
                    };
                }
                return {
                    ready: false,
                };
            }, conf.parentFolderName);
            return data.ready === true;
        },
        onReady() {
            if (R.isNil(data.opened) || data.opened === false) {
                onError({ id: conf.id, error: `parent folder of ${conf.currentFolder} not opened` });
            } else {
                conf.page.render(`${config.SCREENSHOTS_PATH}/parent-folder-of-${conf.currentFolder}-opened.png`);
                onReady({ id: conf.id, ...data });
            }
        },
        onError(error) {
            onError({ id: conf.id, error });
        },
    });
};

export default openParentFolder;
