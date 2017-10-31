
* [TweedeGolf File Bundle](#tweedegolf-file-bundle)
    * [Project setup](#project-setup)
        * [Dependencies](#dependencies)
        * [Start test project](#start-test-project)
        * [Make changes in the frontend](#make-changes-in-the-frontend)
        * [Make changes in the backend](#make-changes-in-the-backend)
        * [Build new version after updates](#build-new-version-after-updates)
    * [More in-depth](#more-in-depth)

<sub>toc created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)</sub>

# Tweede Golf File Bundle

Add a compact, modern and full-featured file browser to your Symfony 3 projects. The frontend uses React and optionally Bootstrap and Font Awesome.

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

Now the stylesheets and javascript files are build and minified and then copied over to the backend folder together with some other files.

After that the contents of the folder `./backend/src/TweedeGolf/FileBundle` is copied to the `build` folder.

This version can be used in your Symfony project.

## More in-depth

The architecture of the frontend:

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
