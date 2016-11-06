import {waitFor} from './util'

/**
 * By cliking on the folder the application will request the folder contents
 * from the server. This may take a while. In the waitFor function we test
 * whether the contents of the new folder has been loaded or not. We do this by
 * testing the name of the folder against the name of first row in the browser
 * list: as long as these names are the same, the new folder contents has not
 * been loaded yet.
 *
 * @param      {Object}    conf        Configuration object
 * @property   {Object}    page        The phantomjs WebPage object
 * @property   {string}    folderName  The folder name
 * @property   {functon}   onReady     The function called after the folder's
 *                                     contents has been loaded
 * @property   {function}  onError     The function called if the onTest()
 *                                     function returns false or reaches the
 *                                     timeout.
 */
export function readFolder(conf){
  let {
    id,
    page,
    folderName,
    onReady,
    onError
  } = conf

  var data
  waitFor({
    onTest(){
      data = page.evaluate(function(){
        //@TODO: check for spinner instead of foldername to determine whether the contents has been loaded or not!
        var e = document.querySelector('tr.folder > td.name')
        if(e === null){
          return {
            name: ''
          }
        }
        return {
          name: e.innerHTML,
          numFiles: document.querySelectorAll('tr.cutable').length,
          numFolders: document.querySelectorAll('tr.folder').length
        }
      })
      return data.name !== folderName
    },
    onReady(){
      page.render('./spec/screenshots/folder-' + folderName + '-opened.png')
      onReady({...data, id, name: folderName})
    },
    onError(error){
      onError({id, error})
    }
  })
}
