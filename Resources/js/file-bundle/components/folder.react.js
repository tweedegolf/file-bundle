/**
 * @file       Component that shows a folder in the filelist. It consist of a
 *             row containing a folder icon, the name, creation date, number of
 *             files and folders in the folder. If you click on the row the
 *             browser will open the folder and a spinner icon is shown. If the
 *             folder is empty, the row will show a delete button as well.
 */

import React, { PropTypes } from 'react';

export default class Folder extends React.Component {

    static propTypes = {
        folder: PropTypes.string.isRequired,
        hovering: PropTypes.bool.isRequired,
        onDelete: PropTypes.func.isRequired,
        openFolder: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        parent: PropTypes.bool.isRequired,
    }

    onDelete(e) {
        e.stopPropagation();
        this.props.onDelete(this.props.folder.id);
    }

    render() {
        const folder = this.props.folder;
        const class_name = `folder${folder.new ? ' success' : ''}${this.props.hovering ? ' selected' : ''}`;
        let icon = <span className="fa fa-folder" />;
        let delete_btn = null;

        if (folder.file_count === 0 && folder.folder_count === 0 && this.props.parent === false) {
            delete_btn = (<button type="button" className="btn btn-sm btn-danger" onClick={this.onDelete.bind(this)}>
                <span className="fa fa-trash-o" />
            </button>);
        }

        if (this.props.loading && this.props.loading === folder.id) {
            icon = <span className="fa fa-circle-o-notch fa-spin" />;
        }

        if (this.props.parent === true) {
            icon = <span className="fa fa-chevron-up" />;
      // class_name = 'folder muted'
        }

        let file_count = null;
        if (folder.file_count > 0) {
            file_count = (<span>
                {folder.file_count}
                <span className="fa fa-file-o" />
            </span>);
        }

        let folder_count = null;
        if (folder.folder_count > 0) {
            folder_count = (<span>
                {folder.folder_count}
                <span className="fa fa-folder-o" />
            </span>);
        }

        return (
            <tr className={class_name} onClick={this.props.onOpenFolder.bind(this, folder.id)}>
                <td className="select" />
                <td className="preview">{icon}</td>
                <td className="name">{folder.name}</td>
                <td className="size">
                    {folder_count}
                    {file_count}
                </td>
                <td className="date">{folder.created}</td>
                <td className="buttons">{delete_btn}</td>
            </tr>
        );
    }
}
