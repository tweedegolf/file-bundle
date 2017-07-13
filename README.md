[![Build Status](https://travis-ci.org/tweedegolf/file-bundle.svg?branch=redux)](https://travis-ci.org/tweedegolf/file-bundle)

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

The scss file that is provided extends the Bootstrap 3 framework. The Bootstrap javascript components are not required. Also font awesome icons are used.


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


## Flow

This project uses Flow type-checker; you can find the flow types in the folder `./Resources/types`.



## Compiling javascript and scss

When you add this bundle to your own project you should ideally include your own compile scripts for javascript and scss; this way you can bundle the javascript and css that you use in your project with the javascript and css in this bundle into single build files.

However, this bundle does contain compile scripts for testing and development and for creating production builds. All build scripts are defined in the package.json but for testing and development gulp is used.

First you need to make sure that you have installed all dependencies needed for testing and development:

 - `yarn install` (or `npm install`)

Then you can start the test server:

 - `yarn start` (or `npm start`)


The bundle contains the compiled javascript and css files so you can directly point your browser to:

 - [http://localhost:5050/browser.html](http://localhost:5050/browser.html) for browser mode
 - [http://localhost:5050/filepicker.html](http://localhost:5050/filepicker.html) for filepicker mode

If you chose to make changes in the javascript and/or scss files, you can use these commands to compile the code anew:

 - `yarn run gulp:develop` builds and starts watching both the javascript and the css
 - `yarn run gulp:production` builds production files

If you want to make changes to the express test server note that you have to restart the server to effectuate the changes. You can circumvent this by installing [nodemon](https://nodemon.io) and running the server watch command:

 - `yarn install -g nodemon`
 - `yarn run watch-server`


## Testing

This project comes with a test suite. If you haven't already done so in the previous step, first install the dependencies:

 - `yarn install` (or `npm install`)

The folder `Resources/tests` contains all Phantom and Jasmine tests and the folder `./Resources/server` contains the test server. All test files have a .spec.js extension.

You can run all test scripts like so:

 - `yarn test`


User interaction tests are run by Phantomjs. The source of the tests are located in the folder `./Resources/tests/phantom/src`. These tests are written in es6 and because Phantomjs only supports es5 scripts, they are compiled to the file `./Resources/tests/phantom/tests.compiled.es5`

Should you wish to change anything in the Phantomjs tests you need to recompile them using one of these commands:

 - `yarn run build-phantom`
 - `yarn run watch-phantom` for compiling while you are editing the code
