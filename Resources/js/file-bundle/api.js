import _ from 'lodash';
import request from 'superagent';
//import cache from './cache';


const deleteFile = (file_id, onSuccess, onError) => {
  var req = request.post('/admin/file/delete/' + file_id);
  req.end((err, res) => {
    if (err) {
      onError(err.toString());
    // } else if(res.body.error){
    //   onError(res.body.error);
    } else {
      //cache.removeFiles([file_id]);
      onSuccess();
    }
  });
}


const paste = (file_ids, folder_id, onSuccess, onError) => {
  let url = '/admin/file/move' + (folder_id ? '/' + folder_id : '');
  var req = request.post(url).type('form');
  req.send({'files[]': file_ids});
  req.end((err, res) => {
    if (err) {
      onError(err);
    } else {
      //let files = _.map(res.body.files, (file) => {
      //  file.new = true;
      //  return file;
      //});
      //cache.removeFiles(file_ids);
      //cache.storeFiles(files, folder_id);
      onSuccess();
    }
  });
}


const addFolder = (name, folder_id, onSuccess, onError) => {
  let url = '/admin/file/create/folder' + (folder_id ? '/' + folder_id : '');
  var req = request.post(url).type('form');
  req.send({name: name});
  req.end((err, res) => {
    if (err) {
      onError(err);
    } else {
      let folders = _.map(res.body.new_folders, (folder) => {
        folder.new = true;
        return folder;
      });
      let errors = [];
      if (res.body.errors.length > 0) {
        errors = [{
          messages: res.body.errors,
          type: 'folder'
        }];
      }
      //cache.storeFolders(folders, folder_id);
      onSuccess(folders, errors);
    }
  });
}


const deleteFolder = (folder_id, onSuccess, onError) => {
  let url = '/admin/file/delete/folder/' + folder_id;
  var req = request.post(url).type('form');
  req.end((err, res) => {
    if (err) {
      onError();
    } else {
      //cache.removeFolders([folder_id]);
      onSuccess();
    }
  });
}


const upload = (file_list, folder_id, onSuccess, onError) => {
  let url = '/admin/file/upload' + (folder_id ? '/' + folder_id : '');
  var req = request.post(url);
  _(file_list).forEach((file) => {
    req.attach(file.name, file);
  });
  req.end((err, res) => {
    if (err) {
      //console.log('Error', err)
      //console.log('Response', res)
      //onError(err);
      onError(res.error.message);
    } else {
      let files = _.map(res.body.uploads, (file) => {
        file.new = true;
        return file;
      });
      //console.log(res.body.errors)
      let errors = _.map(res.body.errors, (messages, file) => ({
        type: 'upload',
        file: file,
        messages: messages
      }));
      //cache.storeFiles(files, folder_id);
      //console.log(errors)
      onSuccess(errors, files, folder_id);
    }
  });
}


const openFolder = (folder_id, onSuccess, onError) => {
  let url = '/admin/file/list' + (folder_id ? '/' + folder_id : '');
  var req = request.get(url);
  req.end((err, res) => {
    if (err) {
      onError(err);
      //cache.storeFolder(folder_id, [], []);
    } else {
      onSuccess(res.body.folders, res.body.files)
      //cache.storeFolder(folder_id, res.body.folders, res.body.files);
    }
  });


/*
  cache.loadFolder(folder_id, () => {
    // no cache hit
    let url = '/admin/file/list' + (folder_id ? '/' + folder_id : '');
    var req = request.get(url);
    req.end((err, res) => {
      if (err) {
        onError(err);
        cache.storeFolder(folder_id, [], []);
      } else {
        cache.storeFolder(folder_id, res.body.folders, res.body.files);
      }
    });
  }, (folders, files) => {
    // cache hit
    onSuccess();
  });
*/
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
