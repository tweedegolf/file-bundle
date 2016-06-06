import React from 'react';
import _ from 'lodash';

import File from './file.react.js';
import Folder from './folder.react.js';

export default class List extends React.Component {

    render() {
        // sorted file listing
        let files = _.map(this.props.files, (file, index) => {

            // hide non-images when the images only option is passed to the form
            if (!this.props.browser && this.props.images_only && !file.thumb) {
                return;
            }

            index = this.props.ascending
                ? this.props.folders.length + index
                : this.props.folders.length + this.props.files.length - index - 1;

            return <File
                key={'file-' + file.id}
                file={file}
                hovering={this.props.hover === index}
                onSelect={this.props.onSelect.bind(this)}
                selected={this.props.selected}
                clipboard={this.props.clipboard}
                browser={this.props.browser}
                confirm_delete={this.props.confirm_delete}
                onDelete={this.props.onDelete.bind(this)}
                onConfirmDelete={this.props.onConfirmDelete.bind(this)}
            />;
        });

        // sorted folder listing
        let folders = _.map(this.props.folders, (folder, index) => {

            index = this.props.ascending
                ? index
                : this.props.files.length - index + 1;

            return <Folder
                hovering={this.props.hover === index}
                key={'folder-' + folder.id}
                folder={folder}
                onOpenFolder={this.props.onOpenFolder.bind(this)}
                loading={this.props.loading_folder}
            />;
        });

        // reverse listings when the sort direction is reversed
        if (!this.props.ascending) {
            folders = folders.reverse();
            files = files.reverse();
        }

        // show parent directory button
        let parent = null;
        if (this.props.current_folder.parent !== undefined) {
            parent = <Folder
                key={this.props.current_folder.parent}
                folder={{id: this.props.current_folder.parent, name: '..'}}
                loading={this.props.loading_folder}
                onOpenFolder={this.props.onOpenFolder.bind(this)}
            />;
        }

        return <tbody>
            {parent}
            {folders}
            {files}
        </tbody>;
    }
}