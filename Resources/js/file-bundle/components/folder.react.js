import React from 'react';

export default class Folder extends React.Component {

    render() {
        let folder = this.props.folder;
        let class_name = 'folder' + (folder.new ? ' success' : '') + (this.props.hovering ? ' selected' : '');
        let icon = <span className="fa fa-folder" />;
        let delete_btn = null;

        if (folder.file_count === 0 && folder.folder_count === 0) {
            delete_btn = <button type="button" className="btn btn-xs btn-danger" onClick={this.onDelete.bind(this)}>
                <span className="fa fa-trash-o" />
            </button>;
        }

        if (this.props.loading && this.props.loading === folder.id) {
            icon = <span className="fa fa-circle-o-notch fa-spin" />;
        }

        if (this.props.parent) {
            icon = <span className="fa fa-chevron-up" />;
            // class_name = 'folder muted';
        }

        return (
            <tr className={class_name} onClick={this.props.onOpenFolder.bind(this, folder.id)}>
                <td />
                <td>{icon}</td>
                <td>{folder.name}</td>
                <td className="size">
                    <span className="fa fa-folder" />
                    {folder.folder_count}
                    <span className="fa fa-file" />
                    {folder.file_count}
                </td>
                <td>{folder.created}</td>
                <td>{delete_btn}</td>
            </tr>
        );
    }

    onDelete(e) {
        e.stopPropagation();
        this.props.onDelete(this.props.folder.id);
    }
}