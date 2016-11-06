import {waitFor} from './util'

/**
 * Opens a folder by clicking in the row that represents the folder in the
 * browser list; its content needs to be loaded from the server and because this
 * may take a while, we test if the contents has been loaded by checking for a
 * <tr> with css class folder.
 *
 * @param      {Object}    conf     Configuration object
 * @property   {string}    id       The id of the task that executes this
 *                                  function
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
    index,
    name,
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
          b.click()
        }
        return {
          name: n,
          rect: r
        }
      }, index)
      return data.name !== ''
    },
    onReady(){
      //page.sendEvent('click', data.rect.left + data.rect.width / 2, data.rect.top + data.rect.height / 2)
      onReady({id, name: data.name})
    },
    onError(error){
      onError({id, error})
    }
  })
}
