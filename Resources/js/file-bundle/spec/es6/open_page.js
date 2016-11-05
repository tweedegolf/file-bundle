/**
 */


// get arguments from command line
import {args} from 'system'
// default values for command line arguments
let url = 'http://localhost:5050'
// overrule the default values if set
for(var i = args.length - 1; i > 0; i--){
  var arg = args[i]
  if(arg.indexOf('url') === 0){
    url = arg.substring(arg.indexOf('url') + 4)
  }
}

export function openPage(conf){
  let {
    page,
    onReady,
    onError,
  } = conf

  page.open(url, function(status){
    if(status !== 'success'){
      onError('openPage')
    }else{
      page.render('./spec/screenshots/open-page.png')
      onReady(page)
    }
  })
}
