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
import ParentFolder from '../components/parent_folder.react';
import * as Actions from '../actions';
import currentFolderSelector from '../reducers/current_folder_selector';

type PassedPropsType = {
    browser: boolean,
    t: (string) => string,
};

type PropsType = {
    files: FileType[],
    folders: FolderType[],
    selected: ClipboardType,
    clipboard: ClipboardType,
    allowEdit: boolean,
    allowDelete: boolean,
    imagesOnly: boolean,
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

type AllPropsType = PassedPropsType & PropsType;
type ListStateType = {};

let index: number = 0;
const getUID = (id: string): string => {
    index += 1;
    return `${id}-${index}`;
};

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
        sort: state.ui.sort,
        ascending: state.ui.ascending,
        preview: state.ui.previewUrl,
        expanded: state.ui.expanded,
        hover: state.ui.hover,
        selected: state.ui.selected,
        clipboard: state.ui.clipboard,
        allowEdit: state.ui.allowEdit,
        allowDelete: state.ui.allowDelete,
        imagesOnly: state.ui.imagesOnly,
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
            Actions.openFolder({ id: folderId });
        };
        this.renameFolder = (folderId: string, newName: string) => {
            Actions.renameFolder(folderId, newName);
        };
        this.confirmRenameFolder = (folderId: string) => {
            if (this.props.isUploadingFiles === true ||
                this.props.loadingFolderWithId !== null ||
                this.props.allowEdit === false
            ) {
                return;
            }
            Actions.confirmRenameFolder(folderId);
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
                this.props.imagesOnly === true &&
                file.thumb === null) {          // only image file types have a thumb
                return null;
            }

            return (<File
              key={getUID(`file-${file.id}`)}
              file={file}
              hovering={this.props.hover === (i -= 1)}
              selectFile={Actions.selectFile}
              deleteFile={Actions.deleteFile}
              showPreview={Actions.showPreview}
              confirmDelete={Actions.confirmDeleteFile}
              selected={this.props.selected}
              clipboard={this.props.clipboard}
              browser={this.props.browser}
              deleteFileWithId={this.props.deleteFileWithId}
              allowEdit={this.props.allowEdit}
              allowDelete={this.props.allowDelete}
              showingRecycleBin={this.props.showingRecycleBin}
            />);
        }, this.props.files);

        // sorted folder listing
        let folders = R.map((folder: FolderType): React$Element<*> => (<Folder
          hovering={this.props.hover === (i -= 1)}
          key={getUID(`folder-${folder.id}`)}
          folder={folder}
          allowEdit={this.props.allowEdit}
          allowDelete={this.props.allowDelete}
          selectFolder={Actions.selectFolder}
          deleteFolder={Actions.deleteFolder}
          selected={this.props.selected}
          clipboard={this.props.clipboard}
          browser={this.props.browser}
          openFolder={this.openFolder}
          renameFolder={this.renameFolder}
          confirmRenameFolder={this.confirmRenameFolder}
          confirmDelete={Actions.confirmDeleteFolder}
          deleteFolderWithId={this.props.deleteFolderWithId}
          loadingFolderWithId={this.props.loadingFolderWithId}
          renameFolderWithId={this.props.renameFolderWithId}
          showingRecycleBin={this.props.showingRecycleBin}
        />), this.props.folders);

        // reverse listings when the sort direction is reversed
        if (!this.props.ascending) {
            folders = folders.reverse();
            files = files.reverse();
        }

        // show button that leads back to parent directory
        let backToParent = null;
        if (this.props.parentFolder !== null) {
            backToParent = (<ParentFolder
              key={getUID(`folder-${this.props.parentFolder.name}`)}
              folder={this.props.parentFolder}
              openFolder={this.openFolder}
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
