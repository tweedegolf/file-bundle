## API

General: folder and file ids are strings and can *not* be `null` anymore!


#### open folder

- GET      /url/id:string (note that id may not be `null` anymore!_
- RESPONSE{ error: string, files: FileType[], folders: FolderType[] } (`error` must be added)
- ERROR   error: string (server error code, e.g. 500)

#### upload files

- POST      fileList: FileList
- RESPONSE  { files: FileType[], errors: { [id: string]: string } } (id is the name of the file that caused the error)
- ERROR     error: string

#### move items

- POST      /url/id:string (folder id of the folder where the items will be moved to)
- FORM      { fileIds: string[], folderIds: string[] } (items)
- RESPONSE  { errors: { [id: string]: string } } (id is the name of the item that caused the error, not implemented in php server)
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
- ERROR    error: string


#### empty recycle bin

- GET       /url
- RESPONSE  { error: boolean }
- ERROR    error: string


#### get metadata

- POST      /url
- FORM      { fileIds: string[], folderIds: string [] }
- RESPONSE  { files: FileType[], folders: FolderType[] }
- ERROR    error: string
