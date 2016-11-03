var args = require('system').args
var url = args[1]
var page = require('webpage').create();
page.viewportSize = {width: 1024, height: 768};
page.clipRect = {top: 0, left: 0, width: 1024, height: 768};

function getTimestamp(){
  // or use Date.now()
  return new Date().getTime();
}
var lastTimestamp = getTimestamp()

page.onResourceRequested = function(request) {
  // update the timestamp when there is a request
  lastTimestamp = getTimestamp();
};
page.onResourceReceived = function(response) {
  // update the timestamp when there is a response
  lastTimestamp = getTimestamp();
};

page.open(url, function(status) {
  if (status !== 'success') {
    // exit if it fails to load the page
    phantom.exit(1);
  }else{
    var button = page.evaluate(function(){
      return document.querySelectorAll('tr.folder')[0]
    })
    console.log(button)
  }
});

function checkReadyState() {
  setTimeout(function () {
    var curentTimestamp = getTimestamp();
    if(curentTimestamp - lastTimestamp > 1000){
      // exit if there isn't request or response in 1000ms
      phantom.exit(1);
    }else{
      checkReadyState();
    }
  }, 50);
}

checkReadyState();
