// @flow
/**
 * @file       Component that shows a folder in the filelist. It consist of a
 *             row containing a folder icon, the name, creation date, number of
 *             files and folders in the folder. If you click on the row the
 *             browser will open the folder and a spinner icon is shown. If the
 *             folder is empty, the row will show a delete button as well.
 */
import R from 'ramda';
import React from 'react';
import { translate } from 'react-i18next';
import classNames from 'classnames';

type PropsType = {
    folder: FolderType,
    browser: boolean,
    allowEdit: boolean,
    allowDelete: boolean,
    selected: ClipboardType,
    clipboard: ClipboardType,
    openFolder: (id: string) => void,
    selectFolder: (id: string) => void,
    confirmRenameFolder: (id: null | string) => void,
    renameFolder: (id: string, newName: string) => void,
    showingRecycleBin: boolean,
    loadingFolderWithId: string,
    hovering: boolean,
    deleteFolder: (id: string) => void,
    confirmDelete: (id: null | string) => void,
    deleteFolderWithId?: null | string,
    renameFolderWithId?: null | string,
    t: (string) => string,
};

type DefaultPropsType = {};
type FolderStateType = {};

class Folder extends React.Component<DefaultPropsType, PropsType, FolderStateType> {
    static defaultProps = {}
    state: FolderStateType
    componentDidMount() {
        this.mouseDownListener = (e: MouseEvent) => {
            // console.log('mousedown', this.props.folder.id);
            if (e.target !== this.folderName && this.props.renameFolderWithId === this.props.folder.id) {
                e.preventDefault();
                this.props.confirmRenameFolder(null);
            }
        };
    }
    componentWillUpdate(nextProps: PropsType, nextState: FolderStateType) {
        if (this.props.renameFolderWithId !== null && nextProps.renameFolderWithId === null) {
            this.closeRenameMenu = true;
            // console.log(this.closeRenameMenu, this.props.renameFolderWithId, nextProps.renameFolderWithId);
        } else {
            this.closeRenameMenu = false;
        }
    }
    componentDidUpdate() {
        if (this.props.renameFolderWithId === this.props.folder.id) {
            if (this.folderName.value === '') {
                this.folderName.value = this.props.folder.name;
            }
            this.folderName.focus();
            this.folderName.select();
        }
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.mouseDownListener);
    }

    onKeyUp = (e: SyntheticEvent) => {
        // <enter> submits new name
        if (e.which === 13) {
            const name = this.folderName.value;
            if (name !== '' && name !== this.props.folder.name) {
                e.preventDefault();
                this.props.renameFolder(this.props.folder.id, name);
            }
        // <escape> cancels rename
        } else if (e.keyCode === 27) {
            e.preventDefault();
            this.props.confirmRenameFolder(null);
        }
    };
    closeRenameMenu: boolean
    folderName: HTMLInputElement
    props: PropsType
    mouseDownListener: (MouseEvent) => mixed

    render(): React$Element<*> {
        const folder = this.props.folder;
        let className = classNames('folder',
            { success: folder.is_new === true },
            { selected: this.props.hovering },
            { 'fa fa-circle-o-notch fa-spin': this.props.loadingFolderWithId === folder.id },
        );
        // @TODO: spinner is never shown, instead a message 'loading' is displayed in the file browser -> is this okay?
        // console.log(this.props.loadingFolderWithId, folder.id, this.props.loadingFolderWithId === folder.id, className);
        let p1 = {};
        let checkbox = null;
        let confirmPane = null;
        let buttonDelete = null;
        let folderNameTD = <td className="name">{folder.name}</td>;
        const icon = <span className="fa fa-folder" />;

        if (this.props.browser === true) {
            const clipboardFolderIds = this.props.clipboard.folderIds;
            const selectedFolderIds = this.props.selected.folderIds;

            let onClipboard = false;
            if (clipboardFolderIds.length > 0) {
                const index = R.find((folderId: string): boolean =>
                    folder.id === folderId, clipboardFolderIds);
                onClipboard = R.isNil(index) === false;
            }

            let isSelected = false;
            if (selectedFolderIds.length > 0) {
                const index = R.find((folderId: string): boolean =>
                    folder.id === folderId, selectedFolderIds);
                isSelected = R.isNil(index) === false;
            }

            if (this.props.allowEdit) {
                checkbox = <input type="checkbox" checked={isSelected} readOnly />;
                if (clipboardFolderIds.length + this.props.clipboard.fileIds.length > 0) {
                    checkbox = <span className={onClipboard ? 'fa fa-thumb-tack' : ''} />;
                    if (onClipboard) {
                        className += ' cut';
                    }
                } else {
                    p1 = {
                        onClick: (e: SyntheticEvent) => {
                            e.stopPropagation();
                            if (clipboardFolderIds.length === 0) {
                                this.props.selectFolder(folder.id);
                            }
                        },
                    };
                }
            }

            // user has clicked the delete button; show the confirm pane
            if (this.props.deleteFolderWithId === folder.id &&
                this.props.allowDelete === true
            ) {
                const confirmDelete = this.props.confirmDelete;
                const deleteFolder = this.props.deleteFolder;
                confirmPane = (<div className="confirm">
                    <button
                      type="button"
                      className="btn btn-xs btn-primary"
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
                      className="btn btn-xs btn-danger"
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
            } else if (
                selectedFolderIds.length + clipboardFolderIds.length === 0 &&
                this.props.allowDelete === true &&
                this.props.showingRecycleBin === false
            ) {
                const confirmDelete = this.props.confirmDelete;
                buttonDelete = (<button
                  type="button"
                  className="btn btn-xs btn-danger"
                  onClick={(e: SyntheticEvent) => {
                      e.stopPropagation();
                      confirmDelete(folder.id);
                  }}
                >
                    <span className="fa fa-trash-o" />
                </button>);
            }

            if (this.props.showingRecycleBin === false) {
                const p2 = {
                    onClick: (e: SyntheticEvent) => {
                        e.stopPropagation();
                        if (this.props.renameFolderWithId !== folder.id) {
                            this.props.confirmRenameFolder(folder.id);
                        }
                    },
                };
                const show: boolean = this.props.renameFolderWithId === folder.id;
                folderNameTD = (<td {...p2}>
                    <span className={`${show ? 'hide' : ''}`}>{folder.name}</span>
                    <input
                      className={`form-control input-sm ${show ? '' : 'hide'}`}
                      ref={(input: HTMLInputElement) => { this.folderName = input; }}
                      type="text"
                      onKeyUp={this.onKeyUp}
                    />
                </td>);
            }
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
                if (this.closeRenameMenu === false) {
                    this.props.openFolder(folder.id);
                } else {
                    this.closeRenameMenu = false;
                }
            },
            className,
        };

        if (this.props.renameFolderWithId === folder.id) {
            document.addEventListener('mousedown', this.mouseDownListener);
        } else {
            document.removeEventListener('mousedown', this.mouseDownListener);
        }

        return (
            <tr {...p}>
                <td {...p1}>{checkbox}</td>
                <td>{icon}</td>
                {folderNameTD}
                <td>
                    {folderCount}
                    {fileCount}
                </td>
                <td>{folder.created}</td>
                <td>
                    <div className="actions">
                        {buttonDelete}
                        {confirmPane}
                    </div>
                </td>
            </tr>
        );
    }
}

Folder.defaultProps = {
    hovering: null,
    loading: null,
    deleteFolderWithId: null,
    renameFolderWithId: null,
};

export default translate('common')(Folder);
