var args = require('system').args
var url = args[1]
var waitFor = require('./util.js').waitFor
var page = require('webpage').create();
page.viewportSize = {width: 1024, height: 768};
page.clipRect = {top: 0, left: 0, width: 1024, height: 768};

page.open(url, function(status) {
  console.log('[open page]', status);
  if(status !== 'success'){
    phantom.exit(1)
  }

  var title = page.evaluate(function(s) {
    return document.querySelector(s).innerText
  }, 'title')
  console.log('title:', title)

  var jQueryLoaded = page.injectJs('./jquery.min.js')
  console.log(jQueryLoaded)

  if(jQueryLoaded){
    var button
    var stamp = new Date().getTime()
    console.log('aappp', global.jQuery)
    waitFor(
      // test fn
      function(){
        button = page.evaluate(function(){
          return document.querySelectorAll('tr.folder')[0]
        })
        return button !== null
      },
      // ready
      function(){
        page.render('shot.jpg')
        //console.log('button', $('tr.folder')[0])
        phantom.exit(0)
      },
      // timeout half a minute
      30000
    )
  }

  // page.render('shot.jpg')
  // console.log(title + ' => ' + url)

  // page.render('shot2.jpg');
  // phantom.exit()

  // var upload = page.evaluate(function(s) {
  //   return document.querySelector(s).multiple;
  // }, 'input[type=file]');

  // console.log(upload);

  // page.evaluateAsync(function() {
  //   page.uploadFile('input[type=file]', '/home/abudaan/Pictures/400x220.png');
  //   //phantom.exit();
  //   return true
  // }, 5000);

  // setTimeout(function(){
  //   page.render('shot1.jpg');
  //   // var button = document.querySelectorAll('tr.folder')[0]

  //   var rect = page.evaluate(function(){
  //     return document.querySelector('tr.folder').getBoundingClientRect()
  //   })
  //   //console.log(document.querySelector('#tg_file_browser'))
  //   //console.log(button.className)
  //   //page.sendEvent('click', button.offsetLeft, button.offsetTop)
  //   page.sendEvent('click', rect.left + rect.width / 2, rect.top + rect.height / 2)


  //   var button = page.evaluate(function(){
  //     return document.querySelectorAll('tr.folder')[0]
  //   })
  //   console.log('button', button, button instanceof Element)
  //   // button.click()


  //   setTimeout(function(){
  //     page.render('shot2.jpg');
  //     phantom.exit();
  //   }, 100)

  //   //console.log('')
  //   // return true
  // }, 100);

});


// page.onLoadFinished = function(status){
//   console.log('[page loaded]', status)
//   page.render('shot0.jpg');
//   var button = page.evaluate(function(){
//     return document.querySelectorAll('tr.folder')[0]
//   })
//   console.log(1, button, button instanceof Element)
//   //console.log(button, button instanceof Element)
// }
