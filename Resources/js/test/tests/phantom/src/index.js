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
const debug = true;


function printResults() {
    const json = {};
    testResults.forEach((result) => {
        json[result.id] = result;
    });
    console.log(JSON.stringify(json));
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
            page,
            onError,
            onReady,
        },
    }, {
        id: 'open_folder',
        func: openFolder,
        args: {
            index: '1', // open the first folder
            // name: 'colors', // open a folder by name
            page,
            onError,
            onReady,
        },
/*
    }, {
        id: 'upload_single_file',
        func: uploadFiles,
        args: {
            page,
            files: [`${config.MEDIA_PATH}/400x220.png`],
            onError,
            onReady,
        },
    }, {
        id: 'upload_multiple_files',
        func: uploadFiles,
        args: {
            page,
            files: [`${config.MEDIA_PATH}/1200x280.png`, `${config.MEDIA_PATH}/240x760.png`],
            onError,
            onReady,
        },
    }, {
        id: 'create_folder',
        func: createFolder,
        args: {
            page,
            name: 'phantom_folder',
            onError,
            onReady,
        },
    }, {
        id: 'open_folder_phantom',
        func: openFolder,
        args: {
            name: 'phantom_folder',
            page,
            onError,
            onReady,
        },
    }, {
        id: 'close_server',
        func: closeServer,
        args: {
            page,
            onError,
            onReady,
        },
*/
    }];

taskRunner.configure({
    debug,
    tasks,
    onReady: printResults,
//  maxIndex: 2,
}).runTask();
