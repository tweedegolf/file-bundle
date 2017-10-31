[![Build Status](https://travis-ci.org/tweedegolf/file-bundle.svg?branch=redux)](https://travis-ci.org/tweedegolf/file-bundle)

# Tweede Golf File Bundle

Add a compact, modern and full-featured file browser to your Symfony 3 projects. The frontend is built React and optionally uses Bootstrap styling and Font Awesome icons. Note that the Bootstrap javascript components are not required.

* [Project setup](#project-setup)
    * [Dependencies](#dependencies)
    * [Start test project](#start-test-project)
    * [Make changes in the frontend](#make-changes-in-the-frontend)
    * [Make changes in the backend](#make-changes-in-the-backend)
    * [Build new version after updates](#build-new-version-after-updates)
* [More in-depth](#more-in-depth)
    * [Optimistic update](#optimistic-update)
    * [Browser mode](#browser-mode)
    * [Filepicker mode](#filepicker-mode)
    * [Styling](#styling)
    * [Permissions](#permissions)
        * [images_only](#images_only)
        * [allow_select_multiple](#allow_select_multiple)
        * [allow_upload_multiple](#allow_upload_multiple)
        * [allow_move](#allow_move)
        * [allow_rename_folder](#allow_rename_folder)
        * [allow_upload](#allow_upload)
        * [allow_delete_file](#allow_delete_file)
        * [allow_delete_folder](#allow_delete_folder)
        * [allow_empty_recycle_bin](#allow_empty_recycle_bin)
        * [allow_new_folder](#allow_new_folder)
    * [Datasets](#datasets)
    * [Internationalization](#internationalization)
    * [Flow](#flow)
* [Testing](#testing)

<sub>toc created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)</sub>

## Project setup

This project contains 3 folders:

1. `build` &rarr; the build version of the File Bundle, ready to be used in your project
2. `frontend` &rarr; all javascript, scss and build files that are needed to build the frontend
3. `backend` &rarr; a simple Symfony test app that uses the File Bundle; the File Bundle is not added via composer.json but added in the folder `./src/TweedeGolf/FileBundle` instead.

### Dependencies

* `docker-compose` for running the test project
* `nodejs` and `npm` or `yarn` for updating the frontend

### Start test project

1. open a terminal and run `docker-compose up` inside the folder `backend`
2. open another terminal and run `docker-compose run app` inside the folder `backend`
3. in the second terminal run `bin/setup` and subsequently `bin/update`

Now you should be able to open:

* the browser mode at <http://localhost:8080/assets/browser.html>
* the file picker mode at <http://localhost:8080/assets/browser.html>

### Make changes in the frontend

Open a terminal and inside the folder `frontend` run the commands:

* `npm install` or `yarn install`
* `npm run develop` or `yarn run develop`

This installs all dependencies and builds and starts watching the stylesheets and the javascript files. The javascript build file is copied to:

`./backend/src/TweedeGolf/FileBundle/Resources/scripts/`

And the compiled stylesheets are copied to:

`./backend/src/TweedeGolf/FileBundle/Resources/styles/`

This way you can see the updates in the frontend immediately if you are running the Symfony test app at localhost.

### Make changes in the backend

The backend files of the FileBundle are stored in this folder:

`./backend/src/TweedeGolf/FileBundle`

### Build new version after updates

After you have updated the frontend and/or the backend you have to build this version to the `build` folder.

1. open a terminal and `cd` to the root folder of the project
2. run `./update.sh`

Now the stylesheets and javascript files are build and minified and then together with some other files copied over to the FileBundle backend folder; `./backend/src/TweedeGolf/FileBundle/Resources`:

* `scripts` &rarr; javascript bundle
* `styles` &rarr; compiled scss files
* `fonts` &rarr; fonts required by Bootstrap and Font Awesome
* `src` &rarr; es6 source code, can be to include in the javasript code of the embedding Symfony project; use `import` to import code as a module

After that the contents of the folder `./backend/src/TweedeGolf/FileBundle` is copied to the `build` folder.

This version can be used in your Symfony project.

## More in-depth

The architecture of the frontend can be pictured as follows:

    +------------------------------+   +-----------------+
    |Browser                       |   |                 |
    |                              |   | Redux Store     |
    | +-------------------------+  +<->+                 |
    | |Selected files           |  |   |                 |
    | +-------------------------+  |   |                 |
    |                              |   +-------+---------+
    | +--------------------------+ |           ^
    | |                          | |           |
    | | +---------------------+  | |           v
    | | |Toolbar / Errors     |  | |   +-------+---------+
    | | +---------------------+  | |   |                 |
    | |                          | |   | API             |
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

The `Browser` react component is the main container, the state is kept in a Redux store and the state is queried via Redux' `mapStateToProps` method.

Besides the `Browser` component only the `List` queries the state; all other components get their state propagated in the form of properties from either `Browser` or `List`.

The folder structure reflects this separation: `Browser` and `List` are put in the folder `containers` and all other React components are put in the `components` folder.

### Optimistic update

The file and directory information is stored in the store which gets hydrated from local storage.

When a user for instance opens a folder, the content of that folder as stored will be shown first. Secondly the API module will query the php backend to check if the folder's content is still up to date.

If the folder hasn't been opened yet, there is no information about this folder available on the client, in this case the API module will consult the php backend right away.

The API module is in the `./src/js/util` folder, the store and the reduces in the folder `./src/reducers`.

### Browser mode

This mode the user can organize files and folders:

* create folders
* rename folders
* delete folders (including its content)
* upload new files
* download files
* preview images (in a modal window)
* delete files
* cut and paste files and folders to another location
* browse the files in the recycle bin
* cut and paste files from the recycle bin (restore)
* order files and folders by name, size or creation date

### Filepicker mode

Whereas the FileBundle's browser mode operates more akin to a regular desktop file manager, the file-picker mode simply allows users to select one or more files.

The file-picker is typically used in a form, for instance when the user creates a blog article that has an input field for text and a file-picker for selecting an image that will be put alongside the text.

### Styling

The styling of the frontend uses Bootstrap templates and Font Awesome icons. The styling scss files are compiled to 4 flavours:

* `file-bundle.css` &rarr; css without bootstrap and font-awesome; use this if your project already includes bootstrap and font-awesome
* `file-bundle-no-bootstrap.css` &rarr; use this if your project already includes bootstrap
* `file-bundle-no-font-awesome.css` &rarr; use this if your project already includes font-awesome
* `file-bundle-complete.css` &rarr; the complete css code

### Permissions

* `images_only`
* `allow_select_multiple`
* `allow_upload_multiple`
* `allow_move`
* `allow_rename_folder`
* `allow_upload`
* `allow_delete_file`
* `allow_delete_folder`
* `allow_empty_recycle_bin`
* `allow_new_folder`

All permissions default to `false`. Lower camel case variants will work as well, for instance `allowDeleteFolder`.

#### `images_only`

If `true` the file list only shows images and folders.

#### `allow_select_multiple`

If `true` the user can select multiple files in the file list.

#### `allow_upload_multiple`

If `true` the user can select multiple files for uploading.

#### `allow_move`

If `true` user can cut / paste files and folders.

Changes in UI when `true`

* check boxes in front of all files and folders in the list
* cut, paste, cancel buttons in toolbar

Note that if `allow_move` is `false` in file-picker mode, the check boxes will still be rendered in front of the files in the list. By checking the boxes the user can select files but can not be move them.

#### `allow_rename_folder`

If `true` user can rename folders.

Changes in UI when `true`

* rename button for every folder in the list

#### `allow_upload`

If `true` the user can upload files. There is no client-side filter on the types of files that can be uploaded; the server ultimately determines which types of files can be uploaded.

Changes in UI when `true`
* upload button in toolbar

#### `allow_delete_file`

If `true` the user can delete files.

Changes in UI when `true`
* delete button for every file in the list

#### `allow_delete_folder`

If `true` the use can delete folders.

Changes in UI when `true`
* delete button for every folder in the list

#### `allow_empty_recycle_bin`

If `true` user can permanently remove deleted files and folders.

Changes in UI when `true`
* empty recycle bin button in the the recycle bin

#### `allow_new_folder`

If `true` the user can create new folders.

Changes in UI when `true`
* new folder button in the toolbar

### Datasets

In the folder `./frontend/src/` you will find 2 html files:

- `browser.html` example html file for browser mode
- `filepicker.html` example html file for file-picker mode

In these html file you will notice that you can pass arguments via the `data-options` attribute.

The `data-options` attribute is a stringified json object and you can add any of the permissions listed above to this object. You can use both the underscore notation and the lowerCamelCase notation, e.g.: `allow_select_multiple` or `allowSelectMultiple`.

Additionally you can add the following keys:

- `rootFolderId: string`: Change the root (chroot) for this user, e.g. the top-most folder in the tree that this user is allowed to enter.
- `language: string`: The default or fallback language, this project uses IETF language tags (e.g. `en-GB`) but you can use any standard you like. The locales are located in the folder `./src/js/locales`. The locales are bundled with the javascript files to avoid extra http calls.

In file-picker mode you can also add an array that holds the currently selected files:
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

### Internationalization

The interface supports internationalization by using [i18next](https://www.i18next.com/). Currently the project has translations for English and Dutch. Translation files are stored in the folder `./frontend/src/js/locales`. You can use these files as a starting point for your own translation. Don't forget to import your translation file at the top of `./frontend/src/js/util/i18n.js`.

### Flow

The javascript code is written in es6 and to enforce strong typing the project uses Flow type-checker. You can find the flow types in the folder `./types`. The `.flowconfig` is in the root folder.

## Testing

> Note: the test suite is currently defunct.

This project comes with a test suite. If you haven't already done so in the previous step, first install the dependencies:

`yarn install` (or `npm install`)

The folder `tests` contains all Phantom and Jasmine tests and the folder `./server` contains the test server. All test files have a .spec.js extension.

You can run all test scripts like so:

`yarn test`

User interaction tests are run by Phantomjs. The source of the tests are located in the folder `./tests/phantom/src`. These tests are written in es6 and because Phantomjs only supports es5 scripts, they are compiled to the file `./tests/phantom/tests.compiled.es5`

Should you wish to change anything in the Phantomjs tests you need to recompile them using one of these commands:

 - `yarn run build-phantom`
 - `yarn run watch-phantom` for compiling while you are editing the code

