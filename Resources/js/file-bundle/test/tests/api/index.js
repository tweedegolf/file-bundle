import {assert, expect} from 'chai'
import {describe, it} from 'mocha'
import openFolder from './open_folder'
import upload from './upload'

describe('api', done => {
  openFolder(done)
  upload(done)
})
