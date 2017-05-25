### API

- open folder: `/admin/file/list/{id: string}`
- upload files: `/admin/file/upload/{fileList: File[], parentFolderId: string}`
- delete file: `/admin/file/delete/{id :string}`
- add new folder: `/admin/file/create/folder/{name: string, parentFolderId: string}`
- delete folder: `/admin/file/delete/folder/{id: string}`
- paste files and folders: `/admin/file/move/{fileIds: string[], folderIds: string []}`
- rename folder: `/admin/file/rename/folder/{id: string}`
- empty recycle bin: `/admin/file/recycle-bin/emtpy`
- restore from recycle bin: `/admin/file/recycle-bin/restore/{fileIds: string[], folderIds: string[]}`
- get all files and folders as JSON: `/data`
- close test server: `/close`


### About the recycle bin