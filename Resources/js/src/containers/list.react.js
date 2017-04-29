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
import FileComponent from '../components/file.react';
import FolderComponent from '../components/folder.react';
import * as Actions from '../actions';
import currentFolderSelector from '../reducers/current_folder_selector';

type PassedPropsType = {
    selectFile: () => void,
    browser: boolean,
    imagesOnly: boolean,
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
    deletingFileWithId: null | string,
    deletingFolderWithId: null | string,
    deleteFileWithId: null | string,
    deleteFolderWithId: null | string,
    parentFolder: null | FolderType,
};

type DefaultPropsType = {
    currentFolderId: null,
    loadingFolderWithId: null,
    deletingFileWithId: null,
    deletingFolderWithId: null,
    deleteFileWithId: null,
    deleteFolderWithId: null,
    parentFolder: null,
};

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
        isAddingFolder: state.ui.isAddingFolder, // true or false
        isUploadingFiles: state.ui.isUploadingFiles, // true or false
    };
};

type AllPropsType = PassedPropsType & PropsType;
type ListStateType = {};

@connect(mapStateToProps)
// export default class List extends React.Component {
export default class List extends React.Component<DefaultPropsType, AllPropsType, ListStateType> {
    props: AllPropsType
    state: ListStateType
    openFolder: (folderId: string) => void

    static defaultProps = {
        currentFolderId: null,
        loadingFolderWithId: null,
        deletingFileWithId: null,
        deletingFolderWithId: null,
        deleteFileWithId: null,
        deleteFolderWithId: null,
        parentFolder: null,
    }

    constructor() {
        super();
        this.openFolder = (folderId: string) => {
            if (this.props.isUploadingFiles === true || this.props.loadingFolderWithId !== -1) {
                return;
            }
            Actions.openFolder({ id: folderId });
        };
    }

    render(): ?React$Element<*> {
        if (R.isNil(this.props.currentFolderId)) {
            return null;
        }

        // TODO: reverse i!
        let i = this.props.folders.length + this.props.files.length;

        // sorted file listing
        let files = R.map((file: FileType): null | FileComponent[] => {
            // hide non-images when the images only option is passed to the form
            if (!this.props.browser && this.props.imagesOnly && !file.thumb) {
                return null;
            }

            return (<FileComponent
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
        let folders = R.map((folder: FolderType): null | FolderComponent[] => (<FolderComponent
          hovering={this.props.hover === (i -= 1)}
          key={`folder-${folder.id}`}
          backToParent={false}
          folder={folder}
          deleteFolder={Actions.deleteFolder}
          onOpenFolder={this.openFolder}
          confirmDelete={Actions.confirmDeleteFolder}
          deleteFolderWithId={this.props.deleteFolderWithId}
          loadingFolderWithId={this.props.loadingFolderWithId}
        />), this.props.folders);

        // reverse listings when the sort direction is reversed
        if (!this.props.ascending) {
            folders = folders.reverse();
            files = files.reverse();
        }

        // show parent directory button
        let backToParent = null;
        if (this.props.parentFolder !== null) {
            backToParent = (<FolderComponent
              key={`folder-${this.props.parentFolder.name}`}
              backToParent={true}
              folder={this.props.parentFolder}
              loadingFolderWithId={this.props.loadingFolderWithId}
              onOpenFolder={this.openFolder}
            />);
        }

        const loadingList = this.props.loadingFolderWithId === -1 ? 'loaded' : 'loading';

        let loadingMessage = null;
        if (loadingList === 'loading') {
            loadingMessage = <tr><td>{'loading...'}</td></tr>;
        }

        return (<tbody className={loadingList}>
            {loadingMessage}
            {backToParent}
            {folders}
            {files}
        </tbody>);
    }
}
