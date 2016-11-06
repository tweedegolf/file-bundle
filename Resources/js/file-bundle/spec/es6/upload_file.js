import {waitFor} from './util'


export function uploadFile(conf){
  let {
    id,
    page,
    files,
    onReady,
    onError,
  } = conf

  let multiple = files.length > 1

  /**
   * We can't start uploading file until the page has fully loaded. Therefor we
   * test if we can find an input[type=file] in the page.
   */
  waitFor({
    onTest(){
      let loaded = page.evaluate(function(){
        return document.querySelectorAll('input[type=file]')[0]
      })
      return loaded !== null
    },
    onReady(){
      if(multiple === true){
        page.uploadFile('input[type=file]', files)
      }else{
        page.uploadFile('input[type=file]', files[0])
      }
      var result = page.evaluate(function(){
        return document.querySelectorAll('input[type=file]')[0]
      })
      console.log(multiple, files)
      onReady({id})
    },
    onError(error){
      onError({id, error})
    }
  })
}


/**
 * Newly uploaded file appear at the top of the browser list so by testing if
 * the name of the first file in the list is equal to one of the files we have
 * just uploaded we know that the upload has successfully finished.
 */
export function checkIfUploaded(conf){
  let {
    id,
    page,
    files,
    onReady,
    onError,
  } = conf

  let multiple = files.length > 1

  var data = ''
  waitFor({
    onTest(){
      data = page.evaluate(function(){
        var f = document.querySelectorAll('tr.cutable')[0]
        var name = ''
        if(f){
          name = f.querySelector('td.name').innerHTML
        }
        return {
          name,
          numFiles: document.querySelectorAll('tr.cutable').length
        }
      })
      //console.log(multiple, data.name)
      if(multiple === true){
        files.some(file => {
          return file.indexOf(data.name) !== -1
        })
      }
      return files[0].indexOf(data.name) !== -1
    },
    onReady(){
      if(multiple === true){
        page.render('./spec/screenshots/multiple-files-uploaded.png')
      }else{
        page.render('./spec/screenshots/single-file-uploaded.png')
      }
      onReady({uploaded: true, ...data, id, multiple})
    },
    onError(error){
      onError({id, error})
    }
  })
}

