/**
 * @file       List that shows all files and folders in the current folder. All
 *             items are shown as a row. See the files file.react.js and
 *             folder.react.js
 */
import React, { PropTypes } from 'react';
import File, { fileShape } from './file.react';
import Folder, { folderShape } from './folder.react';

export default class List extends React.Component {

    static propTypes = {
        files: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        selected: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        clipboard: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        folders: PropTypes.arrayOf(PropTypes.shape(folderShape)).isRequired,
        browser: PropTypes.bool.isRequired,
        images_only: PropTypes.bool.isRequired,
        onSelect: PropTypes.func.isRequired,
        onPreview: PropTypes.func.isRequired,
        onDeleteFile: PropTypes.func.isRequired,
        onDeleteFolder: PropTypes.func.isRequired,
        onConfirmDelete: PropTypes.func.isRequired,
        onOpenFolder: PropTypes.func.isRequired,
        ascending: PropTypes.bool.isRequired,
        loading_folder: PropTypes.number,
        uploading_files: PropTypes.bool.isRequired,
        hover: PropTypes.number.isRequired,
        parent_folder: PropTypes.number,
    }

    static defaultProps = {
        loading_folder: null,
        parent_folder: null,
    }

    render() {
        // console.log(this.props);
        let i = this.props.folders.length + this.props.files.length;

        // sorted file listing
        let files = Object.entries(this.props.files).map(([index, file]) => {
            // hide non-images when the images only option is passed to the form
            if (!this.props.browser && this.props.images_only && !file.thumb) {
                return null;
            }

            // index = this.props.ascending
            //   ? this.props.folders.length + index
            //   : this.props.folders.length + this.props.files.length - index - 1;

            return (<File
              key={`file-${file.id}`}
              file={file}
              hovering={this.props.hover === --i}
              onSelect={this.props.onSelect}
              onPreview={this.props.onPreview}
              selected={this.props.selected}
              clipboard={this.props.clipboard}
              browser={this.props.browser}
              confirm_delete={this.props.confirm_delete}
              onDelete={this.props.onDeleteFile}
              onConfirmDelete={this.props.onConfirmDelete}
            />);
        });

        // sorted folder listing
        let folders = Object.entries(this.props.folders).map(([index, folder]) =>

      // index = this.props.ascending
      //   ? index
      //   : this.props.files.length - index + 1;

            <Folder
              hovering={this.props.hover === --i}
              key={`folder-${folder.id}`}
              parent={false}
              folder={folder}
              onOpenFolder={this.props.onOpenFolder}
              onDelete={this.props.onDeleteFolder}
              loading={this.props.loading_folder}
            />);

    // reverse listings when the sort direction is reversed
        if (!this.props.ascending) {
            folders = folders.reverse();
            files = files.reverse();
        }

    // show parent directory button
        let parent = null;

        if (this.props.parent_folder !== null) {
            parent = (<Folder
              key={`folder-${this.props.parent_folder.name}`}
              parent={true}
              folder={this.props.parent_folder}
              loading={this.props.loading_folder}
              onOpenFolder={() => {
                  if (this.props.uploading_files === true || this.props.loading_folder !== -1) {
                      return;
                  }
                  this.props.onOpenFolder(this.props.parent_folder.id);
              }}
            />);
        }

        // console.log('this props loading', this.props.loading)

        const loadingList = this.props.loading_folder === -1 ? 'loaded' : 'loading';

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
