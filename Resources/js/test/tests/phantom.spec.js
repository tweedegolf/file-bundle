import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import jasmine from './index';

const {
    beforeAll,
    describe,
    it,
    expect,
} = jasmine.env;

const exec = childProcess.exec;

/**
 * Function that runs a phantomjs script on the command line. The output of the
 * script is read from the stdout
 *
 * @param      {string}   script  The path to the phantomjs script
 * @param      {Array}    params  The command line arguments that will be passed
 *                                to the phantomjs script
 * @return     {Promise}  Resolves with the output of the phantomjs script or
 *                        rejects in case of an error when stderr or err are not
 *                        null
 */
const phantom = (script, ...params) => new Promise((resolve, reject) => {
    let cmd = `./node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs ${script}`;
    params.forEach((param) => {
        cmd += ` ${param}`;
    });

    // console.log('[CMD]', cmd);
    exec(cmd, (err, stdout, stderr) => {
        if (err !== null) {
            console.log('err:', err);
        }
        // console.log('stderr:', stderr)

        let errorMessage = '';

        if (err !== null) {
        // errorMessage += `err: ${err.Error.replace(/\n/g, ' ')}`
            errorMessage += `err: ${err.toString()}`;
        }
        if (stderr !== '') {
            if (stderr.indexOf('WARNING') === -1) {
                errorMessage += `stderr: ${stderr.replace('\n', '')}`;
            } else {
                console.warn(`[WARNING] ${stderr}`);
            }
        }

        if (errorMessage !== '') {
            reject(errorMessage);
        } else {
            resolve(stdout.replace('\n', ''));
        }
    });
});


describe('User interaction tests with phantomjs', () => {
    let result;
    let subResult;

    // beforeAll(async () => {
    //     result = await phantom(path.join(__dirname, './phantom/tests.compiled.es5'), 'url=http://localhost:5050');
    //     result = JSON.parse(result);
    //     console.log(result);
    // });

    beforeAll((done) => {
        phantom(path.join(__dirname, './phantom/tests.compiled.es5'), 'url=http://localhost:5050')
        .then((data) => {
            const index1 = data.indexOf('$DATA') + 5;
            const index2 = data.lastIndexOf('$DATA');
            const filtered = data.substring(index1, index2);
            result = JSON.parse(filtered);
            fs.writeFileSync(path.join(__dirname, 'result.json'), filtered);
            done();
        });
    });

    it('Open the page', () => {
        subResult = result.open_page;
        expect(subResult.error).not.toBeDefined();
        expect(subResult.title).toEqual('The Art of State');
    });

    it('Rename folder "folder 1" to "new_name', () => {
        subResult = result.rename_folder;
        expect(subResult.error).not.toBeDefined();
        expect(subResult.renamed).toBeTruthy();
    });

    it('Open folder "new_name"', () => {
        subResult = result.open_folder;
        expect(subResult.error).not.toBeDefined();
        expect(subResult.name).toEqual('new_name');
        expect(subResult.numFiles).toBe(0);
        expect(subResult.numFolders).toBe(1);
    });

    it('Upload single file', () => {
        subResult = result.upload_single_file;
        expect(subResult.error).not.toBeDefined();
        expect(subResult.uploaded).toBeTruthy();
        expect(subResult.numFiles).toBe(1);
    });

    it('Upload multiple files', () => {
        subResult = result.upload_multiple_files;
        expect(subResult.error).not.toBeDefined();
        expect(subResult.uploaded).toBeTruthy();
        expect(subResult.numFiles).toBe(3);
    });

    it('Create new folder with name "phantom"', () => {
        subResult = result.create_folder;
        expect(subResult.error).not.toBeDefined();
        expect(subResult.numFolders).toBe(2);
    });

    it('Open folder "phantom_folder"', () => {
        subResult = result.open_folder_phantom;
        expect(subResult.error).not.toBeDefined();
        expect(subResult.name).toEqual('phantom_folder');
        expect(subResult.numFiles).toBe(0);
        expect(subResult.numFolders).toBe(1);
    });

    it('Open parent folder of "phantom_folder"', () => {
        subResult = result.open_parent_folder_phantom;
        expect(subResult.error).not.toBeDefined();
        expect(subResult.name).toEqual('..');
        expect(subResult.numFiles).toBe(0);
        expect(subResult.numFolders).toBe(2);
    });

    it('Close server', () => {
        subResult = result.close_server;
        expect(subResult.running).toBe(false);
    });
});

