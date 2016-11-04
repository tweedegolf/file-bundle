import child_process from 'child_process'
import fs from 'fs'
import path from 'path'
import install from 'jasmine-es6'
// make es6 available in jasmine
install()

// add global functions to local variables to put eslint at ease
let beforeAll = global.beforeAll
let beforeEach = global.beforeEach
let afterEach = global.afterEach
let afterAll = global.afterAll
let describe = global.describe
let expect = global.expect
let it = global.it
let jasmine = global.jasmine

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
    let cmd = `phantomjs ${script}`
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

// override the default timeout of 5 seconds
jasmine.getEnv().defaultTimeoutInterval = 30000
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000


describe('Open Folder', function() {
  let result
  beforeAll(async function() {
    result = await phantom(path.join(__dirname, 'open_folder.js'), 'url=http://localhost:5050')
  });

  it('Open the \'colors\' folder; it should contain 0 files and 1 folders', async function() {
    console.log(result)
    result = JSON.parse(result)
    expect(result.name).toMatch('colors')
    expect(result.numFiles).toEqual(0)
    expect(result.numFolders).toEqual(1)
  });
})


describe('Upload one file', function() {
  let result
  beforeAll(async function() {
    result = await phantom(path.join(__dirname, 'upload_file.js'), 'url=http://localhost:5050', 'multiple=0')
  });

  it('Upload a file to the root folder', async function() {
    console.log(result)
    result = JSON.parse(result)
    expect(result.numFiles).toEqual(2)
    expect(result.uploaded).toEqual(true)
  });
})


describe('Upload two more files', function() {
  let result
  beforeAll(async function() {
    result = await phantom(path.join(__dirname, 'upload_file.js'), 'url=http://localhost:5050', 'multiple=1')
  });

  it('Upload 2 more files to the root folder', async function() {
    console.log(result)
    result = JSON.parse(result)
    expect(result.numFiles).toEqual(4)
    expect(result.uploaded).toEqual(true)
  });
})


/*
describe('Phantom', function() {
  let a, b

  it('and so is a spec', function() {
    a = true

    expect(a).toBe(true)
  })

  it('and so is a spec', function() {
    b = 44

    expect(b).not.toEqual(a)
  })


  let result
  beforeAll(async function() {
    result = await phantom(path.join(__dirname, 'open_folder.js'), 'http://localhost:5050')
  });

  it('Open the \'colors\' folder; it should contain 0 files and 1 folders', async function() {
    //console.log(result)
    result = JSON.parse(result)
    expect(result.name).toMatch('colors')
    expect(result.numFiles).toEqual(0)
    expect(result.numFolders).toEqual(1)
  });


  afterAll(function(done){
    setTimeout(function(){
      done()
    }, 1000)
  })


  beforeAll(async function() {
    result = await phantom(path.join(__dirname, 'upload_file.js'), 'http://localhost:5050')
  });

  it('Upload a file to the root folder', async function() {
    console.log(result)
    result = JSON.parse(result)
    expect(result.numFiles).toEqual(2)
    expect(result.uploaded).toEqual(true)
  });

  afterAll(function(done){
    setTimeout(function(){
      done()
    }, 100)
  })
})
*/