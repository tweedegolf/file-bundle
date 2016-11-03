
module.exports = {

  waitFor: function(onTest, onCheck, onReady, timeOutMillis, delay) {
    //console.log(onTest, onCheck, onReady, timeOutMillis, delay)
    timeOutMillis = timeOutMillis ? timeOutMillis : 10000
    delay = delay ? delay : 50

    var start = new Date().getTime()
    var condition = false

    var interval = setInterval(function() {
      var elapsed = new Date().getTime() - start
      //console.log(elapsed)
      if(elapsed < timeOutMillis && condition === false){
        onCheck()
        condition = onTest()
      }else if(condition === false){
        console.log(false);
        phantom.exit(1);
      }else{
        //console.log('waitFor() finished in ' + (new Date().getTime() - start) + 'ms.');
        onReady()
        clearInterval(interval); //< Stop this interval
      }
    }, delay);
  }
}
