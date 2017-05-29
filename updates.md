### API

- open folder: `/admin/file/list/{id: string}`
- upload files: `/admin/file/upload/{fileList: File[], parentFolderId: string}`
- delete file: `/admin/file/delete/{id :string}`
- add new folder: `/admin/file/create/folder/{name: string, parentFolderId: string}`
- delete folder: `/admin/file/delete/folder/{id: string}`
- paste files and folders: `/admin/file/move/{fileIds: string[], folderIds: string []}`
- rename folder: `/admin/file/rename/folder/{id: string}`
- empty recycle bin: `/admin/file/recycle-bin/empty`
- restore from recycle bin: `/admin/file/recycle-bin/restore/{fileIds: string[], folderIds: string[]}`
- get all files and folders as JSON: `/data` (only available in test server)
- close test server: `/close` (only available in test server)


### About the recycle bin

Note that files and folders can be undefined during the first run when the state get re-hydrated from the local storage:

- User A deletes file 102 from folder 0.
- User B enters the app at folder 0 and then visits the recycle bin, she sees the file that has been deleted by User A.
- User B leaves the app.
- User A purges the recycle bin.
- User B returns and sees the recycle bin because that is the folder that she has lastly visited; the folder is now empty because it has been updated from the server.
- User B clicks on the 'back' button to leave the recycle bin
- Error "cannot read isTrashed from undefined" (has been fixed meanwhile!)

This error occurs because when the contents of the recycle bin got updated by the server, the filesById object in the state got updated as well. This update entails that the entry 201 got deleted from the `filesById` object. However, in the tree the `fileIds` array of folder 0 there is still a reference to file 102:
`
tree: {
    0: {
        fileIds: [102],
        folderIds: []
    }
}
`
This means that when folder 0 is opened the app will look for file 102 in the `filesById` object. Note that this issue has been fixed!



