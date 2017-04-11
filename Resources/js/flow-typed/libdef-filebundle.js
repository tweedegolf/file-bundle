/* eslint no-undef: 0 */

import * as Constants from '../src/util/constants';

declare type TypePayload = {
    id?: number,
    errors?: Array<ErrorType>,
    foldersById?: Array<number>,
    rootFolderId?: number,
    selected?: Array<TypeFile>,
    clipboard?: Array<TypeFile>,
    scroll?: number,
    file?: TypeFile,
    browser?: boolean,
    multiple?: boolean,
    folder_id?: number,
    max?: number,
    diff?: number,
    hover?: number,
    sort?: string,
    errorId?: string,
    imageUrl?: string,
    isAddingFolder?: boolean,
};

declare type ActionType = {
    type: (
        Constants.INIT |
        Constants.FOLDER_OPENED |
        Constants.FILE_DELETED |
        Constants.FOLDER_DELETED |
        Constants.UPLOAD_DONE |
        Constants.FOLDER_ADDED |
        Constants.FILES_MOVED |
        Constants.FOLDER_OPENED |
        Constants.ERROR_OPENING_FOLDER
    ),
    payload: TypePayload
};


declare type TypeFolder = ({
    create_ts?: number,
    created?: string,
    file_count?: number,
    folder_count?: number,
    id: number,
    name: string,
    parent: number,
    type?: string,
    size?: string,
    size_bytes?: number,
    files?: Array<TypeFile>,
    folders?: Array<TypeFolder>,
} | null);

declare type TypeFile = ({
    create_ts: number,
    created: string,
    id: number,
    name: string,
    original: string,
    thumb: string,
    type: string,
    size: string,
    size_bytes: number,
} | null);

declare type Dispatch = (action: ActionType) => void;

declare type ErrorType = {
    id: string,
    type: string,
    messages: Array<string>,
}
