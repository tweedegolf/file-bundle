/**
 * @file       List that shows all files and folders in the current folder. All
 *             items are shown as a row. See the files file.react.js and
 *             folder.react.js
 */
import React, { PropTypes } from 'react';
import R from 'ramda';
import { connect } from 'react-redux';
import File, { fileShape } from '../components/file.react';
import Folder, { folderShape } from '../components/folder.react';
import * as Actions from '../actions';
import openFolder from '../actions/open_folder';
import deleteFile from '../actions/delete_file';
import currentFolderSelector from '../reducers/current_folder_selector';

const mapStateToProps = (state) => {
    const {
        files,
        folders,
    } = currentFolderSelector(state);

    return {
        // tree props
        files,
        folders,
        parentFolder: state.tree.parentFolder,
        currentFolderId: state.tree.currentFolder.id,

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
        deletingFolderWithId: state.ui.deletingFolderWithId, // null or number
        isAddingFolder: state.ui.isAddingFolder, // true or false
        isUploadingFiles: state.ui.isUploadingFiles, // true or false
    };
};

@connect(mapStateToProps)
export default class List extends React.Component {

    static propTypes = {
        files: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        folders: PropTypes.arrayOf(PropTypes.shape(folderShape)).isRequired,
        selected: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        clipboard: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        browser: PropTypes.bool.isRequired,
        imagesOnly: PropTypes.bool.isRequired,
        ascending: PropTypes.bool.isRequired,
        loadingFolderWithId: PropTypes.number,
        deleteFileWithId: PropTypes.number,
        isUploadingFiles: PropTypes.bool.isRequired,
        hover: PropTypes.number.isRequired,
        parentFolder: PropTypes.shape(folderShape),
        selectFile: PropTypes.func.isRequired,
        currentFolderId: PropTypes.number,
    }

    static defaultProps = {
        loadingFolderWithId: null,
        deletingFileWithId: null,
        deleteFileWithId: null,
        parentFolder: null,
        currentFolderId: null,
    }

    constructor() {
        super();
        this.openFolder = (folderId) => {
            if (this.props.isUploadingFiles === true || this.props.loadingFolderWithId !== -1) {
                return;
            }
            openFolder(folderId);
        };
    }

    render() {
        // console.log(this.props);
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
              deleteFile={R.curry(deleteFile)(this.props.currentFolderId)}
              showPreview={Actions.showPreview}
              confirmDelete={Actions.confirmDelete}
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
          parent={false}
          folder={folder}
          onDelete={Actions.deleteFolder}
          onOpenFolder={this.openFolder}
          loadingFolderWithId={this.props.loadingFolderWithId}
        />), this.props.folders);

        // reverse listings when the sort direction is reversed
        if (!this.props.ascending) {
            folders = folders.reverse();
            files = files.reverse();
        }

        // show parent directory button
        let parent = null;

        if (this.props.parentFolder !== null) {
            parent = (<Folder
              key={`folder-${this.props.parentFolder.name}`}
              parent={true}
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
            {parent}
            {folders}
            {files}
        </tbody>);
    }
}
