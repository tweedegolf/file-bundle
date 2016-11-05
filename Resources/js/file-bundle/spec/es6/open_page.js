/**
 */

// get arguments from command line
import {args} from 'system'


// create the Phantomjs webpage
import webpage from 'webpage'
let page = webpage.create();
// set viewport, only needed if you want to take screen shots
page.viewportSize = {width: 1024, height: 768};
page.clipRect = {top: 0, left: 0, width: 1024, height: 768};


// since this is the first phantomjs test in the jasmine suite we remove all
// screenshots made by previous test runs
import fs from 'fs'
fs.removeTree('./spec/screenshots')
fs.makeDirectory('./spec/screenshots')


// put eslint at ease
const phantom = global.phantom


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


export function openPage(callback){
  getCommandLineArgs()
  // try to open the url
  return new Promise(resolve => {
    page.open(url, function(status){
      if(status !== 'success'){
        console.log(false)
        phantom.exit(1)
      }
      resolve({page})
    })
  })
}
