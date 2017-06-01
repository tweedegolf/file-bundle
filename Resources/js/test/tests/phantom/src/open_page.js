// get arguments from command line
import { waitFor } from './util';
import config from './config';
// get arguments from command line
import { args } from 'system';

// default values for command line arguments
let url = 'http://localhost:5050';
// overrule the default values if set
args.forEach((arg) => {
    if (arg.indexOf('url') === 0) {
        url = arg.substring(arg.indexOf('url') + 4);
    }
});


/**
 * Opens a webpage in a phantomjs WebPage object. The url is read from the
 * command line or defaults to localhost port 5050
 *
 * @param      {Object}    conf     The configuration object
 * @property   {string}    id       The id of the task that executes this
 *                                  function
 * @property   {Object}    page     The phantomjs WebPage object
 * @property   {functon}   onReady  The function called after the folder's
 *                                  contents has been loaded
 * @property   {function}  onError  The function called if the onTest() function
 *                                  returns false or reaches the timeout.
 */
export function openPage(conf) {
    const {
        id,
        page,
        onReady,
        onError,
    } = conf;

    page.open(url, (status) => {
        if (status !== 'success') {
            onError({ id, error: `cannot open page ${url}` });
            return;
        }
        let data;
        waitFor({
            onTest() {
                data = page.evaluate(() => {
                    // wait until browser list has loaded
                    const t = document.querySelector('tbody');
                    if (t) {
                        return {
                            class: t.className,
                            title: document.title,
                        };
                    }
                    return {
                        class: '',
                        title: '',
                    };
                });
                return data.class === 'loaded';
            },
            onReady() {
                page.render(`${config.SCREENSHOTS_PATH}/page-opened.png`);
                onReady({ id, title: data.title });
            },
            onError(error) {
                onError({ id, error });
            },
        });
    });
}

/**
 * Shuts down the server; can be called after all phantomjs tests have run.
 *
 * @param      {Object}   conf     The configuration object
 * @property   {string}   id       The id of the task that executes this
 *                                 function
 * @property   {Object}   page     The phantomjs WebPage object
 * @property   {function}  onReady  The function called after the server has been
 *                                 shut down
 */
export function closeServer(conf) {
    const {
        id,
        page,
        onReady,
    } = conf;

    page.open(`${url}/close`, () => {
        onReady({ id, running: false });
    });
}
