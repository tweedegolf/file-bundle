import {waitFor} from './util'
import config from './config'

// declare functions
let createFolder // main function
let typeName // type the name of the folder in the input field
let submit // press the "create folder" button
let check // check if the the new folder has been created succesfully


/**
 * Creates a new folder in the currently opened folder.
 *
 * @param      {Object}    conf     The configuration object
 * @property   {string}    id       The id of the task that executes this
 *                                  function
 * @property   {Object}    page     The phantomjs WebPage object
 * @property   {string}    name     The name of the to be created folder
 * @property   {functon}   onReady  The function called after the folder's
 *                                  contents has been loaded
 * @property   {function}  onError  The function called if the onTest() function
 *                                  returns false or reaches the timeout.
 */
createFolder = function(conf){
  let {
    id,
    page,
    onError,
  } = conf

  waitFor({
    onTest(){
      let data = page.evaluate(function(){
        // get the "create folder" button
        let s = document.querySelectorAll('button[type=button] > span.text-label')
        let buttons = []
        let clicked = false
        // find the "create folder" button by reading the labels on the buttons,
        // when found click on it
        if(s){
          Array.from(s).forEach(span => {
            buttons.push(span.innerHTML)
            if(span.innerHTML === 'Nieuwe map'){
              span.parentNode.click()
              clicked = true
            }
          })
          return {
            ready: clicked,
            buttons,
          }
        }
        return {
          ready: false,
          buttons: [],
        }
      })
      // data.buttons.forEach(button => {
      //   console.log(button)
      // })
      return data.ready
    },
    onReady(){
      page.render(`${config.SCREENSHOTS_PATH}/new-folder-open-dialog.png`)
      typeName(conf)
    },
    onError(error){
      onError({id, error})
    }
  })
}


/**
 * Find the input field and type in the name of the new folder
 *
 * @param      {Object}  conf    The configuration object, this is the same
 *                               object is that is passed for argument to the
 *                               createFolder() function.
 */
typeName = function(conf){
  let {
    id,
    page,
    name,
    onError,
  } = conf

  waitFor({
    onTest(){
      let data = page.evaluate(function(n){
        let input = document.querySelector('input[placeholder=Mapnaam]')
        if(input !== null){
          input.value = n
          return {
            ready: true,
          }
        }
        return {
          ready: false
        }
      }, name)
      return data.ready
    },
    onReady(){
      page.render(`${config.SCREENSHOTS_PATH}/new-folder-input-name.png`)
      submit(conf)
    },
    onError(error){
      onError({id, error})
    }
  })
}


/**
 * Find the "save" button and click on it
 *
 * @param      {Object}  conf    The configuration object, this is the same
 *                               object is that is passed for argument to the
 *                               createFolder() function.
 */
submit = function(conf){
  let {
    id,
    page,
    onError,
  } = conf

  waitFor({
    onTest(){
      let data = page.evaluate(function(){
        let s = document.querySelectorAll('button[type=button] > span.text-label')
        let clicked = false
        if(s){
          Array.from(s).forEach(span => {
            if(span.innerHTML === 'Opslaan'){
              span.parentNode.click()
              clicked = true
            }
          })
          return {
            ready: clicked
          }
        }
        return {
          ready: false
        }
      })
      return data.ready
    },
    onReady(){
      page.render(`${config.SCREENSHOTS_PATH}/new-folder-submit.png`)
      check(conf)
    },
    onError(error){
      onError({id, error})
    }
  })
}

/**
 * Check if the both the form and the spinner animation are hidden and then get
 * the number of folders in the parent folder so we can test whether the folder
 * has been created successfully or not.
 *
 * @param      {Object}  conf    The configuration object, this is the same
 *                               object is that is passed for argument to the
 *                               createFolder() function.
 */
check = function(conf){
  let {
    id,
    page,
    onError,
    onReady,
  } = conf

  let data
  waitFor({
    onTest(){
      data = page.evaluate(function(){
        let form = document.querySelector('div.form-inline.pull-right')
        let s = document.querySelector('button[type=button] > span.fa.fa-circle-o-notch.fa-spin')
        if(form !== null && s === null){
          return {
            class: form.className,
            ready: form.className.indexOf('hide') !== -1,
            numFolders: document.querySelectorAll('tr.folder').length
          }
        }
        return {
          class: '',
          ready: false
        }
      })
      return data.ready
    },
    onReady(){
      page.render(`${config.SCREENSHOTS_PATH}/new-folder-check.png`)
      onReady({
        id,
        numFolders: data.numFolders
      })
    },
    onError(error){
      onError({id, error})
    }
  })
}


export default createFolder
