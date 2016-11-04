
module.exports = {
  /**
   * Function that repeatedly runs a test function until it returns true or
   * times out
   *
   * @param      {Object}  conf    Configuration object
   * @param      {function}  conf.onTest   The test function (mandatory)
   * @param      {function}  conf.onCheck  Callback function that is called every
   *                                       time the test function runs
   * @param      {function}  conf.onReady  Function called as soon as the test
   *                                       function returns true
   * @param      {function}  conf.onError  Called when the waitFor function times out
   * @param      {number}    conf.timeout  Milliseconds before a timeout occurs
   * @param      {number}    conf.delay    Amount of milliseconds between 2
   *                                       consecutive test function calls (higher
   *                                       numbers result in less overhead time)
   */

  waitFor: function(conf) {

    var timeout = conf.timeout ? conf.timeout : 10000
    var delay = conf.delay ? conf.delay : 50

    var start = new Date().getTime()
    var condition = false

    var interval = setInterval(function() {
      var elapsed = new Date().getTime() - start
      //console.log(elapsed)
      if(elapsed < timeout && condition === false){
        if(typeof conf.onCheck === 'function'){
          conf.onCheck()
        }
        condition = conf.onTest()
      }else if(condition === false){
        if(typeof conf.onError === 'function'){
          conf.onError()
        }else {
          console.log(false)
          phantom.exit(1)
        }
      }else{
        if(typeof conf.onReady === 'function'){
          conf.onReady()
        }
        clearInterval(interval)
      }
    }, delay)
  }
}
