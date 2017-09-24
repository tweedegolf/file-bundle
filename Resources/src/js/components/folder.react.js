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
    allowRename: boolean,
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
    constructor() {
        super();
        this.rename = (e: SyntheticEvent) => {
            const name = this.inputRename.value;
            if (name !== '' && name !== this.props.folder.name) {
                e.preventDefault();
                this.props.renameFolder(this.props.folder.id, name);
            } else if (name === this.props.folder.name) {
                e.preventDefault();
                this.props.confirmRenameFolder(null);
            }
        };
        this.cancelRename = (e: SyntheticEvent) => {
            e.preventDefault();
            // this.props.confirmDelete(null);
            this.props.confirmRenameFolder(null);
        };
    }
    state: FolderStateType
    componentDidMount() {
        // close confirm rename of delete pane when the user clicks somewhere outside the pane
        // this.mouseDownListener = (e: MouseEvent) => {
        //     if (e.target !== this.inputRename && e.target !== this.buttonRename && e.target !== this.buttonDelete) {
        //         e.preventDefault();
        //         this.props.confirmRenameFolder(null);
        //         this.props.confirmDelete(null);
        //     }
        // };
        // document.addEventListener('mousedown', this.mouseDownListener);
    }
    componentDidUpdate() {
        if (this.props.renameFolderWithId === this.props.folder.id) {
            // if (this.inputRename.value === '') {
            //     this.inputRename.value = this.props.folder.name;
            // }
            this.inputRename.value = this.props.folder.name;
            this.inputRename.focus();
            this.inputRename.select();
        }
    }
    componentWillUnmount() {
        // document.removeEventListener('mousedown', this.mouseDownListener);
    }
    onKeyUp = (e: SyntheticEvent) => {
        if (e.which === 13) {
            // <enter> submits new name
            this.rename(e);
        } else if (e.keyCode === 27) {
            // <escape> cancels rename
            this.cancelRename(e);
        }
    };
    buttonDelete: HTMLButtonElement
    buttonRename: HTMLButtonElement
    inputRename: HTMLInputElement
    props: PropsType
    mouseDownListener: (MouseEvent) => void
    rename: (SyntheticEvent) => mixed
    cancelRename: (SyntheticEvent) => void

    render(): React$Element<*> {
        // console.log(this.props.renameFolderWithId);
        const folder = this.props.folder;
        let className = classNames('folder',
            { success: folder.is_new === true },
            { selected: this.props.hovering },
            { 'fa fa-circle-o-notch fa-spin': this.props.loadingFolderWithId === folder.id },
            { danger: this.props.deleteFolderWithId === folder.id },
        );

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

        const clipboardFolderIds = this.props.clipboard.folderIds;
        const selectedFolderIds = this.props.selected.folderIds;
        const hasSelectedItems = selectedFolderIds.length + clipboardFolderIds.length > 0;
        const isDeletingFolder = this.props.deleteFolderWithId === folder.id;
        const isRenamingFolder = this.props.renameFolderWithId === folder.id;

        // console.log('hasSelectedItems', hasSelectedItems);
        // console.log('isDeletingFolder', isDeletingFolder);
        // console.log('isRenamingFolder', isRenamingFolder);

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

        // click handler for folder row <tr>
        const p = {
            onClick: () => {
                if (isRenamingFolder === false) {
                    this.props.openFolder(folder.id);
                }
            },
            className,
        };

        // console.log(selectedFolderIds.length);
        let checkboxTD = <td />;
        if (this.props.browser === true) {
            if (hasSelectedItems) {
                checkboxTD = <td><span className={onClipboard ? 'fa fa-thumb-tack' : ''} /></td>;
                if (onClipboard) {
                    className += ' cut';
                }
            } else if (this.props.allowEdit === true) {
                const p1 = {
                    onClick: (e: SyntheticEvent) => {
                        e.stopPropagation();
                        if (clipboardFolderIds.length === 0) {
                            this.props.selectFolder(folder.id);
                        }
                    },
                };
                checkboxTD = <td {...p1}><span><input type="checkbox" checked={isSelected} readOnly /></span></td>;
            }
        }


        let confirmPane = null;
        let buttonDelete = null;
        if (
            this.props.allowDelete === true &&
            this.props.showingRecycleBin === false &&
            isRenamingFolder === false
        ) {
            if (isDeletingFolder === true) {
                // user has clicked the delete button; show the confirm pane
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
                    &nbsp;
                    <button
                        type="button"
                        ref={(button: HTMLButtonElement) => { this.buttonDelete = button; }}
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
            } else if (hasSelectedItems === false) {
                // no delete action has started yet: show the delete button
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
        }

        let renameIcon = null;
        let renamePane = null;
        let folderNameTD = <td className="name">{folder.name}</td>;
        if (
            this.props.allowEdit === true &&
            this.props.showingRecycleBin === false &&
            isDeletingFolder === false
        ) {
            if (isRenamingFolder === true) {
                renamePane = (<div className="confirm">
                    <button
                        type="button"
                        className="btn btn-xs btn-primary"
                        onClick={this.cancelRename}
                        ref={(button: HTMLButtonElement) => { this.buttonRename = button; }}
                    >
                        <span className="text-label">{this.props.t('rename.cancel')}</span>
                        <span className="fa fa-times" />
                    </button>
                    &nbsp;
                    <button
                        type="button"
                        className="btn btn-xs btn-success"
                        onClick={this.rename}
                    >
                        <span className="text-label">{this.props.t('rename.ok')}</span>
                        <span className="fa fa-check" />
                    </button>
                </div >);
            } else {
                renameIcon = (<button
                    type="button"
                    className="btn btn-xs btn-primary icon-rename"
                    onClick={(e: SyntheticEvent) => {
                        e.stopPropagation();
                        if (isRenamingFolder === false) {
                            this.props.confirmRenameFolder(folder.id);
                        }
                    }}
                >
                    <span className="fa fa-1x fa-pencil-square-o" />
                </button>);
            }

            folderNameTD = (<td>
                <span className={`${isRenamingFolder ? 'hide' : ''}`}>{folder.name}</span>
                <input
                    className={`form-control input-sm rename ${isRenamingFolder ? '' : 'hide'}`}
                    ref={(input: HTMLInputElement) => { this.inputRename = input; }}
                    type="text"
                    onKeyUp={this.onKeyUp}
                />
            </td>);
        }

        const separator = buttonDelete !== null && renameIcon !== null ? '\ ' : null;

        return (
            <tr {...p}>
                {checkboxTD}
                <td><span className="fa fa-folder" /></td>
                {folderNameTD}
                <td >
                    {folderCount}
                    {fileCount}
                </td>
                <td>{folder.created}</td>
                <td>
                    <div className="actions">
                        {buttonDelete}
                        {separator}
                        {renameIcon}
                        {confirmPane}
                        {renamePane}
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
