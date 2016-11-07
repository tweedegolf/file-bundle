import {waitFor} from './util'
import config from './config'


function check(conf){
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
      //console.log(data.class)
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


function submit(conf){
  let {
    id,
    page,
    onError,
  } = conf

  waitFor({
    onTest(){
      let data = page.evaluate(function(){
        // get the "submit" button
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
      //console.log('submit', data.ready)
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


function typeName(conf){
  let {
    id,
    page,
    name,
    onError,
    onReady,
  } = conf

  waitFor({
    onTest(){
      let data = page.evaluate(function(n){
        // get the input field
        let input = document.querySelector('input[placeholder=Mapnaam]')
        if(input !== null){
          input.value = n
          return {
            ready: true,
            //value: input.value,
            //placeholder: input.placeholder,
          }
        }
        return {
          ready: false
        }
      }, name)
      //console.log(name, data.value, data.placeholder)
      return data.ready
    },
    onReady(){
      page.render(`${config.SCREENSHOTS_PATH}/new-folder-input-name.png`)
      //onReady(conf)
      submit(conf)
    },
    onError(error){
      onError({id, error})
    }
  })
}

export default function createFolder(conf){
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
