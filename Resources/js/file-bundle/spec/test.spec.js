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

const phantom = (script, ...params) => {
  return new Promise((resolve, reject) => {
    let cmd = `phantomjs ${script}`
    params.forEach(param => {
      cmd += ` ${param}`
    })

    console.log(cmd)
    exec(cmd, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
      let errorMessage = ''

      if(err !== null){
        errorMessage += `err: ${err.replace('\n', '')}`
      }
      if(stderr !== ''){
        if(stderr.indexOf('WARNING') === -1){
          errorMessage += `stderr: ${stderr.replace('\n', '')}`
        }else{
          console.warn(`[WARNING] ${stderr}`)
        }
      }

      if(errorMessage !== ''){
        reject(errorMessage)
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
    result = await phantom(path.join(__dirname, 'phantom1.js'), 'http://localhost:5050')
  });

  it('supports async-await test cases', async function() {
    console.log('opening:', result)
    expect(result).toMatch('success')
  });
})
