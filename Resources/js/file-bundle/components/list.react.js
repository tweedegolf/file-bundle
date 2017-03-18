/**
 * @file       List that shows all files and folders in the current folder. All
 *             items are shown as a row. See the files file.react.js and
 *             folder.react.js
 */
import React, { PropTypes } from 'react';
import File, { filePropTypes} from './file.react';
import Folder from './folder.react';

export default class List extends React.Component {

    static propTypes = {
        files: PropTypes.arrayOf(File.propTypes.file).isRequired,
        folders: PropTypes.arrayOf(Folder.propTypes.folder).isRequired,
        browser: PropTypes.bool.isRequired,
        images_only: PropTypes.bool.isRequired,
    }

    render() {
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
              onSelect={this.props.onSelect.bind(this)}
              onPreview={this.props.onPreview.bind(this)}
              selected={this.props.selected}
              clipboard={this.props.clipboard}
              browser={this.props.browser}
              confirm_delete={this.props.confirm_delete}
              onDelete={this.props.onDelete.bind(this)}
              onConfirmDelete={this.props.onConfirmDelete.bind(this)}
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
              onOpenFolder={this.props.onOpenFolder.bind(this)}
              onDelete={this.props.onDeleteFolder.bind(this)}
              loading={this.props.loading}
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
              loading={this.props.loading}
              onOpenFolder={() => {
                  this.props.onOpenFolder(this.props.parent_folder.id);
              }}
            />);
        }

    // console.log('this props loading', this.props.loading)

        const loading_list = this.props.loading === -1
      ? 'loaded'
      : 'loading';

        let loadingMessage = null;
        if (loading_list === 'loading') {
            loadingMessage = <tr><td>{'loading...'}</td></tr>;
        }

        return (<tbody className={loading_list}>
            {loadingMessage}
            {parent}
            {folders}
            {files}
        </tbody>);
    }
}
