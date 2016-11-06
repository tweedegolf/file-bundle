import {waitFor} from './util'

/**
 * By cliking on the folder the application will request the folder contents
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
export function readFolder(conf){
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
      onReady({...data, id, name})
    },
    onError(error){
      onError({id, error})
    }
  })
}
