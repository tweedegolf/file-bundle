import React from 'react';

export default class Folder extends React.Component {

    render() {
        let folder = this.props.folder;
        let class_name = 'folder' + (folder.new ? ' success' : '') + (this.props.hovering ? ' selected' : '');
        let icon = <span className="fa fa-folder" />;

        if (this.props.loading && this.props.loading === folder.id) {
            icon = <span className="fa fa-circle-o-notch fa-spin" />;
        }

        return (
            <tr className={class_name} onClick={this.props.onOpenFolder.bind(this, folder.id)}>
                <td />
                <td>{icon}</td>
                <td>{folder.name}</td>
                <td>{folder.size}</td>
                <td>{folder.created}</td>
                <td />
            </tr>
        );
    }
}