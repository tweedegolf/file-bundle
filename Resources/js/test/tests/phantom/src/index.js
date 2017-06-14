import 'babel-polyfill';
import webpage from 'webpage';
import fs from 'fs';
import config from './config';
import i18n from './i18n';
// taskrunner is a simple class that executes functions (tasks) consecutively
import TaskRunner from './task_runner';
// import all necessary tasks
import { openPage, closeServer } from './open_page';
import openFolder from './open_folder';
import uploadFiles from './upload_files';
import createFolder from './create_folder';
import renameFolder from './rename_folder';
import deleteFolder from './delete_folder';
// get arguments from command line
import { args } from 'system';

// default values for command line arguments
let url = 'http://localhost:5050';
// overrule the default values if set
args.forEach((arg) => {
    if (arg.indexOf('url') === 0) {
        url = arg.substring(arg.indexOf('url') + 4);
    }
});


// every time we run the jasmine suite we remove all screenshots made by
// previous test runs
fs.removeTree(config.SCREENSHOTS_PATH);
fs.makeDirectory(config.SCREENSHOTS_PATH);

// create the Phantomjs webpage and set viewport (only needed if you want to
// take screen shots)
const page = webpage.create();
page.viewportSize = { width: 1024, height: 768 };
page.clipRect = { top: 0, left: 0, width: 1024, height: 768 };

// put eslint at ease
const phantom = global.phantom;
// the return values of all tasks will be stored in the testResults array
const testResults = [];
const taskRunner = new TaskRunner();
const debug = false;


function printResults() {
    const json = {};
    testResults.forEach((result) => {
        json[result.id] = result;
    });
    console.log(`$DATA${JSON.stringify(json)}$DATA`);
    phantom.exit(0);
}

function onError(error) {
    testResults.push(error);
    if (debug === true) {
        console.log(JSON.stringify(error));
    } else {
        printResults();
    }
    phantom.exit(1);
}

function onReady(data) {
    testResults.push(data);
    if (debug === true) {
        console.log(JSON.stringify(data));
    }
    taskRunner.runTask();
}


const tasks = [
    {
        id: 'open_page',
        func: openPage,
        args: {
            url,
            page,
            onError,
            onReady,
        },
    }, {
        id: 'delete_folder',
        func: deleteFolder,
        args: {
            name: 'folder 1',
            page,
            onError,
            onReady,
        },
    // }, {
    //     id: 'rename_folder',
    //     func: renameFolder,
    //     args: {
    //         name: 'folder 1',
    //         newName: 'folder renamed',
    //         page,
    //         onError,
    //         onReady,
    //     },
    // }, {
    //     id: 'open_folder',
    //     func: openFolder,
    //     args: {
    //         index: 0, // open the first folder
    //         // name: 'folder 1', // open a folder by name
    //         page,
    //         onError,
    //         onReady,
    //     },
    // }, {
    //     id: 'upload_single_file',
    //     func: uploadFiles,
    //     args: {
    //         page,
    //         files: [`${config.MEDIA_PATH}/400x220.png`],
    //         onError,
    //         onReady,
    //     },
    // }, {
    //     id: 'upload_multiple_files',
    //     func: uploadFiles,
    //     args: {
    //         page,
    //         files: [`${config.MEDIA_PATH}/240x760.png`, `${config.MEDIA_PATH}/1200x280.png`],
    //         onError,
    //         onReady,
    //     },
    // }, {
    //     id: 'create_folder',
    //     func: createFolder,
    //     args: {
    //         page,
    //         labelSaveButton: i18n.t('toolbar.save'),
    //         labelCreateButton: i18n.t('toolbar.createFolder'),
    //         placeholderInputField: i18n.t('toolbar.folderName'),
    //         name: 'phantom_folder',
    //         onError,
    //         onReady,
    //     },
    // }, {
    //     id: 'open_folder_phantom',
    //     func: openFolder,
    //     args: {
    //         name: 'phantom_folder',
    //         page,
    //         onError,
    //         onReady,
    //     },
    // }, {
    //     id: 'close_server',
    //     func: closeServer,
    //     args: {
    //         page,
    //         url,
    //         onError,
    //         onReady,
    //     },
    }];


page.open(url, () => {
    page.evaluate(() => {
        localStorage.clear();
    });
    taskRunner.configure({
        debug,
        tasks,
        onReady: printResults,
    //  maxIndex: 2,
    }).runTask();
});

