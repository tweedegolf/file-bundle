import filesize from 'filesize';

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
];

export const addLeadingZeros = function (value) {
    if (value < 10) {
        return `0${value}`;
    }
    return `${value}`;
};

export const formatDate = function (millis, format = 'dMy') {
    const d = new Date(millis);
    const year = d.getFullYear();
    const month = d.getMonth();
    const date = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();

    switch (format) {
    case 'dMy':
        return `${date} ${months[month]} ${year}`;

    case 'd-m-y':
        return `${date}-${month + 1}-${year}`;

    case 'y-mm-dd':
        return `${year}-${addLeadingZeros(month + 1)}-${addLeadingZeros(date)}`;

    case 'dd-mm-yyyy hh:mm':
        return `${addLeadingZeros(date)}-${addLeadingZeros(month + 1)}-${year} ${addLeadingZeros(hours)}:${addLeadingZeros(minutes)}`;

    default:
        return `${date} ${months[month]} ${year}`;
    }
};


/**
 * Function that calls a cleanup function after the node process shuts down or
 * crashes.
 *
 * All credits:
 * http://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
 *
 * @param      {Function}  callback  The custom function that performs the
 *                                   cleans up
 */
export function cleanup(callback) {
  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
    callback = callback || (() => {});
    process.on('cleanup', callback);

  // do app specific cleaning before exiting
    process.on('exit', () => {
        process.emit('cleanup');
    });

  // catch ctrl+c event and exit normally
    process.on('SIGINT', () => {
        console.log('Ctrl-C...');
        process.exit(2);
    });

  // catch uncaught exceptions, trace, then exit normally
    process.on('uncaughtException', (e) => {
        console.log('Uncaught Exception...');
        console.log(e.stack);
        process.exit(99);
    });
}


/**
 * Gets the id from a url; this can be a folder id or a file id. If no id was
 * added to the url we assume the id to be 'null', which is the top root folder.
 *
 * @param      {string}  url     The url to be parsed
 */
export function getIdFromUrl(url) {
    let id = url.substring(url.lastIndexOf('/') + 1);

    if (isNaN(id) || id === '') {
        id = null;
    } else {
        id = parseInt(id, 10);
    }
    return id;
}


let fileId = 100;
/**
 * Creates a file description object
 *
 * @param      {Object}  data    The data needed to create the description.
 *
 * @return     {Object}  The file description object
 */
export function createFileDescription(data) {
    const {
    name,
    size_bytes,
    mimetype,
    uniqueName,
  } = data;

    const create_ts = new Date().getTime();

    const file = {
        create_ts,
        created: formatDate(create_ts, 'dd-mm-yyyy hh:mm'),
        id: fileId++,
        name,
        original: `/media/${uniqueName}`,
        thumb: `/media/thumb/${uniqueName}`,
        type: mimetype.replace('image/', ''),
        size: filesize(size_bytes, { base: 10 }),
        size_bytes,
    };

    return file;
}


let folderId = 100;
/**
 * Creates a folder description object
 *
 * @param      {Object}  data    The data needed to create the description.
 *
 * @return     {Object}  The folder description object
 */
export function createFolderDescription(data) {
    const {
    name,
    parent,
    file_count,
    folder_count,
  } = data;

    const create_ts = new Date().getTime();

    const file = {
        create_ts,
        created: formatDate(create_ts, 'dd-mm-yyyy hh:mm'),
        id: folderId++,
        name,
        file_count,
        folder_count,
        parent,
        thumb: null,
        size: '',
        size_bytes: 0,
        type: 'folder',
    };

    return file;
}

