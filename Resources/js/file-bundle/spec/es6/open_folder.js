/**
 * This test opens the first folder and return the number of files and folders
 * it contains. In jasmine we test these numbers against the espected numbers.
 */

// get arguments from command line
let args = require('system').args
// simple function that repeatedly tests for a condition until it return true or times out
import {waitFor} from './util.js'
import runTask from './task_runner.js'
// create the Phantomjs webpage
//import webpage from 'webpage'
let page = require('webpage').create()
// put eslint at ease
const phantom = global.phantom
// since this is the first phantomjs test in the jasmine suite we remove all
// screenshots made by previous test runs
let fs = require('fs')
fs.removeTree('./spec/screenshots')
fs.makeDirectory('./spec/screenshots')

// set viewport, only needed if you want to take screen shots
page.viewportSize = {width: 1024, height: 768};
page.clipRect = {top: 0, left: 0, width: 1024, height: 768};


// default values for command line arguments
let url = 'http://localhost:5050'

function getCommandLineArgs(){
  // overrule the default values if set
  for(var i = args.length - 1; i > 0; i--){
    var arg = args[i]
    if(arg.indexOf('url') === 0){
      url = arg.substring(arg.indexOf('url') + 4)
    }
  }
}


export function openPage(){
  getCommandLineArgs()
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
export function openFolder(){
  var data
  waitFor({
    onTest: function(){
      data = page.evaluate(function(){
        var b = document.querySelectorAll('tr.folder')[0]
        var n = '', r
        if(b){
          n = b.querySelector('td.name').innerHTML
          r = b.getBoundingClientRect()
          //b.click() // => we can't use this here, see comment below
        }
        return {
          name: n,
          rect: r
        }
      })
      return data.name !== ''
    },
    onReady: function(){
      page.render('./spec/screenshots/shot-page-opened.png')
      // We want to make a screenshot of the opened root folder which means that
      // we can not use the HTMLElement.click() function inside the
      // page.evaluate handler because if we do we are making a screenshot after
      // we have clicked on the 'colors' folder. What we will actually see in
      // the screenshot then depends on the response time of the server.
      // Therefor we use the page.sendEvent() function to send a click event to
      // the center of the folder row *after* we have taken the screenshot.
      page.sendEvent('click', data.rect.left + data.rect.width / 2, data.rect.top + data.rect.height / 2)
      runTask(data.name)
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
export function readFolder(folderName){
  var data
  waitFor({
    onTest: function(){
      data = page.evaluate(function(){
        //@TODO: check for spinner instead of foldername to determine whether the contents has been loaded or not!
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
      page.render('./spec/screenshots/shot-folder-' + folderName + '-opened.png')
      data.name = folderName
      console.log(JSON.stringify(data))
      runTask()
    }
  })
}
