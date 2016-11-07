import {waitFor} from './util'

/**
 * By clicking on the folder the application will request the folder contents
 * from the server. This may take a while. In the waitFor function we test
 * whether the contents of the new folder has been loaded or not. We do this by
 * testing if the name of the opened folder is still listed in the browser list;
 * once it is not listed anymore we know that the folder's contents has been
 * loaded.
 *
 * @param      {Object}    conf     Configuration object
 * @property   {string}    id       The id of the task that executes this
 *                                  function
 * @property   {Object}    page     The phantomjs WebPage object
 * @property   {string}    name     The name of the folder whose contents needs
 *                                  to be read
 * @property   {functon}   onReady  The function called after the folder's
 *                                  contents has been loaded
 * @property   {function}  onError  The function called if the onTest() function
 *                                  returns false or reaches the timeout.
 */
export function checkIfLoaded(conf){
  let {
    id,
    page,
    name,
    onReady,
    onError
  } = conf

  let data

  waitFor({
    onTest(){
      data = page.evaluate(function(folderName){
        let folderNames = document.querySelectorAll('tr.folder > td.name')
        if(typeof folderNames === 'undefined'){
          return {loaded: false}
        }
        let loaded = true
        //let names = []
        Array.from(folderNames).forEach(n => {
          //names.push(n.innerHTML)
          if(n.innerHTML === folderName){
            loaded = false
          }
        })
        return {
          loaded,
          //folderNames: names,
          numFiles: document.querySelectorAll('tr.cutable').length,
          numFolders: document.querySelectorAll('tr.folder').length
        }
      }, name)
      return data.loaded
    },
    onReady(){
      page.render('./spec/screenshots/folder-' + name + '-opened.png')
      onReady({id, name, ...data})
    },
    onError(error){
      onError({id, error})
    }
  })
}


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
export default function openFolder(conf){
  let {
    id,
    page,
    index,
    name,
    onError,
  } = conf

  let data
  waitFor({
    onTest(){
      data = page.evaluate(function(i){
        // get the table row representing the folder
        let b = document.querySelectorAll('tr.folder')[i]
        let n = '', r
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
      checkIfLoaded({...conf, ...data})
    },
    onError(error){
      onError({id, error})
    }
  })
}
