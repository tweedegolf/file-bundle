import 'babel-polyfill'

// every time we run the jasmine suite we remove all screenshots made by
// previous test runs
import fs from 'fs'
fs.removeTree('./spec/screenshots')
fs.makeDirectory('./spec/screenshots')

// create the Phantomjs webpage and set viewport (only needed if you want to
// take screen shots)
import webpage from 'webpage'
let page = webpage.create();
page.viewportSize = {width: 1024, height: 768};
page.clipRect = {top: 0, left: 0, width: 1024, height: 768};

// taskrunner is a simple class that executes functions (tasks) consecutively
import TaskRunner from './task_runner'
// import all necessary tasks
import {openPage} from './open_page'
import {openFolder} from './open_folder'
import {readFolder} from './read_folder'
import {uploadFile, checkIfUploaded} from './upload_file'


// put eslint at ease
const phantom = global.phantom
// the return values of all tasks will be stored in the testResult array
let testResult = []
let taskRunner = new TaskRunner()

function printResults(){
  console.log('\n==== :RESULTS: =====')
  testResult.forEach((result, i) => {
    console.log(`${i}] ${result.id}: ${result.error}`)
  })
  phantom.exit(0)
}

function onError(error){
  testResult.push(error)
  printResults()
  phantom.exit(1)
}

function onReady(data){
  testResult.push(data)
  taskRunner.runTask()
}

let tasks = [
  {
    id: 'open_page',
    func: openPage,
    args: {
      page,
      onError,
      onReady
    }
  }, {
    id: 'open_folder',
    func: openFolder,
    args: {
      index: 0, // open the first folder
      page,
      onError,
      onReady(data){
        testResult.push(data)
        taskRunner.runTask({name: data.name})
      }
    }
  }, {
    id: 'read_folder',
    func: readFolder,
    args: {
      page,
      onError,
      onReady
    }
  }, {
    id: 'upload_single_file',
    func: uploadFile,
    args: {
      page,
      files: ['./spec/media/400x220.png'],
      onError,
      onReady
    }
  }, {
    id: 'check_upload_single_file',
    func: checkIfUploaded,
    args: {
      page,
      files: ['./spec/media/400x220.png'],
      onError,
      onReady
    }
  }, {
    id: 'upload_multiple_files',
    func: uploadFile,
    args: {
      page,
      files: ['./spec/media/1280x280.png', './spec/media/240x760.png'],
      onError,
      onReady
    }
  }, {
    id: 'check_upload_multiple_files',
    func: checkIfUploaded,
    args: {
      page,
      files: ['./spec/media/1280x280.png', './spec/media/240x760.png'],
      onError,
      onReady
    }
  }]

taskRunner.configure(tasks, printResults, [0, 1, 2, 3])
taskRunner.runTask()
