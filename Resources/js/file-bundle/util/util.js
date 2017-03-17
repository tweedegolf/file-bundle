/**
 * Executes an array of promises one after eachother, i.e.: the next promise
 * will be executed as soon as the former has resolved or rejected. Note that
 * this is unlike Promise.all(). Also in contrast with Promise.all(), a rejected
 * promise does not stop the following promises from being executed; all
 * promises will be executed and an array containing both resolve values and
 * reject errors will be returned.
 *
 * @param      {number}    index     The index of the promise that is currently
 *                                   being executed
 * @param      {Array}     promises  Array containing all promises
 * @param      {Function}  resolve   The resolve function that will be called
 *                                   after all promises have been executed
 * @param      {Function}  reject    The reject function that will be called
 *                                   after all promises have been executed, and
 *                                   all have rejected
 * @param      {Array}     values    Optional array that will be populated with
 *                                   the values that are returned from the
 *                                   resolve functions
 * @param      {Array}     errors    Optional array that holds the errors that
 *                                   are returned from the reject functions
 * @return     {Promise}   A promise, resolve returns an array of values and
 *                         errors, reject returns an array of errors
 */
export const chainPromises = function (index, promises, resolve, reject, values = [], errors = []) {
  // the id of the promise so we can keep them apart
    const id = promises[index].id;
  // the executor of the promise
    const func = promises[index].func;
  // arguments for the executor
    const args = promises[index].args;
  // optional function that parses the value that is passed by the resolve function
    let parseResolveValue = promises[index].parseResolveValue;
  // optional function that parses the value that is passed by the reject function
    let parseRejectValue = promises[index].parseRejectValue;

    if (typeof parseResolveValue === 'undefined') {
        parseResolveValue = value => ({ ...value, id });
    }

    if (typeof parseRejectValue === 'undefined') {
        parseRejectValue = error => ({ ...error, id });
    }

    const numPromises = promises.length;

    if (typeof func !== 'function') {
        errors.push({
            type: 'general',
            messages: ['not a function'],
        });
        index++;
        chainPromises(index, promises, resolve, reject, values, errors);
    }

    func(...args).then(
    (value) => {
        index++;
        values.push(parseResolveValue(value));
        if (index === numPromises) {
            resolve(values, errors);
        } else {
            chainPromises(index, promises, resolve, reject, values, errors);
        }
    },
    (error) => {
        index++;
        errors.push(parseRejectValue(error));
      // if all promises have rejected, we can reject the chained promise as a whole
        if (index === numPromises) {
            if (errors.length === numPromises) {
                reject(errors);
            }
        } else {
            chainPromises(index, promises, resolve, reject, values, errors);
        }
    },
  );
};

/**
 * Generic function that sorts items by a key
 *
 * @param      {Array}    array      Array containing the items to be sorted
 * @param      {String}   key        The key whose value will be sorted
 * @param      {boolean}  ascending  Whether to sort ascending or not
 */
export function sortBy(array, key, ascending) {
    array.sort((a, b) => {
        if (a[key] < b[key]) {
            return ascending ? 1 : -1;
        }
        if (a[key] > b[key]) {
            return ascending ? -1 : 1;
        }
        return 0;
    });
    return array;
}


let uid = 0;
/**
 * Returns an id that is unique whithin this application
 *
 * @return     {number}  The uid.
 */
export function getUID() {
    return `${uid++}${new Date()}`;
}

/**
 * Return a globally unique id
 */
export function getUUID() {
  // not needed yet
  // see: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
}


/**
 * Sorts items (files and/or folder) inside a folder -> currently not used!
 *
 * @param      {Object}   items      The items to be sorted.
 * @param      {string}   sort       The sorting type (creation time, file size,
 *                                   name, etc.)
 * @param      {boolean}  ascending  Whether to sort ascending or not
 *
 *
 * Param items might for instance look like:
 * <code>
 *  {
 *    files: [...],
 *    folders: [...]
 *  }
 * </code>
 */
export const sortItems = function (payload) {
    const {
    items,
    sort,
    ascending,
  } = payload;

    Object.entries(items).forEach(([key, value]) => {
        items[key] = sortBy(value, sort, ascending);
    });

    return items;
};

