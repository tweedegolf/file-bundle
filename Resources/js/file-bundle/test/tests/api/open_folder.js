import {assert, expect} from 'chai'
import {describe, it} from 'mocha'
// import assert from 'assert'
import api from '../../../api'

describe('api', done => {
  describe('#openFolder', done => {
    it('should return a folder and a files array', done => {

      api.openFolder(
        null,
        (folders, files) => {
          //console.log(folders, files)
          assert.typeOf(files, 'Array', 'no folders array')
          assert.typeOf(folders, 'Array', 'no files array')
          done()
        },
        err => {
          // console.log(err)
          done(err)
        }
      )
    })
  })
})
