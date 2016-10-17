/**
 * Entry point of server application; sets up express server and links urls to
 * API calls. Cleanup after the node process shuts down or crashes is handled in
 * the cleanup function defined in ../util.js and called from ./upload_files.js
 */

import express from 'express'
import bodyParser from 'body-parser'
import busboy from 'connect-busboy'
import api from './api'

const app = express()
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  return next()
})

app.use('/', express.static('./test/server'))
app.use('/media/', express.static('./test/server/media'))
app.use('/assets/', express.static('./test/server/build/assets'))

// bodyparser middleware so the client can post JSON
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

// add busboy middleware for multipart support
app.use(busboy())

app.get('/admin/file/list*', api.getFolder)
app.post('/admin/file/upload*', api.uploadFiles)
app.post('/admin/file/move*', api.moveFiles)
app.post('/admin/file/create/folder*', api.addFolder)
app.post('/admin/file/delete/folder/*', api.deleteFolder)
app.post('/admin/file/delete/*', api.deleteFile)

let port = process.env.PORT || 5050
app.listen(port, () => {
  console.log(`server listening at port ${port}`)
})
