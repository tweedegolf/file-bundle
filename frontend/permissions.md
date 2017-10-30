# Permissions

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
