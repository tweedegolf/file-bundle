// get arguments from command line
import {args} from 'system'
import {waitFor} from './util'

/**
 * Opens a webpage in a phantomjs WebPage object. The url is read from the
 * command line or defaults to localhost port 5050
 *
 * @param      {Object}    conf     The configuration object
 * @property   {string}    id       The id of the task that executes this
 *                                  function
 * @property   {Object}    page     The phantomjs WebPage object
 * @property   {functon}   onReady  The function called after the folder's
 *                                  contents has been loaded
 * @property   {function}  onError  The function called if the onTest() function
 *                                  returns false or reaches the timeout.
 */
export default function openPage(conf){
  let {
    id,
    page,
    onReady,
    onError,
  } = conf

  // default values for command line arguments
  let url = 'http://localhost:5050'
  // overrule the default values if set
  args.forEach(arg => {
    if(arg.indexOf('url') === 0){
      url = arg.substring(arg.indexOf('url') + 4)
    }
  })

  page.open(url, function(status){
    if(status !== 'success'){
      onError({id, error: `cannot open page ${url}`})
      return
    }
    let data
    waitFor({
      onTest(){
        data = page.evaluate(function(){
          // wait until browser list has loaded
          let t = document.querySelector('tbody')
          if(t){
            return {
              class: t.className,
              title: document.title,
            }
          }
          return {
            class: '',
            title: ''
          }
        })
        //console.log(data)
        return data.class === 'loaded'
      },
      onReady(){
        page.render('./spec/screenshots/page-opened.png')
        onReady({id, title: data.title})
      },
      onError(error){
        onError({id, error})
      }
    })
  })
}
