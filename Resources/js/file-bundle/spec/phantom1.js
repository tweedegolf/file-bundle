var page = require('webpage').create();
page.open('http://tweedegolf.nl', function(status) {
  console.log(status);
  phantom.exit();
});
