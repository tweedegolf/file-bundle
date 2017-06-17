// import R from 'ramda';
import { waitFor } from './util';
import config from './config';

// declare functions
let typeFolderName; // type the name of the folder in the input field
let submitNewFolder; // press the "create folder" button
let checkNewFolder; // check if the the new folder has been created succesfully


/**
 * Creates a new folder in the currently opened folder.
 *
 * @param      {Object}    conf     The configuration object
 * @property   {string}    id       The id of the task that executes this
 *                                  function
 * @property   {Object}    page     The phantomjs WebPage object
 * @property   {string}    name     The name of the to be created folder
 * @property   {function}  onReady  The function called after the folder's
 *                                  contents has been loaded
 * @property   {function}  onError  The function called if the onTest() function
 *                                  returns false or reaches the timeout.
 */
const createFolder = (conf) => {
    const {
        id,
        page,
        onError,
        labelCreateButton,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `createFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM createFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((buttonLabel) => {
                // get the "create folder" button
                const buttonLabels = Array.from(document.querySelectorAll('button[type=button] > span.text-label'));
                let buttonClicked = false;
                // find the "create folder" button by reading the labels on the buttons,
                // when found click on it
                if (buttonLabels) {
                    buttonLabels.forEach((label) => {
                        if (label.innerHTML === buttonLabel) {
                            label.parentNode.click();
                            buttonClicked = true;
                        }
                    });
                    return {
                        buttonClicked,
                    };
                }
                return null;
            }, labelCreateButton);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (data.buttonClicked === false) {
                onError({ id, error: 'could not find the "create folder" button' });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/new-folder-open-dialog.png`);
                typeFolderName(conf);
            }
        },
        onTimeout(msg) {
            onError({ id, error: `createFolder: ${msg}` });
        },
    });
};


/**
 * Find the input field and type in the name of the new folder
 *
 * @param      {Object}  conf    The configuration object, this is the same
 *                               object is that is passed for argument to the
 *                               createFolder() function.
 */
typeFolderName = (conf) => {
    const {
        id,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `typeFolderName: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM typeFolderName]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((name, placeholder) => {
                const input = document.querySelector(`input[placeholder=${placeholder}]`);
                if (input !== null) {
                    input.value = name;
                    return true;
                }
                return null;
            }, conf.name, conf.placeholderInputField);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/new-folder-input-name.png`);
                submitNewFolder(conf);
            }
        },
        onTimeout(msg) {
            onError({ id, error: `typeFolderName: ${msg}` });
        },
    });
};


/**
 * Find the "save" button and click on it
 *
 * @param      {Object}  conf    The configuration object, this is the same
 *                               object is that is passed for argument to the
 *                               createFolder() function.
 */
submitNewFolder = (conf) => {
    const {
        id,
        labelSaveButton,
        page,
        onError,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `submitNewFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM submitNewFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate((buttonLabel) => {
                const buttonLabels = Array.from(document.querySelectorAll('button[type=button] > span.text-label'));
                let buttonClicked = false;
                if (buttonLabels) {
                    buttonLabels.forEach((label) => {
                        if (label.innerHTML === buttonLabel) {
                            label.parentNode.click();
                            buttonClicked = true;
                        }
                    });
                    return {
                        buttonClicked,
                    };
                }
                return null;
            }, labelSaveButton);
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (data.buttonClicked === false) {
                onError({ id, error: 'could not find the "save new folder" button' });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/new-folder-submit.png`);
                checkNewFolder(conf);
            }
        },
        onTimeout(msg) {
            onError({ id, error: `submitNewFolder: ${msg}` });
        },
    });
};

/**
 * Check if the both the form and the spinner animation are hidden and then get
 * the number of folders in the parent folder so we can test whether the folder
 * has been created successfully or not.
 *
 * @param      {Object}  conf    The configuration object, this is the same
 *                               object is that is passed for argument to the
 *                               createFolder() function.
 */
checkNewFolder = (conf) => {
    const {
        id,
        page,
        onError,
        onReady,
    } = conf;

    let data = null;
    let error = null;
    page.onError = (err) => {
        error = `checkNewFolder: ${err}`;
    };
    page.onConsoleMessage = (msg) => {
        console.log(`[PHANTOM checkNewFolder]: ${msg}`);
    };

    waitFor({
        onTest() {
            data = page.evaluate(() => {
                const form = document.querySelector('div.form-inline.pull-right');
                const spinner = document.querySelector('button[type=button] > span.fa.fa-circle-o-notch.fa-spin');
                // const aap = R.isNil(spinner);
                if (form !== null && spinner === null) {
                    return {
                        class: form.className,
                        ready: form.className.indexOf('hide') !== -1,
                        numFolders: document.querySelectorAll('tr.folder').length,
                    };
                }
                return null;
            });
            return data !== null || error !== null;
        },
        onReady() {
            if (error !== null) {
                onError({ id, error });
            } else if (data.ready === false) {
                onError({ id, error: `could not find the new folder with name "${conf.name}"` });
            } else {
                page.render(`${config.SCREENSHOTS_PATH}/new-folder-check.png`);
                onReady({
                    id,
                    numFolders: data.numFolders,
                });
            }
        },
        onTimeout(msg) {
            onError({ id, error: `checkNewFolder: ${msg}` });
        },
    });
};

export default createFolder;
