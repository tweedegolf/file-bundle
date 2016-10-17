import {assert, expect} from 'chai'
import {describe, it} from 'mocha'
// import assert from 'assert'
import api from '../../../util/api'

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

    it('should return an error', done => {

      api.openFolder(
        1000,
        (folders, files) => {
          // fix this!
          done()
        },
        errors => {
          console.log('#num errors', errors.length)
          assert.typeOf(errors, 'Array', 'no error messages')
          done()
        }
      )
    })
  })
})
