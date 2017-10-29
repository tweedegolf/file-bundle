## API

#### open folder

- GET      /url/id:string
- RESPONSE { files: FileType[], folders: FolderType[] }
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
- RESPONSE  { error: boolean }
- ERROR     error: string


#### delete folder

- POST       /url/id:string
- RESPONSE  { errors: string[] }
- ERROR     error: string


#### add new folder

- POST      /url/id:string (parent folder id)
- FORM     name: string
- RESPONSE { errors: string[], new_folder: FolderType | null }
- ERROR    error: string


#### rename folder

- POST      /url/id:string
- FORM      { name: string } (the new name of the folder)
- RESPONSE  { errors: string[] }
- ERROR     error: string


#### empty recycle bin

- DELETE    /url
- RESPONSE  { error: boolean }
- ERROR    error: string


#### get metadata

- POST      /url
- FORM      { fileIds: string[], folderIds: string [] }
- RESPONSE  { files: FileType[], folders: FolderType[] }
- ERROR    error: string
