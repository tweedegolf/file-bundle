const phantom = global.phantom;

/**
 * Function that repeatedly runs a test function until it returns true or
 * times out
 *
 * @param      {Object}  conf    Configuration object
 * @param      {function}  conf.onTest      The test function (mandatory)
 * @param      {function}  conf.onCheck     Callback function that is called every
 *                                          time the test function runs
 * @param      {function}  conf.onReady     Function called as soon as the test
 *                                          function returns true
 * @param      {function}  conf.onError     Called when the waitFor function times
 *                                          out
 * @param      {Object}    conf.onTestArgs  Object that will be passed as argument
 *                                          to the onTest function
 * @param      {number}    conf.timeout     Milliseconds before a timeout occurs
 * @param      {number}    conf.delay       Amount of milliseconds between 2
 *                                          consecutive test function calls (higher
 *                                          numbers result in less overhead time)
 */
export function waitFor(conf) {
    const {
    timeout = 10000,
    delay = 50,
    onTest,
    onTestArgs = {},
    onCheck = () => {},
    onReady = () => {},
    onError = null,
  } = conf;

    const start = new Date().getTime();
    let condition = false;

    const interval = setInterval(() => {
        const elapsed = new Date().getTime() - start;
    // console.log(elapsed)
        if (elapsed < timeout && condition === false) {
            onCheck();
            condition = onTest(onTestArgs);
        } else if (condition === false && elapsed < timeout) {
            if (typeof onError === 'function') {
                onError('test returned false');
            } else {
                console.log(false);
                phantom.exit(1);
            }
        } else if (elapsed > timeout) {
            if (typeof onError === 'function') {
                onError(`test timeout (${elapsed})`);
            } else {
                console.log(false);
                phantom.exit(1);
            }
        } else {
            onReady();
            clearInterval(interval);
        }
    }, delay);
}


/**
 * Executes an array of promises one after eachother, i.e.: the next promise
 * will be executed as soon as the former has resolved or rejected. Note that
 * this is unlike Promise.all(). Also in contrast with Promise.all(), a rejected
 * promise does not stop the following promises from being executed; all
 * promises will be executed and an array containing both resolve values and
 * reject errors will be returned.
 *
 * @param      {Object}   conf    Object containing data to run the promises
 * @param      {number}    conf.index     The index of the promise that is
 *                                        currently being executed
 * @param      {Array}     conf.promises  Array containing all promises
 * @param      {Function}  conf.resolve   The resolve function that will be called
 *                                        after all promises have been executed
 * @param      {Function}  conf.reject    The reject function that will be called
 *                                        after all promises have been executed,
 *                                        and all have rejected
 * @param      {Array}     conf.values    Optional array that will be populated
 *                                        with the values that are returned from
 *                                        the resolve functions
 * @param      {Array}     conf.errors    Optional array that holds the errors that
 *                                        are returned from the reject functions
 * @return     {Promise}  A promise, resolve returns an array of values and
 *                        errors, reject returns an array of errors
 */
export const chainPromises = function (conf) {
    let {
    index = 0,
    promises = [],
    resolve = () => {},
    reject = () => {},
    values = [],
    errors = [],
  } = conf;

    let {
    id, // the id of the promise so we can keep them apart
    func, // the executor of the promise
    args = [], // optional arguments for the executor
    parseRejectValue, // optional function that parses the value that is passed by the reject function
    parseResolveValue, // optional function that parses the value that is passed by the resolve function
  } = promises[index];

  // console.log(id, func)

    if (typeof parseResolveValue === 'undefined') {
        parseResolveValue = value => ({ value, id });
    }

    if (typeof parseRejectValue === 'undefined') {
        parseRejectValue = error => ({ error, id });
    }

    const numPromises = promises.length;

    if (typeof func !== 'function') {
        errors.push({
            type: 'general',
            messages: ['not a function'],
        });
        index++;
        chainPromises({ index, promises, resolve, reject, values, errors });
    }

    func(...args).then(
    (value) => {
        index++;
      // console.log('resolve:', numPromises, index)
        values.push(parseResolveValue(value, id));
        if (index === numPromises) {
            resolve(values, errors);
        } else {
            chainPromises({ index, promises, resolve, reject, values, errors });
        }
    },
    (error) => {
        index++;
      // console.log('reject:', numPromises, index)
        errors.push(parseRejectValue(error, id));
      // if all promises have rejected, we can reject the chained promise as a whole
        if (index === numPromises) {
            if (errors.length === numPromises) {
                reject(errors);
            }
        } else {
            chainPromises({ index, promises, resolve, reject, values, errors });
        }
    },
  );
};
