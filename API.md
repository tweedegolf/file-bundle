# API

## open folder

- GET      /admin/file/list/id:string
- RESPONSE { files: FileType[], folders: FolderType[] }
- ERROR   error: string (server error code, e.g. 500)

## upload files

- POST      /admin/file/upload/fileList: FileList
- RESPONSE  { files: FileType[], errors: { [id: string]: string } } (id is the name of the file that caused the error)
- ERROR     error: string

## move items

- POST      /admin/file/move/id:string (folder id of the folder where the items will be moved to)
- FORM      { fileIds: string[], folderIds: string[] } (items)
- RESPONSE  { errors: { fileIds: string[], folderIds: string[] } } (the ids of the items that raised errors while moving will be returned)
- ERROR     error: string

## delete file

- POST       /admin/file/delete/id:string
- RESPONSE  { error: boolean }
- ERROR     error: string

## delete folder

- POST       /admin/file/delete/folder/id:string
- RESPONSE  { errors: string[] }
- ERROR     error: string

## add new folder

- POST      /admin/file/create/folder/id:string (parent folder id)
- FORM     name: string
- RESPONSE { errors: string[], new_folder: FolderType | null }
- ERROR    error: string

## rename folder

- POST      /admin/file/rename/folder/id:string
- FORM      { name: string } (the new name of the folder)
- RESPONSE  { errors: string[] }
- ERROR     error: string

## empty recycle bin

- DELETE    /admin/file/recycle_bin/empty
- RESPONSE  { error: boolean }
- ERROR    error: string

## get metadata

- POST      /admin/file/metadata
- FORM      { fileIds: string[], folderIds: string [] }
- RESPONSE  { files: FileType[], folders: FolderType[] }
- ERROR    error: string
