/**
 * This test uploads dependent on the command line arguments one or two files to
 * the root folder
 */

// get arguments from command line
var args = require('system').args;
// simple function that repeatedly tests for a condition, then returns a value or times out
var waitFor = require('./util.js').waitFor;
// create the Phantomjs webpage
var page = require('webpage').create();
// put eslint at ease
var phantom = global.phantom;


// set viewport, only needed for screen shots
page.viewportSize = {width: 1024, height: 768};
page.clipRect = {top: 0, left: 0, width: 1024, height: 768};


/**
 * This test consists of 3 tasks that need to run consecutively; every task is
 * defined in a function and the runTask function runs them one after each
 * other.
 */
// the currently running task
var taskIndex = -1;
/*
 * Array containing references to the task functions, will be populated at the
 * bottom of this file, after the task function are declared
 *
 * @type       {Array}
 */
var tasks = [];
/**
 * The task runner
 *
 * @param      {Object}  data    Optional data that is passed over from one task
 *                               to another
 */
function runTask(data){
  taskIndex++;
  //console.log(taskIndex, tasks.length)
  if(taskIndex < tasks.length){
    tasks[taskIndex](data);
  }else{
    //console.log('done')
    phantom.exit(0);
  }
};


// default values for command line arguments
var url = 'http://localhost:5050'
var multiple = true
//var argnames = ['url', 'multiple']
// overrule the default values if set
for(var i = args.length - 1; i > 0; i--){
  var arg = args[i]
  if(arg.indexOf('url') === 0){
    url = arg.substring(arg.indexOf('url') + 4)
  }
  if(arg.indexOf('multiple') === 0){
    multiple = arg.substring(arg.indexOf('multiple') + 9)
    multiple = multiple === 'true' || multiple === '1'
  }
}


function openPage(){
  // try to open the url
  page.open(url, function(status){
    if(status !== 'success'){
      console.log(false);
      phantom.exit(1);
    }
    runTask();
  })
}


/**
 * Uploads a file. We can't start uploading file until the page has fully
 * loaded. Therefor we test if we can find an input[type=file] in the page.
 */
function uploadFile(){
  var data = '';
  waitFor({
    onTest: function(){
      data = page.evaluate(function(){
        var b = document.querySelectorAll('tr.folder')[0];
        var u = document.querySelector('input[type=file]');
        var name = '';
        var upload = 'nope';
        if(b){
          name = b.querySelector('td.name').innerHTML
        }
        if(u){
          upload = u.type
        }
        return {
          name: name,
          upload: upload
        };
      });
      //console.log(data.name, data.upload)
      return data.name !== '';
    },
    onReady: function(){
      if(multiple === true){
        page.uploadFile('input[type=file]', ['./spec/media/240x760.png', './spec/media/1200x280.png']);
      }else{
        page.uploadFile('input[type=file]', './spec/media/400x220.png');
      }
      var result = page.evaluate(function(){
        return true;
      })
      runTask();
    }
  });
}


/**
 * Newly uploaded file appear at the top of the browser list so by testing if
 * the name of the first file in the list is equal to one of the files we have
 * just uploaded we know that the upload has successfully finished.
 */
function checkIfUploaded(){
  var data = '';
  waitFor({
    onTest: function(){
      data = page.evaluate(function(){
        var f = document.querySelectorAll('tr.cutable')[0];
        var name = '';
        if(f){
          name = f.querySelector('td.name').innerHTML;
        }
        return {
          name: name,
          numFiles: document.querySelectorAll('tr.cutable').length
        };
      });
      //console.log(data.name)
      if(multiple === true){
        return data.name === '1200x280.png' || data.name === '240x760.png';
      }else{
        return data.name === '400x220.png';
      }
    },
    onReady: function(){
      if(multiple === true){
        page.render('./spec/screenshots/shot-2-files-uploaded.png');
      }else{
        page.render('./spec/screenshots/shot-1-file-uploaded.png');
      }
      data.uploaded = true;
      data.multiple = multiple;
      console.log(JSON.stringify(data));
      runTask();
    }
  });
}

tasks = [
  openPage,
  uploadFile,
  checkIfUploaded
];
// start the task runner
runTask();
