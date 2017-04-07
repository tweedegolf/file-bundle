type ActionType = {
    id: (
        'INIT' |
        'FOLDER_OPENED' |
        'FILE_DELETED' |
        'FOLDER_DELETED' |
        'UPLOAD_DONE' |
        'FOLDER_ADDED' |
        'FILES_MOVED'
    ),
    payload: {
        id?: number,
        errors?: Array<string>
    }
};
