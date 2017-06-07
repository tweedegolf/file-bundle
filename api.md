## API

General: folder and file ids are strings and can *not* be `null` anymore!

#### open folder

This endpoint now contains 2 parameters; the id of the folder to be opened and the id of the chroot folder for this user. The server should check if the folder is inside the chroot folder tree. A chroot check can be bypassed by passing the value `'null'`, i.e. a *string* null.

- GET      /url/id:string/root:string (note that id may not be `null` anymore!)
- RESPONSE{ error: string, files?: FileType[], folders?: FolderType[] } (`error` must be added, for instance if the folder has been deleted or if the user has no rights to view the folder's content. If `error` is false `files` and `folders` may be omitted)
- ERROR   error: string (server error code, e.g. 500)


#### upload files

- POST      fileList: FileList
- RESPONSE  { files: FileType[], errors: { [id: string]: string } } (id is the name of the file that caused the error)
- ERROR     error: string


#### move items

- POST      /url/id:string (folder id of the folder where the items will be moved to)
- FORM      { fileIds: string[], folderIds: string[] } (items)
- RESPONSE  { errors: { fileIds: string[], folderIds: string[] } } (the ids of the items that raised errors while moving will be returned)
- ERROR     error: string


#### delete file

- POST       /url/id:string
- RESPONSE  { error: boolean | string }
- ERROR     error: string


#### delete folder

- POST       /url/id:string
- RESPONSE  { error: boolean | string }
- ERROR     error: string


#### add new folder

- POST      /url/id:string (parent folder id)
- FORM     name: string
- RESPONSE { errors: string[], new_folders: string[] } (Why are this arrays? You can only add one folder at the time. Why not use the type { [id: string]: string })
- ERROR    error: string


#### rename folder

- POST      /url/id:string
- FORM      { name: string } (the new name of the folder)
- RESPONSE  { error: boolean | string }
- ERROR     error: string


#### empty recycle bin

- DELETE    /url
- RESPONSE  { error: boolean | string }
- ERROR    error: string


#### get metadata

- POST      /url
- FORM      { fileIds: string[], folderIds: string [] }
- RESPONSE  { files: FileType[], folders: FolderType[] }
- ERROR    error: string
