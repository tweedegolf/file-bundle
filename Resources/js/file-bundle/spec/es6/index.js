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


import TaskRunner from './task_runner'
// import all tasks
import {openPage} from './open_page'
import {openFolder} from './open_folder'
import {readFolder} from './read_folder'


// put eslint at ease
const phantom = global.phantom
let testResult = {}

function onError(){
  console.log(false)
  phantom.exit(1)
}

let taskRunner = new TaskRunner()
let tasks = [
  {
    func: openPage,
    args: {
      page,
      onError,
      onReady(){
        testResult.openPage = true
        taskRunner.runTask()
      }
    }
  }, {
    func: openFolder,
    args: {
      page,
      onError,
      onReady(folderName){
        testResult.openFolder = {folderName}
        console.log(folderName)
        taskRunner.runTask({folderName})
      }
    }
  }, {
    func: readFolder,
    args: {
      page,
      onError,
      onReady(data){
        testResult.readFolder = data
        console.log(data)
        taskRunner.runTask()
      }
    }
  }]

taskRunner.configure(tasks, () => {
  console.log('done')
  phantom.exit(0)
})

taskRunner.runTask()




/*
Promise.all(promises)
.then(
  values => {
    console.log(values.length)
    phantom.exit(1)
  },
  errors => {
  })
*/


/*
chainPromises({
  index: 0,
  promises: [{
    id: 'openPage',
    func: openPage,
    parseResolveValue: (p, id) => {
      page = p
      return {page, id}
    }
  }],
  resolve: (values, error) => {
    values.forEach(value => {
      console.log('resolvedata:', value.id)
    })
    page.render('./spec/screenshots/shot-es6.png')
    console.log(true)
    phantom.exit(0)
  },
  reject: error => {
    console.log('reject', error)
    console.log(false)
    phantom.exit(1)
  }
})
*/