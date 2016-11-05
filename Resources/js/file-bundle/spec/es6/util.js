const phantom = global.phantom

/**
 * Function that repeatedly runs a test function until it returns true or
 * times out
 *
 * @param      {Object}  conf    Configuration object
 * @param      {function}  conf.onTest      The test function (mandatory)
 * @param      {function}  conf.onCheck     Callback function that is called every
 *                                          time the test function runs
 * @param      {function}  conf.onReady     Function called as soon as the test
 *                                          function returns true
 * @param      {function}  conf.onError     Called when the waitFor function times
 *                                          out
 * @param      {Object}    conf.onTestArgs  Object that will be passed as argument
 *                                          to the onTest function
 * @param      {number}    conf.timeout     Milliseconds before a timeout occurs
 * @param      {number}    conf.delay       Amount of milliseconds between 2
 *                                          consecutive test function calls (higher
 *                                          numbers result in less overhead time)
 */
export function waitFor(conf) {

  let {
    timeout = 10000,
    delay = 50,
    onTest,
    onTestArgs = {},
    onCheck = () => {},
    onReady = () => {},
    onError = null,
  } = conf

  let start = new Date().getTime()
  let condition = false

  let interval = setInterval(function() {
    let elapsed = new Date().getTime() - start
    //console.log(elapsed)
    if(elapsed < timeout && condition === false){
      onCheck()
      condition = onTest(onTestArgs)
    }else if(condition === false){
      if(typeof onError === 'function'){
        onError()
      }else {
        console.log(false)
        phantom.exit(1)
      }
    }else{
      onReady()
      clearInterval(interval)
    }
  }, delay)
}

