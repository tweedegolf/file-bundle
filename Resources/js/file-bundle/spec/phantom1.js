
// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });

var args = require('system').args
var url = args[1]


var page = require('webpage').create();

page.viewportSize = {width: 1024, height: 768};
page.clipRect = {top: 0, left: 0, width: 1024, height: 768};

page.open(url, function(status) {
  //console.log(status);
  //console.log(document.getElementById('upload_files'))
//    return document.querySelector('input[type=file]')

  var title = page.evaluate(function(s) {
    return document.querySelector(s).innerText
  }, 'title')

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

  setTimeout(function(){
    page.render('shot1.jpg');
    // var button = document.querySelectorAll('tr.folder')[0]

    var rect = page.evaluate(function(){
      return document.querySelector('tr.folder').getBoundingClientRect()
    })
    //console.log(document.querySelector('#tg_file_browser'))
    //console.log(button.className)
    //page.sendEvent('click', button.offsetLeft, button.offsetTop)
    page.sendEvent('click', rect.left + rect.width / 2, rect.top + rect.height / 2)
    //button.click()
    setTimeout(function(){
      page.render('shot2.jpg');
      phantom.exit();
    }, 500)

    //console.log('')
    // return true
  }, 500);

});
