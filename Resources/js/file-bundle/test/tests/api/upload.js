import {assert, expect} from 'chai'
import {describe, it} from 'mocha'
// import assert from 'assert'
import api from '../../../util/api'
import fs from 'fs'
import path from 'path'


// These are actually non-relevant tests!

export default done => {

  describe('#upload', done => {

    describe('#jpg', done => {
      it('should return an empty error object and an array containing 1 element', done => {

        let image = path.join(__dirname.replace('/api', ''), 'test-files', 'manhattan.jpg')
        let buffer = fs.readFileSync(image)
        let fileList = [buffer]

        api.upload(
          fileList,
          null,
          (errors, uploads) => {
            assert.typeOf(errors, 'Object', 'no errors object')
            expect(errors).to.deep.equal({}, 'there should be no errors')
            assert.typeOf(uploads, 'Array', 'no uploads array')
            assert(uploads.length === 1, 'uploads array should contain 1 element')
            done()
          },
          err => {
            // console.log(err)
            done(err)
          }
        )
      })
    })

    describe('#png', done => {
      it('should return an empty error object and an array containing 1 element', done => {

        let image = path.join(__dirname.replace('/api', ''), 'test-files', 'internet.png')
        let buffer = fs.readFileSync(image)
        let fileList = [buffer]

        api.upload(
          fileList,
          null,
          (errors, uploads) => {
            assert.typeOf(errors, 'Object', 'no errors object')
            expect(errors).to.deep.equal({}, 'there should be no errors')
            assert.typeOf(uploads, 'Array', 'no uploads array')
            assert(uploads.length === 1, 'uploads array should contain 1 element')
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
}

