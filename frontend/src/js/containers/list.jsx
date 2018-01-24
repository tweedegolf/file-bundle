// @flow
/**
 * @file       List that shows all files and folders in the current folder. All
 *             items are shown as a row. See the files file.react.js and
 *             folder.react.js
 */
import R from 'ramda';
import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next';
import File from '../components/file.jsx';
import Folder from '../components/folder.jsx';
import ParentFolder from '../components/parent_folder.jsx';
import * as Actions from '../actions';
import currentFolderSelector from '../reducers/current_folder_selector';
import type { PermissionsType } from '../actions/init';

// START FLOW TYPES

type PassedPropsType = {
    browser: boolean,
    apiUrl: string,
    t: (string) => string,
};

type PropsType = {
    files: FileType[],
    folders: FolderType[],
    selected: ClipboardType,
    clipboard: ClipboardType,
    permissions: PermissionsType,
    ascending: boolean,
    isUploadingFiles: boolean,
    hover: null | number,
    loadingFolderWithId: null | string,
    deleteFileWithId: null | string,
    deletingFileWithId: null | string,
    deleteFolderWithId: null | string,
    deletingFolderWithId: null | string,
    renameFolderWithId: null | string,
    renamingFolderWithId: null | string,
    parentFolder: null | FolderType,
    showingRecycleBin: boolean,
    currentFolderId: null | string,
};

type DefaultPropsType = {
    loadingFolderWithId: null,
    deletingFileWithId: null,
    deletingFolderWithId: null,
    deleteFileWithId: null,
    renameFolderWithId: null,
    deleteFolderWithId: null,
    parentFolder: null,
};

type ActionsPropsType = {
    openFolder: (string) => ReduxThunkType,
    renameFolder: (string, string) => ReduxThunkType,
    confirmRenameFolder: (null | string) => GenericActionType,
    selectFile: (string) => GenericActionType,
    deleteFile: (string) => ReduxThunkType,
    showPreview: (null | string) => GenericActionType,
    confirmDeleteFile: (null | string) => GenericActionType,
    selectFolder: (string) => GenericActionType,
    deleteFolder: (string) => ReduxThunkType,
    confirmDeleteFolder: (null | string) => GenericActionType,
};

type AllPropsType = PassedPropsType & PropsType & ActionsPropsType;
type ListStateType = {};

// END FLOW TYPES

const mapStateToProps = (state: StateType): PropsType => {
    const {
        files,
        folders,
        parentFolder,
    } = currentFolderSelector(state);

    return {
        // tree props
        files,
        folders,
        parentFolder,

        // ui props
        currentFolderId: state.ui.currentFolderId,
        permissions: state.ui.permissions,
        sort: state.ui.sort,
        ascending: state.ui.ascending,
        preview: state.ui.previewUrl,
        expanded: state.ui.expanded,
        hover: state.ui.hover,
        selected: state.ui.selected,
        clipboard: state.ui.clipboard,
        loadingFolderWithId: state.ui.loadingFolderWithId, // null or number
        deleteFileWithId: state.ui.deleteFileWithId, // null or number
        deletingFileWithId: state.ui.deletingFileWithId, // null or number
        deleteFolderWithId: state.ui.deleteFolderWithId, // null or number
        deletingFolderWithId: state.ui.deletingFolderWithId, // null or number
        renameFolderWithId: state.ui.renameFolderWithId, // null or number
        renamingFolderWithId: state.ui.renamingFolderWithId, // null or number
        isAddingFolder: state.ui.isAddingFolder,
        isUploadingFiles: state.ui.isUploadingFiles,
        showingRecycleBin: state.ui.showingRecycleBin,
    };
};

const mapDispatchToProps = (dispatch: DispatchType, ownProps: PassedPropsType): ActionsPropsType => {
    const apiUrl = ownProps.apiUrl;
    return {
        ...bindActionCreators({
            openFolder: R.curry(Actions.openFolder)(apiUrl),
            confirmRenameFolder: Actions.confirmRenameFolder,
            renameFolder: R.curry(Actions.renameFolder)(apiUrl),
            selectFile: Actions.selectFile,
            showPreview: Actions.showPreview,
            confirmDeleteFile: Actions.confirmDeleteFile,
            deleteFile: Actions.deleteFile,
            selectFolder: Actions.selectFolder,
            confirmDeleteFolder: Actions.confirmDeleteFolder,
            deleteFolder: R.curry(Actions.deleteFolder)(apiUrl),
        }, dispatch)
    }
}

// export default class List extends React.Component {
class List extends React.Component<DefaultPropsType, AllPropsType, ListStateType> {
    static defaultProps = {
        loadingFolderWithId: null,
        deletingFileWithId: null,
        deletingFolderWithId: null,
        deleteFileWithId: null,
        deleteFolderWithId: null,
        renameFolderWithId: null,
        parentFolder: null,
    }

    constructor() {
        super();
        this.openFolder = (folderId: string) => {
            if (this.props.isUploadingFiles === true || this.props.loadingFolderWithId !== null) {
                return;
            }
            this.props.openFolder(folderId);
        };
        this.renameFolder = (folderId: string, newName: string) => {
            this.props.renameFolder(folderId, newName);
        };
        this.confirmRenameFolder = (folderId: string) => {
            if (this.props.isUploadingFiles === true ||
                this.props.loadingFolderWithId !== null ||
                this.props.permissions.allowRenameFolder === false
            ) {
                return;
            }
            this.props.confirmRenameFolder(folderId);
        };
    }

    state: ListStateType
    props: AllPropsType
    confirmRenameFolder: (folderId: string) => void
    openFolder: (folderId: string) => void
    renameFolder: (folderId: string, newName: string) => void

    render(): ?React$Element<*> {
        // TODO: reverse i!
        let i = this.props.folders.length + this.props.files.length;

        // sorted file listing
        let files = R.map((file: FileType): null | React$Element<*> => {
            // hide non-images in filepicker mode when the imagesOnly option is
            // set to true and passed to the form
            if (this.props.browser === false && // filepicker mode
                this.props.permissions.imagesOnly === true &&
                file.thumb === null) {          // only image file types have a thumb
                return null;
            }

            return (<File
                key={`file-${file.id}`}
                file={file}
                hovering={this.props.hover === (i -= 1)}
                selectFile={this.props.selectFile}
                deleteFile={this.props.deleteFile}
                showPreview={this.props.showPreview}
                confirmDelete={this.props.confirmDeleteFile}
                selected={this.props.selected}
                clipboard={this.props.clipboard}
                browser={this.props.browser}
                deleteFileWithId={this.props.deleteFileWithId}
                permissions={this.props.permissions}
                showingRecycleBin={this.props.showingRecycleBin}
            />);
        }, this.props.files);

        // sorted folder listing
        let folders = R.map((folder: FolderType): React$Element<*> => (<Folder
            hovering={this.props.hover === (i -= 1)}
            key={`folder-${folder.id === null ? 'null' : folder.id}`}
            folder={folder}
            permissions={this.props.permissions}
            selectFolder={this.props.selectFolder}
            deleteFolder={this.props.deleteFolder}
            selected={this.props.selected}
            clipboard={this.props.clipboard}
            browser={this.props.browser}
            openFolder={this.openFolder}
            renameFolder={this.renameFolder}
            confirmRenameFolder={this.confirmRenameFolder}
            confirmDelete={this.props.confirmDeleteFolder}
            deleteFolderWithId={this.props.deleteFolderWithId}
            loadingFolderWithId={this.props.loadingFolderWithId}
            renameFolderWithId={this.props.renameFolderWithId}
            showingRecycleBin={this.props.showingRecycleBin}
        />), this.props.folders);

        // reverse listings when the sort direction is reversed
        if (!this.props.ascending && files !== null && folders !== null) {
            folders = folders.reverse();
            files = files.reverse();
        }

        // show button that leads back to parent directory
        let backToParent = null;
        if (this.props.parentFolder !== null) {
            backToParent = (<ParentFolder
                key={`folder-${this.props.parentFolder.name}`}
                folder={this.props.parentFolder}
                openFolder={this.openFolder}
            />);
        }

        return (<tbody>
            {backToParent}
            {folders}
            {files}
        </tbody>);
    }
}

export default translate('common')(connect(mapStateToProps, mapDispatchToProps)(List));
