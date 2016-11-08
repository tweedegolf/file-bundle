/**
 * Setup jasmine instance with es6
 *
 * some credits: https://gist.github.com/mauvm/172878a9646095d03fd7
 */

import 'babel-polyfill'
import Jasmine from 'jasmine'

let instance = null
function getJasmine(){
  if(instance === null){
    instance = new Jasmine()
    //console.log(instance)

    // override the default timeout of 5 seconds
    instance.jasmine.getEnv().defaultTimeoutInterval = 30000
    instance.jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

    instance.loadConfigFile('./test/tests/jasmine.json')
  }
  return instance
}

export default getJasmine()


// start the suite
getJasmine().execute()
