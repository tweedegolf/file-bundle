// @flow
/**
 * @file       Component that shows a folder in the filelist. It consist of a
 *             row containing a folder icon, the name, creation date, number of
 *             files and folders in the folder. If you click on the row the
 *             browser will open the folder and a spinner icon is shown. If the
 *             folder is empty, the row will show a delete button as well.
 */
import React from 'react';
import { translate } from 'react-i18next';
import classNames from 'classnames';

type PropsType = {
    folder: FolderType,
    allowDelete?: boolean,
    openFolder: (id: string) => void,
    confirmRenameFolder: (id: null | string) => void,
    renameFolder: (id: string, newName: string) => void,
    backToParent: boolean,
    loading?: string,
    hovering?: boolean,
    deleteFolder?: (id: string) => void,
    confirmDelete?: (id: null | string) => void,
    deleteFolderWithId?: null | string,
    renameFolderWithId?: null | string,
    t: (string) => string,
};

type DefaultPropsType = {
    allowDelete: boolean,
};
type FolderStateType = {
    showForm: boolean
};

class Folder extends React.Component<DefaultPropsType, PropsType, FolderStateType> {
    static defaultProps = {
        allowDelete: true,
    }

    // constructor() {
    //     super();
    //     this.state = { showForm: false };
    // }

    state: FolderStateType
    componentDidUpdate() {
        if (this.props.renameFolderWithId === this.props.folder.id) {
            this.folderName.value = this.props.folder.name;
            this.folderName.focus();
            this.folderName.select();
        }
    }

    onKeyUp = (e: SyntheticEvent) => {
        // <enter> submits new name
        if (e.which === 13) {
            const name = this.folderName.value;
            if (name !== '') {
                e.preventDefault();
                // this.setState({ showForm: false });
                this.props.renameFolder(this.props.folder.id, name);
            }
        // <escape> cancels rename
        } else if (e.keyCode === 27) {
            e.preventDefault();
            this.props.confirmRenameFolder(null);
            // this.setState({ showForm: false });
        }
    };
    folderName: HTMLInputElement
    props: PropsType

    render(): React$Element<*> {
        let confirmPane = null;
        let buttonDelete = null;
        const folder = this.props.folder;
        const className = classNames('folder',
            { success: folder.isNew === true },
            { selected: this.props.hovering });

        // user has clicked the delete button; show the confirm pane
        if (this.props.deleteFolderWithId === folder.id &&
            typeof this.props.confirmDelete !== 'undefined' &&
            typeof this.props.deleteFolder !== 'undefined' &&
            this.props.allowDelete === true
        ) {
            const confirmDelete = this.props.confirmDelete;
            const deleteFolder = this.props.deleteFolder;
            confirmPane = (<div className="confirm">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={(e: SyntheticEvent) => {
                      e.stopPropagation();
                      confirmDelete(null);
                  }}
                >
                    <span className="text-label">{this.props.t('remove.cancel')}</span>
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
                    <span className="text-label">{this.props.t('remove.permanently')}</span>
                    <span className="fa fa-trash-o" />
                </button>
            </div>);
        // no delete action has started yet: show the delete button
        } else if (this.props.backToParent === false &&
            typeof this.props.confirmDelete !== 'undefined' &&
            this.props.allowDelete === true
        ) {
            const confirmDelete = this.props.confirmDelete;
            buttonDelete = (<button
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
        if (this.props.loading && this.props.loading === folder.id) {
            icon = <span className="fa fa-circle-o-notch fa-spin" />;
        }

        if (this.props.backToParent === true) {
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
                this.props.openFolder(folder.id);
            },
            className,
        };

        const p2 = {
            onClick: (e: SyntheticEvent) => {
                e.stopPropagation();
                if (this.props.renameFolderWithId !== folder.id) {
                    this.props.confirmRenameFolder(folder.id);
                    // this.setState({ showForm: true }, () => {
                    //     this.folderName.value = folder.name;
                    //     this.folderName.focus();
                    //     this.folderName.select();
                    // });
                }
            },
        };
        const show: boolean = this.props.renameFolderWithId === folder.id;
        // const show: boolean = this.state.showForm;
        const folderNameTD = (<td className="name" {...p2}>
            <span className={`${show ? 'hide' : ''}`}>{folder.name}</span>
            <input
              className={`form-control input-sm ${show ? '' : 'hide'}`}
              ref={(input: HTMLInputElement) => { this.folderName = input; }}
              type="text"
              onKeyUp={this.onKeyUp}
            />
        </td>);

        return (
            <tr {...p}>
                <td className="select" />
                <td className="preview">{icon}</td>
                {folderNameTD}
                <td className="size">
                    {folderCount}
                    {fileCount}
                    {confirmPane}
                </td>
                <td className="date">{folder.created}</td>
                <td className="buttons">{buttonDelete}</td>
            </tr>
        );
    }
}

Folder.defaultProps = {
    hovering: null,
    loading: null,
    allowDelete: true,
    deleteFolder: null,
    confirmDelete: null,
    deleteFolderWithId: null,
    renameFolderWithId: null,
};

export default translate('common')(Folder);
