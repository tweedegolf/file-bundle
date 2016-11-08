# TweedeGolf File Bundle

Add a compact, modern and full-featured file browser to your Symfony 3 projects

## Asset requirements

For the javascript part, the following nodejs libraries are required:

- react
- react-dom
- react-redux
- react-drag-and-drop
- redux
- redux-logger
- superagent

The scss file that is provided extends the Bootstrap 3 framework. The Bootstrap javascript components are not required.


## Architecture

The gross of the code in this bundle resides in the folder `Resources/js/file-bundle` and is written
in ECMAscript 6 / JSX. The diagram below depicts the architecture of the react components in place.

    +------------------------------+   +-----------------+
    |Browser                       |   |                 |
    |                              |   | Cache           |
    | +-------------------------+  +<->+                 |
    | |Selected files           |  |   |                 |
    | +-------------------------+  |   |                 |
    |                              |   +-------+---------+
    | +--------------------------+ |           ^
    | |                          | |           |
    | | +---------------------+  | |           v
    | | |Toolbar / Errors     |  | |   +-------+---------+
    | | +---------------------+  | |   |                 |
    | |                          | |   | Api             |
    | | +---------------------+  | |   |                 |
    | | |List                 |  | |   |                 |
    | | |                     |  | |   +-----------------+
    | | | +----------------+  |  | |
    | | | |File / Folder   |  |  | |
    | | | +----------------+  |  | |
    | | +---------------------+  | |
    | |                          | |
    | +--------------------------+ |
    |                              |
    +------------------------------+

The browser react component contains all state en propagates this state to the subcomponents. The file and directory information is stored in the cache module - which will query the php backend when new folders are opened.

The selected files component is used when this plugin is used in a form; in that case the files can be selected (filepicker mode). When the browser operates as a separate file manager, clicking on a file means selecting it in order to, for example, put it on the clipboard.

The table of files can be sorted by clicking on the table headers.




## Compiling javascript and scss

When you add this bundle to your own project, the containing project should include its own compile scripts for javascript and scss; this way you can bundle the javascript and css that you use in your project with the javascript and css in this bundle into single build files.

However, this bundle contains does compile scripts as well, but these are meant for testing and development. All build scripts are defined in the package.json file that you can find in the folder `Resources/js/file-bundle`.

First you need to make sure that you have installed all dependencies needed for testing and development:

 - `cd Resources/js/file-bundle`
 - `npm install`

Then, provided that still are in the `Resources/js/file-bundle` folder, you can start the test server:

 - `npm start`

The bundle contains the compiled javascript and css files so you can directly point your browser to:

 - [http://localhost:5050](http://localhost:5050) or [http://localhost:5050/browser](http://localhost:5050/browser) for browser mode
 - [http://localhost:5050/filepicker](http://localhost:5050/filepicker) for filepicker mode

If you chose to make changes in the javascript and/or scss files, you can use these commands to compile the code anew:

 - `npm run build` builds both the javascript and the css
 - `npm run build-js` builds the javascript
 - `npm run build-css` builds the css
 - `npm run watch` starts watching for changes in both the javascript and the scss files and builds the code as soon as you've changed anything in the code
 - `npm run watch-js` starts watching for changes in the javascript and builds upon any change
 - `npm run watch-css` starts watching for changes in the scss files and builds upon any change





## Testing

This project comes with a test suite. If you haven't already done so in the previous step, first install the dependencies:

 - `cd Resources/js/file-bundle`
 - `npm install`

In the directory `Resources/js/file-bundle/test` you will find a folder `tests` that contains all tests and a folder `server` that contains the test server. In the `tests` folder all test files have a .spec.js extension.

You can run all test scripts from the `Resources/js/file-bundle` folder:

 - `npm test`


User interaction tests are run by Phantomjs. The source of the tests are located in the folder `tests/phantom/src`. These tests are written in es6 and because Phantomjs only supports es5 scripts, they are compiled to the file `tests/phantom/tests.compiled.es5`

Should you wich to change anything in the Phantomjs tests you need to recompile them using one of these commands:

 - `npm run build-phantom`
 - `npm run watch-phantom` for compiling while you are editing the code
