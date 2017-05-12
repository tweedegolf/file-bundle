// @flow
/**
 * @file       Component that shows a folder in the filelist. It consist of a
 *             row containing a folder icon, the name, creation date, number of
 *             files and folders in the folder. If you click on the row the
 *             browser will open the folder and a spinner icon is shown. If the
 *             folder is empty, the row will show a delete button as well.
 */
import React from 'react';

type PropsType = {
    folder: FolderType,
    openFolder: (id: string) => void,
    confirmRenameFolder: (id: string) => void,
    renameFolder: (id: string, newName: string) => void,
    backToParent: boolean,
    loading?: string,
    hovering?: boolean,
    deleteFolder?: (id: string) => void,
    confirmDelete?: (id: null | string) => void,
    deleteFolderWithId?: null | string,
    renameFolderWithId?: null | string,
};

// const Folder = ({
//         folder,
//         onOpenFolder,
//         backToParent,
//         loading,
//         hovering,
//         deleteFolder,
//         confirmDelete,
//         deleteFolderWithId = null,
//     }: PropsType): React$Element<*> => {
const Folder = (props: PropsType): React$Element<*> => {
    // console.log(props);
    const folder = props.folder;
    const className = `folder${folder.new ? ' success' : ''}${props.hovering ? ' selected' : ''}`;
    const confirmRenameFolder = props.confirmRenameFolder;
    const renameFolder = props.renameFolder;

    let confirm = null;
    let btnDelete = null;

    if (props.deleteFolderWithId === folder.id &&
        typeof props.confirmDelete !== 'undefined' &&
        typeof props.deleteFolder !== 'undefined') {
        const confirmDelete = props.confirmDelete;
        const deleteFolder = props.deleteFolder;
        confirm = (<div className="confirm">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={(e: SyntheticEvent) => {
                  e.stopPropagation();
                  confirmDelete(null);
              }}
            >
                <span className="text-label">Annuleren</span>
                <span className="fa fa-times" />
            </button>

            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={(e: SyntheticEvent) => {
                  e.stopPropagation();
                  deleteFolder(folder.id);
              }}
            >
                <span className="text-label">Definitief verwijderen</span>
                <span className="fa fa-trash-o" />
            </button>
        </div>);
    } else if (props.backToParent === false && typeof props.confirmDelete !== 'undefined') {
        const confirmDelete = props.confirmDelete;
        btnDelete = (<button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={(e: SyntheticEvent) => {
              e.stopPropagation();
              confirmDelete(folder.id);
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
    if (typeof folder.file_count !== 'undefined' && folder.file_count > 0) {
        fileCount = (<span>
            {folder.file_count}
            <span className="fa fa-file-o" />
        </span>);
    }

    let folderCount = null;
    if (typeof folder.folder_count !== 'undefined' && folder.folder_count > 0) {
        folderCount = (<span>
            {folder.folder_count}
            <span className="fa fa-folder-o" />
        </span>);
    }

    const p = {
        onClick: () => {
            props.openFolder(folder.id);
        },
        className,
    };

    const p2 = {
        onClick: (e: SyntheticEvent) => {
            e.stopPropagation();
            confirmRenameFolder(folder.id);
        },
    };
    let folderNameTD = <td className="name" {...p2}>{folder.name}</td>;

    if (props.renameFolderWithId === folder.id) {
        const p3 = {
            onClick: (e: SyntheticEvent) => {
                e.stopPropagation();
                renameFolder(folder.id, `piet-${Date.now()}`);
            },
            onMouseOver: (e: SyntheticEvent) => {
                e.stopPropagation();
                // props.onRenameFolder(folder.id);
            },
            onMouseOut: (e: SyntheticEvent) => {
                e.stopPropagation();
                // props.onRenameFolder(folder.id);
            },
            className,
        };
        folderNameTD = <td className="name" {...p3}>{`${folder.name} EDIT`}</td>;
    }
    return (
        <tr {...p}>
            <td className="select" />
            <td className="preview">{icon}</td>
            {folderNameTD}
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

Folder.defaultProps = {
    hovering: null,
    loading: null,
    deleteFolder: null,
    confirmDelete: null,
    deleteFolderWithId: null,
    renameFolderWithId: null,
};

export default Folder;
