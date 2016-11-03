/**
 * This test opens the first folder and return the number of files and folders
 * it contains. In jasmine we test these numbers against the espected numbers.
 */


// get arguments from command line
var args = require('system').args
// simple function that repeatedly tests for a condition, then returns true or times out
var waitFor = require('./util.js').waitFor
// create the Phantomjs webpage
var page = require('webpage').create();

// set viewport, only needed for screen shots
page.viewportSize = {width: 1024, height: 768};
page.clipRect = {top: 0, left: 0, width: 1024, height: 768};


// the url of the page is provided as the first command line argument
var url = args[1]

// try to open the url
page.open(url, function(status){

  var data
  var title
  var folderName
  var data

  if(status !== 'success'){
    console.log(false)
    phantom.exit(1)
  }

  page.render('shot-page-opened.jpg')

  var title = page.evaluate(function(s) {
    return document.querySelector(s).innerText
  }, 'title')

  // Find the first folder in the browser list, get its name and click on the
  // row to open it.
  folderName = page.evaluate(function(){
    var b = document.querySelectorAll('tr.folder')[0]
    b.click()
    return b.querySelector('td.name').innerHTML
  })
  console.log(folderName)
  phantom.exit()

  // By cliking on the folder the application will request the folder contents
  // from the server. This may take a while. In the waitFor function we test
  // whether the contents of the new folder has been loaded or not. We do this
  // by testing the name of the folder against the name of first row in the
  // browser list: as long as these names are the same, the new folder contents
  // has not been loaded yet.
  waitFor(
    // the function that tests if the names are still the same
    function(){
      data = page.evaluate(function(){
        // return {
        //   name: document.querySelector('tr.folder > td.name').innerHTML,
        //   numFiles: document.querySelectorAll('tr.cutable').length,
        //   numFolders: document.querySelectorAll('tr.folder').length
        // }
        return document.querySelector('tr.folder > td.name').innerHTML
      })
      return data !== folderName
      // if(data && data.name){
      //   return data.name !== folderName
      // }
      // return false
    },
    // function called every time the test function has been called
    function(){},
    // function called after the test has returned true
    function(){
      page.render('shot-folder-' + folderName + '-opened.jpg')
      return JSON.stringify(data)
    },
    // time out after half a minute
    30000,
    // test every 50 milliseconds
    50
  )
})

