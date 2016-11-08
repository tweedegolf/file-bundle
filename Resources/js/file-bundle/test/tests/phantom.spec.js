import child_process from 'child_process'
import path from 'path'
import jasmine from './index'

const {
  beforeAll,
  describe,
  it,
  expect
} = jasmine.env

const exec = child_process.exec

/**
 * Function that runs a phantomjs script on the command line. The output of the
 * script is read from the stdout
 *
 * @param      {string}   script  The path to the phantomjs script
 * @param      {Array}    params  The command line arguments that will be passed
 *                                to the phantomjs script
 * @return     {Promise}  Resolves with the output of the phantomjs script or
 *                        rejects in case of an error whan stderr or err are not
 *                        null
 */
const phantom = (script, ...params) => {
  return new Promise((resolve, reject) => {
    let cmd = `./node_modules/.bin/phantomjs ${script}`
    params.forEach(param => {
      cmd += ` ${param}`
    })

    //console.log('[CMD]', cmd)
    exec(cmd, (err, stdout, stderr) => {
      if(err !== null){
        console.log('err:', err)
      }
      //console.log('stderr:', stderr)

      let errorMessage = ''

      if(err !== null){
        //errorMessage += `err: ${err.Error.replace(/\n/g, ' ')}`
        errorMessage += `err: ${err.toString()}`
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


describe('User interaction tests with phantomjs', function() {
  let result
  let subResult

  // beforeAll(async function() {
  //   result = await phantom(path.join(__dirname, './phantom/tests.compiled.es5'), 'url=http://localhost:5050')
  //   result = JSON.parse(result)
  //   console.log(result)
  // })

  beforeAll(done => {
    phantom(path.join(__dirname, './phantom/tests.compiled.es5'), 'url=http://localhost:5050')
    .then(data => {
      result = JSON.parse(data)
      console.log(result)
      done()
    })
  })

  it('Open the page', function() {
    subResult = result.open_page
    expect(subResult.error).not.toBeDefined()
    expect(subResult.title).toEqual('The Art of State')
  })

  it('Open folder "colors"', function() {
    subResult = result.open_folder
    expect(subResult.error).not.toBeDefined()
    expect(subResult.name).toEqual('colors')
    expect(subResult.numFiles).toBe(0)
    expect(subResult.numFolders).toBe(1)
  })

  it('Upload single file', function() {
    subResult = result.upload_single_file
    expect(subResult.error).not.toBeDefined()
    expect(subResult.uploaded).toBeTruthy()
    expect(subResult.numFiles).toBe(1)
  })

  it('Upload multiple files', function() {
    subResult = result.upload_multiple_files
    expect(subResult.error).not.toBeDefined()
    expect(subResult.uploaded).toBeTruthy()
    expect(subResult.numFiles).toBe(3)
  })

  it('Add new folder', function() {
    subResult = result.create_folder
    expect(subResult.error).not.toBeDefined()
    expect(subResult.numFolders).toBe(2)
  })

})


