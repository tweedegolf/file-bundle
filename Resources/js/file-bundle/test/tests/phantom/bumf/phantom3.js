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

// the url of the page is provided as the first command line argument
var url = args[1]

function openPage(){
  // try to open the url
  page.open(url, function(status){

    if(status !== 'success'){
      console.log(false)
      phantom.exit(1)
    }


    var title = page.evaluate(function(s) {
      return document.querySelector(s).innerText
    }, 'title')
    //console.log('title:', title)

    var name = ''
    waitFor(
      function(){
        name = page.evaluate(function(){
          var b = document.querySelectorAll('tr.folder')[0]
          if(b){
            name = b.querySelector('td.name').innerHTML
            //page.render('shot-' + name + '-opened.jpg')
            b.click()
          }
          return name
        })
        return name !== ''
      },
      function(){},
      function(){
        runTask(name)
      }
    )
  })
}


function openFolder(folderName){

  var data
  waitFor(
    function(){
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
    function(){},
    function(){
      page.render('shot-folder-' + folderName + '-opened.jpg')
      data.name = folderName
      console.log(JSON.stringify(data))
      runTask()
    }
  )
}


var tasks = [
  openPage,
  openFolder
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


/*
function includeJQuery(){
  page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js');
  waitFor(
    // test fn
    function(){
      console.log('fuck', global.$)
      return typeof global.$ !== undefined
    },
    // ready
    function(){
      renderPage()
      runTask()
    },
    // timeout half a minute
    30000
  )
}
*/

