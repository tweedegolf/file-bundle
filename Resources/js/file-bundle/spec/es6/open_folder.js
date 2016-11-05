import {waitFor} from './util'

/**
 * Opens a folder; its content needs to be loaded from the server and because
 * this may take a while, we test if the contents has been loaded by checking
 * for a <tr> with css class folder.
 */
export function openFolder(conf){
  let {
    page,
    onReady,
    onError,
  } = conf

  var data
  waitFor({
    onTest(){
      data = page.evaluate(function(){
        var b = document.querySelectorAll('tr.folder')[0]
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
      })
      return data.name !== ''
    },
    onReady(){
      page.render('./spec/screenshots/page-opened.png')
      // We want to make a screenshot of the opened root folder which means that
      // we can not use the HTMLElement.click() function inside the
      // page.evaluate handler because if we do we are making a screenshot after
      // we have clicked on the 'colors' folder. What we will actually see in
      // the screenshot then depends on the response time of the server.
      // Therefor we use the page.sendEvent() function to send a click event to
      // the center of the folder row *after* we have taken the screenshot.
      page.sendEvent('click', data.rect.left + data.rect.width / 2, data.rect.top + data.rect.height / 2)
      onReady(data.name)
    },
    onError(){
      onError('openFolder')
    }
  })
}
