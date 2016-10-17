import React from 'react';

import File from './file.react.js';
import Folder from './folder.react.js';

export default class List extends React.Component {

  render() {
    let i = this.props.folders.length + this.props.files.length

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
        key={'file-' + file.id}
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
    let folders = Object.entries(this.props.folders).map(([index, folder]) => {

      // index = this.props.ascending
      //   ? index
      //   : this.props.files.length - index + 1;

      return <Folder
        hovering={this.props.hover === --i}
        key={'folder-' + folder.id}
        parent={false}
        folder={folder}
        onOpenFolder={this.props.onOpenFolder.bind(this)}
        onDelete={this.props.onDeleteFolder.bind(this)}
        loading={this.props.loading}
      />;
    });

    // reverse listings when the sort direction is reversed
    if (!this.props.ascending) {
      folders = folders.reverse();
      files = files.reverse();
    }

    // show parent directory button
    let parent = null;

    if (this.props.parent_folder !== null) {
      parent = <Folder
        key={'folder-' + this.props.parent_folder.name}
        parent={true}
        folder={this.props.parent_folder}
        loading={this.props.loading}
        onOpenFolder={() => {
          this.props.onOpenFolder(this.props.parent_folder.id)
        }}
      />;
    }

    // console.log('this props loading', this.props.loading)

    let loading_list = this.props.loading
      ? 'loaded'
      : 'loading'

    return <tbody className={loading_list}>
      {parent}
      {folders}
      {files}
    </tbody>
  }
}
