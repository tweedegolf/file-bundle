/**
 * Setup jasmine instance with es6
 *
 * some credits: https://gist.github.com/mauvm/172878a9646095d03fd7
 */
import 'babel-polyfill';
import path from 'path';
import Jasmine from 'jasmine';

// const configFile = path.join(__dirname, '../../../../', 'jasmine.json');
const configFile = path.join(__dirname, 'jasmine.json');
// const configFile = path.join(__dirname, 'jasmine2.json');
const instance = new Jasmine();
// override the default timeout of 5 seconds
instance.jasmine.getEnv().defaultTimeoutInterval = 30000;
instance.jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
instance.loadConfigFile(configFile);
// instance.completionReporter.jasmineDone = () => {
//   console.log('exit')
//   process.exit()
// }

export default instance;

// start the suite
instance.execute();
