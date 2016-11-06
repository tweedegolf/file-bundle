import {waitFor} from './util'

/**
 * Opens a folder; its content needs to be loaded from the server and because
 * this may take a while, we test if the contents has been loaded by checking
 * for a <tr> with css class folder.
 *
 * @param      {Object}    conf     Configuration object
 * @property   {Object}    page     The phantomjs WebPage object
 * @property   {number}    index    The index in the list of the folder to be
 *                                  opened
 * @property   {string}    name     The name of the folder to be opened (not
 *                                  implemented yet)
 * @property   {functon}   onReady  The function called after the folder's
 *                                  contents has been loaded
 * @property   {function}  onError  The function called if the onTest() function
 *                                  returns false or reaches the timeout.
 */
export function openFolder(conf){
  let {
    id,
    page,
    index = 0,
//    name,
    onReady,
    onError,
  } = conf

  var data
  waitFor({
    onTest(){
      data = page.evaluate(function(i){
        // get the table row representing the folder
        var b = document.querySelectorAll('tr.folder')[i]
        var n = '', r
        if(b){
          n = b.querySelector('td.name').innerHTML
          r = b.getBoundingClientRect()
          //b.click() // => we can't use this here, see comment below
        }
        return {
          name: n,
          rect: r
        }
      }, index)
      return data.name !== ''
    },
    onReady(){
      page.render('./spec/screenshots/page-opened.png')
      // We want to make a screenshot of the opened folder which means that we
      // can not use the HTMLElement.click() function inside the page.evaluate
      // handler because if we do we are making a screenshot after we have
      // clicked on the folder row. What we will actually see in the screenshot
      // then depends on the response time of the server. Therefor we use the
      // page.sendEvent() function to send a click event to the center of the
      // folder row *after* we have taken the screenshot.
      page.sendEvent('click', data.rect.left + data.rect.width / 2, data.rect.top + data.rect.height / 2)
      onReady({id, name})
    },
    onError(error){
      onError({id, error})
    }
  })
}
