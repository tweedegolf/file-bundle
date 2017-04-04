/**
 * @file       server REST API; updates and queries database
 *
 *
 */

/**
 * @name       FolderDescr
 * @type       {Object}
 * @param      {number}  create_ts     Creation time stamp in Unix time
 * @param      {string}  created       Creation date in format: 'DD-MM-YYYY
 *                                     HH:mm'
 * @param      {number}  file_count    Number of files in this folder
 * @param      {number}  folder_count  Number of sub folders in this folder
 * @param      {number}  id            Unique id of this folder: there is and
 *                                     will be no other file or folder that uses
 *                                     this id
 * @param      {string}  name          Folder name
 * @param      {number}  parent        Parent folder id
 * @param      {string}  size          Size in human friendly format, e.g. 54.1
 *                                     kB
 * @param      {number}  size_bytes    Size in bytes
 * @param      {string}  thumb         Remains a mystery, probably superfluous
 * @param      {string}  type          Always "folder"
 */

 /**
  * @name       FileDescr
  * @type       {Object}
  * @param      {number}  create_ts  Creation time stamp in Unix time
  * @param      {string}  created    Creation date in format: 'DD-MM-YYYY
  * @param      {number}  id         Unique id of this folder: there is and will
  *                                  be no other file or folder that uses this
  *                                  id
  * @param      {string}  name       Name of the file
  * @param      {string}  original   Url of the original file, i.e. not the url
  *                                  of the thumbnail in case the file is an
  *                                  image
  * @param      {string}  thumb      Url of the thumbnail, only set if the file
  *                                  is an image
  * @param      {string}  type       Type of the file, any of: pdf, doc, docx,
  *                                  ppt, pptx, xls, xlsx
  */

import request from 'superagent';


/**
 * In case we want to run the test suite using the dummy test server, we need to
 * change the server url. This is done by setting the node environment variable
 * PORT to any value other than 80 or 8080 (and above 1024). In the code below
 * we check whether this variable has been set and if so we adjust the server
 * url accordingly.
 *
 * @type       {string}
 */
let server = ''; // if no environment variable has been set, we don't need to specify a server url
const port = process.env.PORT;
// console.log(process.env.PORT)
if (typeof port !== 'undefined' && port !== 80 && port !== 8080) {
    server = `http://localhost:${port}`;
}


/**
 * Deletes a file
 *
 * @param      {string}    file_id    The id of the file that will be deleted
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const deleteFile = (file_id, onSuccess, onError) => {
    const req = request.post(`/admin/file/delete/${file_id}`);
    req.end((err, res) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess();
        }
    });
};

/**
 * Moves a file to another folder
 *
 * @param      {string}    file_ids   The ids of the files that will be moved
 * @param      {?number}   folder_id  The id of the folder where the files will
 *                                    be moved to
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const paste = (file_ids, folder_id, onSuccess, onError) => {
    // if no folder_id is specified, the files will be pasted in their original folder -> this yields a React error!
    // console.log('[API]', file_ids, folder_id);
    const url = `${server}/admin/file/move${folder_id ? `/${folder_id}` : ''}`;
    const req = request.post(url).type('form');
    req.send({ 'files[]': file_ids });
    req.end((err, res) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess();
        }
    });
};

/**
 * Adds a new folder to the current folder
 *
 * @param      {string}    name       The name of the new folder
 * @param      {?number}   folder_id  The id of the current folder, i.e. the
 *                                    parent folder of the new folder
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const addFolder = (name, folder_id, onSuccess, onError) => {
    const url = `${server}/admin/file/create/folder${folder_id !== null ? `/${folder_id}` : ''}`;
    const req = request.post(url).type('form');
    req.send({ name });
    req.end((err, res) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.new_folders, res.body.errors);
        }
    });
};

/**
 * Delete a folder, folder has to be emptied first
 *
 * @param      {?number}   folder_id  The id of the folder that will be deleted
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const deleteFolder = (folder_id, onSuccess, onError) => {
    const url = `${server}/admin/file/delete/folder/${folder_id}`;
    const req = request.post(url).type('form');
    req.end((err, res) => {
        if (err) {
      // console.log(err)
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess();
        }
    });
};

/**
 * Upload new files to folder
 *
 * @param      {Array}     file_list  The FileList converted to an Array,
 *                                    contains all files that will be uploaded
 * @param      {?number}   folder_id  The id of the current folder, i.e. the
 *                                    folder that will contain the newly
 *                                    uploaded files
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const upload = (file_list, folder_id, onSuccess, onError) => {
    const url = `${server}/admin/file/upload${folder_id ? `/${folder_id}` : ''}`;
    const req = request.post(url);
    file_list.forEach((file) => {
    // console.log(file)
        req.attach(file.name, file);
    });
    req.end((err, res) => {
        if (err) {
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.errors, res.body.uploads);
        }
    });
};


/**
 * Loads the contents of a folder
 *
 * @param      {?number}   folder_id  The id of the folder
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
const openFolder = (folderId, onSuccess, onError) => {
    const url = `${server}/admin/file/list/${folderId}`;
  // let url = '/admin/file/list/999'
    const req = request.get(url);
    req.end((err, res) => {
        if (err) {
      // console.log(err, res)
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.folders, res.body.files);
        }
    });
};

export const openRootFolder = (folderId, onSuccess, onError) => {
    const url = `${server}/admin/file/root/${folderId}`;
  // let url = '/admin/file/list/999'
    const req = request.get(url);
    req.end((err, res) => {
        if (err) {
      // console.log(err, res)
            onError([res.text, res.error.message, err.toString()]);
        } else {
            onSuccess(res.body.folders, res.body.files);
        }
    });
};


/**
 * Every api method is called from a setTimeout function; this way we can
 * simulate network delay to test for instance loading animations. Apart from
 * setting an overall value for the delay, you can also set individual values
 * per api method. Delay values are in milliseconds.
 *
 * @type       {number}
 */
const delay = 0;

export default {
/**
 * Deletes a file
 *
 * @param      {string}    file_id    The id of the file that will be deleted
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
    deleteFile(...args) {
        setTimeout(() => {
            deleteFile(...args);
        }, delay);
    },
/**
 * Moves a file to another folder
 *
 * @param      {string}    file_ids   The ids of the files that will be moved
 * @param      {?number}   folder_id  The id of the folder where the files will
 *                                    be moved to
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
    paste(...args) {
        setTimeout(() => {
            paste(...args);
        }, delay);
    },
/**
 * Adds a new folder to the current folder
 *
 * @param      {string}    name       The name of the new folder
 * @param      {?number}   folder_id  The id of the current folder, i.e. the
 *                                    parent folder of the new folder
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
    addFolder(...args) {
        setTimeout(() => {
            addFolder(...args);
        }, delay);
    },
/**
 * Delete a folder, folder has to be emptied first
 *
 * @param      {?number}   folder_id  The id of the folder that will be deleted
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
    deleteFolder(...args) {
        setTimeout(() => {
            deleteFolder(...args);
        }, delay);
    },
/**
 * Upload new files to folder
 *
 * @param      {Array}     file_list  The FileList converted to an Array,
 *                                    contains all files that will be uploaded
 * @param      {?number}   folder_id  The id of the current folder, i.e. the
 *                                    folder that will contain the newly
 *                                    uploaded files
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
    upload(...args) {
        setTimeout(() => {
            upload(...args);
        }, delay);
    },
/**
 * Loads the contents of a folder
 *
 * @param      {?number}   folder_id  The id of the folder
 * @param      {Function}  onSuccess  Success handler
 * @param      {Function}  onError    Error handler
 * @return     {void}      Calls success or error callback
 */
    openFolder(...args) {
        setTimeout(() => {
            openFolder(...args);
        }, delay);
    },
};
