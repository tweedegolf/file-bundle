/**
 * This test uploads a file to the root folder
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


function uploadFile(){
  var data = ''
  waitFor({
    onTest: function(){
      data = page.evaluate(function(){
        var b = document.querySelectorAll('tr.folder')[0]
        var u = document.querySelector('input[type=file]')
        var name = ''
        var upload = 'nope'
        if(b){
          name = b.querySelector('td.name').innerHTML
        }
        if(u){
          upload = u.type
        }
        return {
          name: name,
          upload: upload
        }
      })
      //console.log(data.name, data.upload)
      return data.name !== ''
    },
    onReady: function(){
      page.uploadFile('input[type=file]', '/home/abudaan/Pictures/400x220.png')
      var result = page.evaluate(function(){
        return true
      })
      runTask()
    }
  })
}


function checkIfUploaded(){
  var data = ''
  waitFor({
    onTest: function(){
      data = page.evaluate(function(){
        var f = document.querySelectorAll('tr.cutable')[0]
        var name = ''
        if(f){
          name = f.querySelector('td.name').innerHTML
        }
        return {
          name: name,
          numFiles: document.querySelectorAll('tr.cutable').length
        }
      })
      //console.log(data.name)
      return data.name === '400x220.png'
    },
    onReady: function(){
      page.render('shot-file-uploaded.png')
      data.uploaded = true
      console.log(JSON.stringify(data))
      runTask()
    }
  })
}


var tasks = [
  openPage,
  uploadFile,
  checkIfUploaded
]


runTask = function(data){
  taskIndex++
  //console.log(taskIndex, tasks.length)
  if(taskIndex < tasks.length){
    tasks[taskIndex](data)
  }else{
    //console.log('done')
    phantom.exit(0)
  }
}

runTask()
