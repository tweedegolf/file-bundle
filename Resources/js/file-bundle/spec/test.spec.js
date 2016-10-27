import child_process from 'child_process'
import fs from 'fs'
import path from 'path'
import install from 'jasmine-es6'
install()


let beforeEach = global.beforeEach
let describe = global.describe
let expect = global.expect
let it = global.it

const exec = child_process.exec

const phantom = (script) => {
  return new Promise((resolve, reject) => {
    exec(`phantomjs ${script}`, (err, stdout, stderr) => {
      // console.log(err, stdout, stderr)
      if(err !== null || stderr !== ''){
        reject(`err: ${err.replace('\n', '')} stderr: ${stderr.replace('\n', '')}`)
      }else{
        resolve(stdout.replace('\n', ''))
      }
    })
  })
}


describe('Phantom', function() {
  let a, b

  // it('and so is a spec', function() {
  //   a = true

  //   expect(a).toBe(true)
  // })

  // it('and so is a spec', function() {
  //   b = 44

  //   expect(b).not.toEqual(a)
  // })


  let result

  beforeEach(async function() {
    result = await phantom(path.join(__dirname, 'phantom1.js'))
  });

  it('supports async-await test cases', async function() {
    console.log('opening nu.nl:', result, 'en aap')
    expect(result).toMatch('success')
  });

})
