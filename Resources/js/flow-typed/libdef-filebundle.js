/* eslint no-undef: 0 */

import * as Constants from '../src/util/constants';

declare type Payload = {
    id?: number,
    errors?: Array<string>,
    foldersById?: Array<number>,
    rootFolderId?: number,
    selected?: Array<string>,
    scroll?: number,
    file?: string,
    browser?: boolean,
    multiple?: boolean,
    folder_id?: number,
};

declare type ActionType = {
    type: (
        Constants.INIT |
        Constants.FOLDER_OPENED |
        Constants.FILE_DELETED |
        Constants.FOLDER_DELETED |
        Constants.UPLOAD_DONE |
        Constants.FOLDER_ADDED |
        Constants.FILES_MOVED
    ),
    payload: Payload
};


declare type FolderType = {
    create_ts: number,
    created: string,
    file_count: number,
    folder_count: number,
    id: number,
    name: string,
    parent: number,
    type: string,
    size: string,
    size_bytes: number
};

declare type FileType = {
    create_ts: number,
    created: string,
    id: number,
    name: string,
    original: string,
    thumb: string,
    type: string,
    size: string,
    size_bytes: number,
};

declare type Dispatch = (action: ActionType) => void;
