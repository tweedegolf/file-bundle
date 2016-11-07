import {waitFor} from './util'


/**
 * Newly uploaded file appear at the top of the browser list so by testing if
 * the name of the first file in the list is equal to one of the files we have
 * just uploaded we know that the upload has successfully finished.
 */
function checkIfUploaded(conf){
  let {
    id,
    page,
    files,
    onReady,
    onError,
  } = conf

  let multiple = files.length > 1

  let data = ''
  waitFor({
    onTest(){
      data = page.evaluate(function(){
        let f = document.querySelectorAll('tr.cutable')[0]
        let name = ''
        if(f){
          name = f.querySelector('td.name').innerHTML
        }
        return {
          name,
          numFiles: document.querySelectorAll('tr.cutable').length
        }
      })
      //console.log(multiple, data.name)
      if(data.name === ''){
        return false
      }
      if(multiple === true){
        return files.some(file => {
          //console.log(file, data.name, file.indexOf(data.name))
          return file.indexOf(data.name) !== -1
        })
      }
      //console.log(files[0], files[0].indexOf(data.name))
      return files[0].indexOf(data.name) !== -1
    },
    onReady(){
      if(multiple === true){
        page.render('./spec/phantom/screenshots/multiple-files-uploaded.png')
      }else{
        page.render('./spec/phantom/screenshots/single-file-uploaded.png')
      }
      onReady({id, uploaded: true, multiple, ...data})
    },
    onError(error){
      onError({id, error})
    }
  })
}


export default function uploadFile(conf){
  let {
    id,
    page,
    files,
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
        let u = document.querySelectorAll('input[type=file]')
        if(typeof u === 'undefined' || u.length === 0){
          return false
        }
        return true
      })
      return loaded
    },
    onReady(){
      if(multiple === true){
        page.uploadFile('input[type=file]', files)
      }else{
        page.uploadFile('input[type=file]', files[0])
      }
      checkIfUploaded(conf)
    },
    onError(error){
      onError({id, error})
    }
  })
}
