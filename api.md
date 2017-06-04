## API

#### open folder:
- GET      /url/id:string
- OK      { files: FileType[], folders: FolderType[] }
- ERROR   error: string

#### upload files:
- POST      fileList: FileList
- OK        { files: FileType[], errors: string[] }
- ERROR     error: string

#### delete file:
- POST       /url/id:string
- OK        error: "false"
- ERROR     error: string

#### add new folder:
POST name: string, parentFolderId: string

#### delete folder:
POST id: string

#### move files and folders:
POST fileIds: string[], folderIds: string []

#### rename folder:
POST id: string

#### empty recycle bin:
GET

#### get metadata:
POST fileIds: string[], folderIds: string []
