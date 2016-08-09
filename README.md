# TweedeGolf File Bundle

Add a compact, modern and full-featured file browser to your Symfony 3 projects

## Asset requirements

The following nodejs libraries are required.

- react
- react-dom
- lodash
- superagent

The SCSS stylesheet that is provided words as an extension of the Bootstrap 3 framework.
The Bootstrap javascript components are not required.


## Architecture

The gross of the code in this bundle resides in Resources/js/file-bundle ans is written
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

De browser react component contains all state en propagates this state to the subcomponents.
The file and directory information is stored in the cache module - which will query the php
backend when new folders are opened.

The selected files component is used when this plugin is used iin a form, than the files can
be selected. When the browser operated as a separate file manager clicking on a file means
selecting it to, for example, put it on the pasteboard.

The table of files can be sorted by clicking on the table headers.