/**
 * Ties together all API calls and exports them as an object. For documentation
 * of every individual method see ./api/index.js
 */
import database from '../database'
import {getIdFromUrl} from '../util'
import {uploadFiles} from './upload_files'

const getFolder = (req, res) => {
  let parentId = getIdFromUrl(req.url)
  console.log(`[API] getting contents of folder ${parentId}`)

  let data = database.getFolder(parentId)
  if(typeof data.error !== 'undefined'){
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send(data.error)
  }else {
    res.setHeader('Content-Type', 'application/json')
    res.send(data)
  }
}

const addFolder = (req, res) => {
  let parentId = getIdFromUrl(req.url)
  console.log(`[API] adding new folder "${req.body.name}" in folder ${parentId}`)

  let data = database.addFolder(req.body.name, parentId)
  if(typeof data.error !== 'undefined'){
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send(data.error)
  }else{
    res.setHeader('Content-Type', 'application/json')
    res.send(data)
  }
}


const deleteFolder = (req, res) => {
  let folderId = getIdFromUrl(req.url)
  console.log(`[API] deleting folder ${folderId}`)

  let data = database.deleteFolder(folderId)
  if(data.error !== false){
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send(data.error)
  }else{
    res.setHeader('Content-Type', 'application/json')
    res.send(data)
  }
}


const deleteFile = (req, res) => {
  let fileId = getIdFromUrl(req.url)
  console.log(`[API] deleting file ${fileId}`)

  let data = database.deleteFile(fileId)
  if(data.error !== false){
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send(data.error)
  }else{
    res.setHeader('Content-Type', 'application/json')
    res.send(data)
  }
}


const moveFiles = (req, res) => {
  let parentId = getIdFromUrl(req.url)
  console.log(`[API] moving files to folder ${parentId}`)

  let data = database.moveFiles(req.body['files[]'], parentId)
  if(data.error !== false){
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send(data.error)
  }else{
    res.setHeader('Content-Type', 'application/json')
    res.send(data)
  }
}


export default{
  getFolder,
  addFolder,
  deleteFolder,
  uploadFiles,
  moveFiles,
  deleteFile,
}
