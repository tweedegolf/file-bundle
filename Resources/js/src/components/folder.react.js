/**
 * @file       Component that shows a folder in the filelist. It consist of a
 *             row containing a folder icon, the name, creation date, number of
 *             files and folders in the folder. If you click on the row the
 *             browser will open the folder and a spinner icon is shown. If the
 *             folder is empty, the row will show a delete button as well.
 */

import React, { PropTypes } from 'react';

export const folderShape = {
    create_ts: PropTypes.number,
    created: PropTypes.string,
    file_count: PropTypes.number.isRequired,
    folder_count: PropTypes.number.isRequired,
    id: PropTypes.number, // the id of the root folder is 'null'
    name: PropTypes.string.isRequired,
    parent: PropTypes.number,
    type: PropTypes.string,
    size: PropTypes.string,
    size_bytes: PropTypes.number,
};

const Folder = (props) => {
    const folder = props.folder;
    const className = `folder${folder.new ? ' success' : ''}${props.hovering ? ' selected' : ''}`;

    const p1 = {
        onClick: (e) => {
            e.stopPropagation();
            props.onDelete(folder.id);
        },
        type: 'button',
        className: 'btn btn-sm btn-danger',
    };
    const btnDelete = (<button {...p1}>
        <span className="fa fa-trash-o" />
    </button>);

    let icon = <span className="fa fa-folder" />;
    if (props.loading && props.loading === folder.id) {
        icon = <span className="fa fa-circle-o-notch fa-spin" />;
    }

    if (props.parent === true) {
        icon = <span className="fa fa-chevron-up" />;
        // className = 'folder muted'
    }

    let fileCount = null;
    if (folder.file_count > 0) {
        fileCount = (<span>
            {folder.file_count}
            <span className="fa fa-file-o" />
        </span>);
    }

    let folderCount = null;
    if (folder.folder_count > 0) {
        folderCount = (<span>
            {folder.folder_count}
            <span className="fa fa-folder-o" />
        </span>);
    }

    const p2 = {
        onClick: () => {
            props.onOpenFolder(folder.id);
        },
        className,
    };
    return (
        <tr {...p2}>
            <td className="select" />
            <td className="preview">{icon}</td>
            <td className="name">{folder.name}</td>
            <td className="size">
                {folderCount}
                {fileCount}
            </td>
            <td className="date">{folder.created}</td>
            <td className="buttons">{btnDelete}</td>
        </tr>
    );
};

Folder.propTypes = {
    folder: PropTypes.shape(folderShape).isRequired,
    hovering: PropTypes.bool,
    onDelete: PropTypes.func,
    onOpenFolder: PropTypes.func.isRequired,
    loading: PropTypes.number,
    parent: PropTypes.bool.isRequired,
};

Folder.defaultProps = {
    hovering: null,
    loading: null, // when loading is 'null' it actually means that the root folder is loading
    onDelete: null, // parent folder on top of list cannot be deleted
};

export default Folder;
