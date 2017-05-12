// @flow
/**
 * @file       List that shows all files and folders in the current folder. All
 *             items are shown as a row. See the files file.react.js and
 *             folder.react.js
 */
import React from 'react';
// import PropTypes from 'prop-types';
import R from 'ramda';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import File from '../components/file.react';
import Folder from '../components/folder.react';
import * as Actions from '../actions';
import currentFolderSelector from '../reducers/current_folder_selector';

type PassedPropsType = {
    selectFile: () => void,
    browser: boolean,
    imagesOnly: boolean,
    t: (string) => string,
};

type PropsType = {
    files: FileType[],
    folders: FolderType[],
    selected: FileType[],
    clipboard: FileType[],
    ascending: boolean,
    isUploadingFiles: boolean,
    hover: null | number,
    currentFolderId: null | string,
    loadingFolderWithId: null | string,
    deleteFileWithId: null | string,
    deletingFileWithId: null | string,
    deleteFolderWithId: null | string,
    deletingFolderWithId: null | string,
    renameFolderWithId: null | string,
    renamingFolderWithId: null | string,
    parentFolder: null | FolderType,
};

type DefaultPropsType = {
    currentFolderId: null,
    loadingFolderWithId: null,
    deletingFileWithId: null,
    deletingFolderWithId: null,
    deleteFileWithId: null,
    renameFolderWithId: null,
    deleteFolderWithId: null,
    parentFolder: null,
};

type AllPropsType = PassedPropsType & PropsType;
type ListStateType = {};

const mapStateToProps = (state: StateType): PropsType => {
    const {
        files,
        folders,
        currentFolderId,
    } = currentFolderSelector(state);

    return {
        // tree props
        files,
        folders,
        currentFolderId,
        parentFolder: state.tree.parentFolder,

        // ui props
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
        isAddingFolder: state.ui.isAddingFolder, // true or false
        isUploadingFiles: state.ui.isUploadingFiles, // true or false
    };
};

// export default class List extends React.Component {
class List extends React.Component<DefaultPropsType, AllPropsType, ListStateType> {
    props: AllPropsType
    state: ListStateType
    openFolder: (folderId: string) => void
    confirmRenameFolder: (folderId: string) => void
    renameFolder: (folderId: string, newName: string) => void

    static defaultProps = {
        currentFolderId: null,
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
            Actions.openFolder({ id: folderId });
        };
        this.renameFolder = (folderId: string, newName: string) => {
            if (this.props.isUploadingFiles === true || this.props.loadingFolderWithId !== null) {
                return;
            }
            Actions.renameFolder(folderId, newName);
        };
        this.confirmRenameFolder = (folderId: string) => {
            if (this.props.isUploadingFiles === true || this.props.loadingFolderWithId !== null) {
                return;
            }
            Actions.confirmRenameFolder(folderId);
        };
    }

    render(): ?React$Element<*> {
        if (R.isNil(this.props.currentFolderId)) {
            return null;
        }
        // TODO: reverse i!
        let i = this.props.folders.length + this.props.files.length;

        // sorted file listing
        let files = R.map((file: FileType): null | React$Element<*> => {
            // hide non-images when the images only option is passed to the form
            if (!this.props.browser && this.props.imagesOnly && !file.thumb) {
                return null;
            }

            return (<File
              key={`file-${file.id}`}
              file={file}
              hovering={this.props.hover === (i -= 1)}
              selectFile={this.props.selectFile}
              deleteFile={Actions.deleteFile}
              showPreview={Actions.showPreview}
              confirmDelete={Actions.confirmDeleteFile}
              selected={this.props.selected}
              clipboard={this.props.clipboard}
              browser={this.props.browser}
              deleteFileWithId={this.props.deleteFileWithId}
            />);
        }, this.props.files);

        // sorted folder listing
        let folders = R.map((folder: FolderType): React$Element<*> => (<Folder
          hovering={this.props.hover === (i -= 1)}
          key={`folder-${folder.id}`}
          backToParent={false}
          folder={folder}
          deleteFolder={Actions.deleteFolder}
          openFolder={this.openFolder}
          renameFolder={this.renameFolder}
          confirmRenameFolder={this.confirmRenameFolder}
          confirmDelete={Actions.confirmDeleteFolder}
          deleteFolderWithId={this.props.deleteFolderWithId}
          loadingFolderWithId={this.props.loadingFolderWithId}
          renameFolderWithId={this.props.renameFolderWithId}
        />), this.props.folders);

        // reverse listings when the sort direction is reversed
        if (!this.props.ascending) {
            folders = folders.reverse();
            files = files.reverse();
        }

        // show parent directory button
        let backToParent = null;
        if (this.props.parentFolder !== null) {
            backToParent = (<Folder
              key={`folder-${this.props.parentFolder.name}`}
              backToParent={true}
              folder={this.props.parentFolder}
              loadingFolderWithId={this.props.loadingFolderWithId}
              openFolder={this.openFolder}
              renameFolder={this.renameFolder}
              confirmRenameFolder={this.confirmRenameFolder}
            />);
        }

        const loadingList = this.props.loadingFolderWithId === null ? 'loaded' : 'loading';

        let loadingMessage = null;
        if (loadingList === 'loading') {
            loadingMessage = <tr><td>{this.props.t('loading')}</td></tr>;
        }

        return (<tbody className={loadingList}>
            {loadingMessage}
            {backToParent}
            {folders}
            {files}
        </tbody>);
    }
}

export default translate('common')(connect(mapStateToProps)(List));
