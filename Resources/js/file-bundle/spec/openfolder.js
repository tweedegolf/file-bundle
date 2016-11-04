/**
 * This test opens the first folder and return the number of files and folders
 * it contains. In jasmine we test these numbers against the espected numbers.
 */

// get arguments from command line
var args = require('system').args
// simple function that repeatedly tests for a condition, then returns a value or times out
var waitFor = require('./util.js').waitFor
// create the Phantomjs webpage
var page = require('webpage').create();

// set viewport, only needed for screen shots
page.viewportSize = {width: 1024, height: 768};
page.clipRect = {top: 0, left: 0, width: 1024, height: 768};

var runTask
var taskIndex = -1
var phantom = global.phantom

// the url of the page is provided as the first command line argument
var url = args[1]
if(typeof url === 'undefined'){
  url = 'http://localhost:5050'
}


function openPage(){
  // try to open the url
  page.open(url, function(status){

    if(status !== 'success'){
      console.log(false)
      phantom.exit(1)
    }
    runTask()
  })
}

/**
 * Opens a folder; its content needs to be loaded from the server and because
 * this may take a while, we test if the contents has been loaded by checking
 * for a <tr> with css class folder.
 */
function openFolder(){
  var name = ''
  waitFor({
    onTest: function(){
      name = page.evaluate(function(){
        var b = document.querySelectorAll('tr.folder')[0]
        if(b){
          name = b.querySelector('td.name').innerHTML
          b.click()
        }
        return name
      })
      return name !== ''
    },
    onReady: function(){
      page.render('shot-page-opened.jpg')
      runTask(name)
    }
  })
}


/**
 * By cliking on the folder the application will request the folder contents
 * from the server. This may take a while. In the waitFor function we test
 * whether the contents of the new folder has been loaded or not. We do this by
 * testing the name of the folder against the name of first row in the browser
 * list: as long as these names are the same, the new folder contents has not
 * been loaded yet.
 *
 * @param      {string}  folderName  The folder name
 */
function readFolder(folderName){
  var data
  waitFor({
    onTest: function(){
      data = page.evaluate(function(){
        var e = document.querySelector('tr.folder > td.name')
        if(e === null){
          return {
            name: ''
          }
        }
        return {
          name: e.innerHTML,
          numFiles: document.querySelectorAll('tr.cutable').length,
          numFolders: document.querySelectorAll('tr.folder').length
        }
      })
      return data.name !== folderName
    },
    onReady: function(){
      page.render('shot-folder-' + folderName + '-opened.jpg')
      data.name = folderName
      console.log(JSON.stringify(data))
      runTask()
    }
  })
}


var tasks = [
  openPage,
  openFolder,
  readFolder
]


runTask = function(data){
  taskIndex++
  //console.log(taskIndex, tasks.length)
  if(taskIndex < tasks.length){
    tasks[taskIndex](data)
  }else{
    phantom.exit()
  }
}

runTask()
