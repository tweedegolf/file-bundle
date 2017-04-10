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
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    parent: PropTypes.number,
    type: PropTypes.string,
    size: PropTypes.string,
    size_bytes: PropTypes.number,
};

const Folder = (props) => {
    const folder = props.folder;
    const className = `folder${folder.new ? ' success' : ''}${props.hovering ? ' selected' : ''}`;

    let confirm = null;
    let btnDelete = null;

    if (props.deleteFolderWithId === folder.id) {
        confirm = (<div className="confirm">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                  e.stopPropagation();
                  props.confirmDelete(null);
              }}
            >
                <span className="text-label">Annuleren</span>
                <span className="fa fa-times" />
            </button>

            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={(e) => {
                  e.stopPropagation();
                  props.deleteFolder(folder.id);
              }}
            >
                <span className="text-label">Definitief verwijderen</span>
                <span className="fa fa-trash-o" />
            </button>
        </div>);
    } else if (props.backToParent === false) {
        btnDelete = (<button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={(e) => {
              e.stopPropagation();
              props.confirmDelete(folder.id);
          }}
        >
            <span className="fa fa-trash-o" />
        </button>);
    }

    let icon = <span className="fa fa-folder" />;
    if (props.loading && props.loading === folder.id) {
        icon = <span className="fa fa-circle-o-notch fa-spin" />;
    }

    if (props.backToParent === true) {
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

    const p = {
        onClick: () => {
            props.onOpenFolder(folder.id);
        },
        className,
    };
    return (
        <tr {...p}>
            <td className="select" />
            <td className="preview">{icon}</td>
            <td className="name">{folder.name}</td>
            <td className="size">
                {folderCount}
                {fileCount}
                {confirm}
            </td>
            <td className="date">{folder.created}</td>
            <td className="buttons">{btnDelete}</td>
        </tr>
    );
};

Folder.propTypes = {
    folder: PropTypes.shape(folderShape).isRequired,
    hovering: PropTypes.bool,
    onOpenFolder: PropTypes.func.isRequired,
    loading: PropTypes.number,
    backToParent: PropTypes.bool.isRequired,
    deleteFolder: PropTypes.func,
    confirmDelete: PropTypes.func,
    deleteFolderWithId: PropTypes.number,
};

Folder.defaultProps = {
    hovering: null,
    loading: null,
    deleteFolder: null,
    confirmDelete: null,
    deleteFolderWithId: null,
};

export default Folder;
