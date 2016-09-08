import request from 'superagent'


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
