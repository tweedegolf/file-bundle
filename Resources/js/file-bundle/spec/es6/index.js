import 'babel-polyfill'
import {openPage} from './open_page'

// put eslint at ease
const phantom = global.phantom

let page

openPage()
.then(data => {
  page = data.page
  let result = page.evaluate(() => {
    return true
  })
  page.render('./spec/screenshots/shot-es6.png')
  console.log('done')
  phantom.exit(0)
})
