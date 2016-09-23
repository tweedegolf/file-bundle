/**
 * Folder object:
 *
 * @typedef    {Object}    Folder
 * @param      {Number}    create_ts     Creation time stamp in Unix time
 * @param      {String}    created       Creation date in format: 'DD-MM-YYYY
 *                                       HH:mm'
 * @param      {Number}    file_count    Number of files in this folder
 * @param      {Number}    folder_count  Number of sub folders in this folder
 * @param      {Number}    id            Unique id of this folder: there is and
 *                                       will be no other file or folder that
 *                                       uses this id
 * @param      {String}    name          Folder name
 * @param      {Number}    parent        Parent folder id
 * @param      {String}    size          Size in human friendly format, e.g.
 *                                       54.1 kB
 * @param      {Number}    size_bytes    Size in bytes
 * @param      {String}    thumb         Remains a mystery, probably superfluous
 * @param      {String}    type          Always "folder"
 *
 *
 * File object:
 *
 * @typedef    {Object}    File
 * @param      {Number}    create_ts     Creation time stamp in Unix time
 * @param      {String}    created       Creation date in format: 'DD-MM-YYYY
 * @param      {Number}    id            Unique id of this folder: there is and
 *                                       will be no other file or folder that
 *                                       uses this id
 * @param      {String}    name          Name of the file
 * @param      {String}    original      Url of the original file, i.e. not the
 *                                       url of the thumbnail in case the file
 *                                       is an image
 * @param      {String}    thumb         Url of the thumbnail, only set if the
 *                                       file is an image
 * @param      {String}    type          Type of the file, any of: pdf, doc,
 *                                       docx, ppt, pptx, xls, xlsx
 *
 *
 */


import request from 'superagent'


/**
 * { function_description }
 *
 * @param      {string}    file_id    The file identifier
 * @param      {Function}  onSuccess  The on success
 * @param      {Function}  onError    The on error
 * @return     {<type>}    { description_of_the_return_value }
 */
const deleteFile = (file_id, onSuccess, onError) => {
  var req = request.post('/admin/file/delete/' + file_id)
  req.end((err, res) => {
    if (err) {
      onError([res.error.message, err.toString()])
    } else {
      onSuccess()
    }
  })
}


const paste = (file_ids, folder_id, onSuccess, onError) => {
  // if no folder_id is specified, the files will be pasted in their original folder -> this yields a React error!
  let url = '/admin/file/move' + (folder_id ? '/' + folder_id : '')
  var req = request.post(url).type('form')
  req.send({'files[]': file_ids})
  req.end((err, res) => {
    if (err) {
      onError([res.error.message, err.toString()])
    } else {
      onSuccess()
    }
  })
}


const addFolder = (name, folder_id, onSuccess, onError) => {
  // folder_id is null if a folder is to be added to the root folder
  let url = '/admin/file/create/folder' + (folder_id !== null ? '/' + folder_id : '')
  var req = request.post(url).type('form')
  req.send({name})
  req.end((err, res) => {
    if (err) {
      onError([res.error.message, err.toString()])
    } else {
      onSuccess(res.body.new_folders, res.body.errors)
    }
  })
}


const deleteFolder = (folder_id, onSuccess, onError) => {
  let url = '/admin/file/delete/folder/' + folder_id
  var req = request.post(url).type('form')
  req.end((err, res) => {
    if (err) {
      //console.log(err)
      onError([res.error.message, err.toString()])
    } else {
      onSuccess()
    }
  })
}


const upload = (file_list, folder_id, onSuccess, onError) => {
  let url = '/admin/file/upload' + (folder_id ? '/' + folder_id : '')
  var req = request.post(url)
  file_list.forEach(file => {
    req.attach(file.name, file)
  })
  req.end((err, res) => {
    if (err) {
      onError([res.error.message, err.toString()])
    } else {
      onSuccess(res.body.errors, res.body.uploads)
    }
  })
}


const openFolder = (folder_id, onSuccess, onError) => {
  let url = '/admin/file/list' + (folder_id ? '/' + folder_id : '')
  var req = request.get(url)
  req.end((err, res) => {
    if (err) {
      onError([res.error.message, err.toString()])
    } else {
      onSuccess(res.body.folders, res.body.files)
    }
  })
}


const delay = 500 // simulating network delay in milliseconds

export default {
  deleteFile(...args){
    setTimeout(() => {
      deleteFile(...args)
    }, delay)
  },
  paste(...args){
    setTimeout(() => {
      paste(...args)
    }, delay)
  },
  addFolder(...args){
    setTimeout(() => {
      addFolder(...args)
    }, delay)
  },
  deleteFolder(...args){
    setTimeout(() => {
      deleteFolder(...args)
    }, delay)
  },
  upload(...args){
    setTimeout(() => {
      upload(...args)
    }, delay)
  },
  openFolder(...args){
    setTimeout(() => {
      openFolder(...args)
    }, delay)
  },
}
