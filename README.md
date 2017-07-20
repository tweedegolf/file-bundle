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

The scss file that is provided extends the Bootstrap 3 framework. The Bootstrap javascript components are not required. Also font-awesome icons are used.


## Architecture

The gross of the code in this bundle resides in the folder `src/js/` and is written
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

The browser react component contains all state en propagates this state to the sub-components. The file and directory information is stored in the cache module - which will query the php backend when new folders are opened.

The selected files component is used when this plugin is used in a form; in that case the files can be selected (filepicker mode). When the browser operates as a separate file manager, clicking on a file means selecting it in order to, for example, put it on the clipboard.

The table of files can be sorted by clicking on the table headers.


## Flow

This project uses Flow type-checker; you can find the flow types in the folder `./types`. The `.flowconfig` is in the root folder.


## Internationalization

The interface supports internationalization by using [i18next](https://www.i18next.com/). Currently the project has translations for English and Dutch; you can find the translation files in `./src/js/locales`. You can use these files as a starting point for your own translation. Don't forget to import your translation file at the top of `./src/js/util/i18n.js`.


## Compiling javascript and scss

First install all dependencies:

 - `yarn install` (or `npm install`)

When you add this bundle to your own project you should ideally include your own compile scripts for javascript and scss; this way you can bundle the javascript and css that you use in your project together with the javascript and css in this bundle into single build files.

However, this project provides compile scripts for testing and development and for creating production builds:

 - `yarn run develop` builds and starts watching both the javascript and the css files
 - `yarn run production` builds production files
 - `yarn start` compiles and starts the test server

After you have started the test server you can point your browser to:

 - [http://localhost:8080/browser.html](http://localhost:8080/browser.html) for browser mode
 - [http://localhost:8080/filepicker.html](http://localhost:8080/filepicker.html) for file-picker mode

If you want to make changes to the express test server note that you have to restart the server to effectuate the changes. You can circumvent this by installing [nodemon](https://nodemon.io) and running the server watch command:

 - `yarn install -g nodemon`
 - `yarn run watch-server`

## Production files

The production files can be found in the `./public` folder and include:

- `file-bundle.js` the javascript code
- `file-bundle.css` css without bootstrap and font-awesome; use this if your project already includes bootstrap and font-awesome
- `file-bundle-no-bootstrap.css` use this if your project already includes bootstrap
- `file-bundle-no-font-awesome.css` use this if your project already includes font-awesome
- `file-bundle-complete.css` the complete css code
- `browser.html` example html file for browser mode
- `filepicker.html` example html file for file-picker mode
- `fonts` folder containing all bootstrap and font-awesome fonts

In the html file you will notice that you can pass arguments to the file-bundle via the `data-options` attribute:

- `rootFolderId: string`: Change the root (chroot) for this user, e.g. the top-most folder in the tree that this user is allowed to enter.
- `language: string`: The default or fallback language, this project uses IETF language tags (e.g. `en-GB`) but you can use any standard you like. The locales are located in the folder `./src/js/locales`. The locales are bundled with the javascript files to avoid extra http calls.
- `imagesOnly: bool`: Whether or not the file-bundle should only display images.
- `allowEdit: bool`: Whether of not the user is allowed to:
    - cut & paste folders and files
    - delete folders and files
    - rename folders
- `allowUpload: bool`: Whether or not the user is allowed to upload new files.
- `allowDelete: bool`: Whether or not the user is allowed to delete files and folders.
- `allowNewFolder: bool`: Whether or not the user is allowed to create new folders.

Additionally in file-picker mode only you can add an array that holds the currently selected files:
```javascript
 selected: [{
    id: string,
    name: string
    size_bytes: number,
    size: string,
    create_ts: number,
    created: string,
    thumb: string | null,
    original: string,
    type: string
}];
```


## Testing

This project comes with a test suite. If you haven't already done so in the previous step, first install the dependencies:

 - `yarn install` (or `npm install`)

The folder `tests` contains all Phantom and Jasmine tests and the folder `./server` contains the test server. All test files have a .spec.js extension.

You can run all test scripts like so:

 - `yarn test`


User interaction tests are run by Phantomjs. The source of the tests are located in the folder `./tests/phantom/src`. These tests are written in es6 and because Phantomjs only supports es5 scripts, they are compiled to the file `./tests/phantom/tests.compiled.es5`

Should you wish to change anything in the Phantomjs tests you need to recompile them using one of these commands:

 - `yarn run build-phantom`
 - `yarn run watch-phantom` for compiling while you are editing the code
