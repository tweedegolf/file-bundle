// @flowoff
/**
 * @file       List that shows all files and folders in the current folder. All
 *             items are shown as a row. See the files file.react.js and
 *             folder.react.js
 */
import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import { connect } from 'react-redux';
import File, { fileShape } from '../components/file.react';
import Folder, { folderShape } from '../components/folder.react';
import * as Actions from '../actions';
import currentFolderSelector from '../reducers/current_folder_selector';

const mapStateToProps = (state: StateType) => {
    const {
        files,
        folders,
        currentFolderId,
    } = currentFolderSelector(state);

    // and here we have the problem!
    const f:FileType = files[0];

    return {
        // tree props
        files,
        folders,
        currentFolderId,
        parentFolder: state.tree.parentFolder,

        // ui props
        sort: state.ui.sort,
        ascending: state.ui.ascending,
        preview: state.ui.preview,
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

@connect(mapStateToProps)
export default class List extends React.Component {

    static propTypes = {
        currentFolderId: PropTypes.number,
        files: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        folders: PropTypes.arrayOf(PropTypes.shape(folderShape)).isRequired,
        selected: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        clipboard: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        browser: PropTypes.bool.isRequired,
        imagesOnly: PropTypes.bool.isRequired,
        ascending: PropTypes.bool.isRequired,
        loadingFolderWithId: PropTypes.number,
        deleteFileWithId: PropTypes.number,
        deleteFolderWithId: PropTypes.number,
        isUploadingFiles: PropTypes.bool.isRequired,
        hover: PropTypes.number.isRequired,
        parentFolder: PropTypes.shape(folderShape),
        selectFile: PropTypes.func.isRequired,
    }

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
        this.openFolder = (folderId) => {
            if (this.props.isUploadingFiles === true || this.props.loadingFolderWithId !== -1) {
                return;
            }
            Actions.openFolder({ id: folderId });
        };
    }

    render() {
        if (R.isNil(this.props.currentFolderId)) {
            return false;
        }

        // TODO: reverse i!
        let i = this.props.folders.length + this.props.files.length;

        // sorted file listing
        let files = R.map((file) => {
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
        let folders = R.map(folder => (<Folder
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
        if (R.isNil(this.props.parentFolder) === false) {
            backToParent = (<Folder
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
