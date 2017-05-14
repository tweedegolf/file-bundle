// @flow
/**
 * @file       Component renders a toolbar at the top of the filebrowser. This
 *             toolbar contains buttons for cut & paste, for uploading new files
 *             and for creating new folders.
 */
import React from 'react';
import { translate } from 'react-i18next';
import classNames from 'classnames';

type PropsType = {
    allowUpload: boolean,
    allowNewFolder: boolean,
    onAddFolder: (folderName: string) => void,
    uploadFiles: (fileList: global.FileList) => void,
    showRecycleBin: () => void,
    hideRecycleBin: () => void,
    onCancel: () => void,
    onPaste: () => void,
    onCut: () => void,
    isUploadingFiles: boolean,
    isAddingFolder: boolean,
    browser: boolean,
    selected: FileType[],
    clipboard: FileType[],
    loadingFolderWithId?: null | string,
    t: (string) => string,
    showingRecycleBin: boolean,
};

type DefaultPropsType = {
    loadingFolderWithId: null | string
};
type ToolbarStateType = {
    showForm: boolean
};

class Toolbar
    extends React.Component<DefaultPropsType, PropsType, ToolbarStateType> {
    static defaultProps = {
        loadingFolderWithId: null,
    }

    constructor() {
        super();
        this.state = {
            showForm: false,
        };

        this.onAddFolder = () => {
            this.setState({ showForm: false });
            const name = this.folderName.value;
            if (name !== '') {
                this.props.onAddFolder(name);
            }
        };

        this.onKeyUp = (e: SyntheticEvent) => {
            if (e.which === 13) {
                const name = this.folderName.value;
                if (name !== '') {
                    e.preventDefault();
                    this.props.onAddFolder(name);
                }
            } else if (e.keyCode === 27) {
                e.preventDefault();
                this.setState({ showForm: false });
            }
        };

        this.onShowForm = () => {
            this.setState({
                showForm: true,
            }, () => {
                this.folderName.value = '';
                this.folderName.focus();
            });
        };

/*
        // hide create new folder popup if user clicks somewhere outside the popup
        addEventListener('mousedown', e => {
            if (e.target !== this.refs.button_add_folder &&
               e.target !== this.refs.button_save_folder &&
               e.target !== this.folderName) {
                this.setState({ showForm: false });
            }
        });
*/
    }

    state: ToolbarStateType
    onKeyUp: (e: SyntheticEvent) => void
    onShowForm: () => void
    onAddFolder: () => void
    showRecycleBin: () => void
    hideRecycleBin: () => void
    folderName: HTMLInputElement
    props: PropsType

    render(): React$Element<*> {
        const loader = this.props.isUploadingFiles ? <span className="fa fa-circle-o-notch fa-spin" /> : null;
        const newFolderClass = classNames('btn btn-sm btn-default pull-right', { hide: this.state.showForm });
        let buttonRecycleBin;
        let actions = null;
        let buttonUpload = null;
        let buttonCreateFolder = null;

        if (this.props.showingRecycleBin === true) {
            buttonRecycleBin = (<button
              type="button"
              className="btn btn-sm btn-default btn-file pull-right"
              onClick={this.props.hideRecycleBin}
            >
                <span className="text-label">{this.props.t('toolbar.back')}</span>
            </button>);
        } else {
            buttonRecycleBin = (<button
              type="button"
              className="btn btn-sm btn-default btn-file pull-right"
              onClick={this.props.showRecycleBin}
              // disabled={this.props.recycleBinEmpty}
            >
                <span className="fa fa-trash-o" />
            </button>);

            if (this.props.allowUpload === true) {
                buttonUpload = (<span
                  className="btn btn-sm btn-default btn-file pull-right"
                  disabled={this.props.isUploadingFiles}
                >
                    <span className="fa fa-arrow-circle-o-up" />
                    <span className="text-label">{this.props.t('toolbar.upload')}</span>
                    {loader}
                    <input
                      type="file"
                      multiple="multiple"
                      onChange={this.props.uploadFiles}
                    />
                </span>);
            }

            if (this.props.allowNewFolder === true) {
                buttonCreateFolder = (<button
                  type="button"
                  className={newFolderClass}
                  onClick={this.onShowForm}
                  disabled={this.props.isAddingFolder}
                >
                    <span className="fa fa-folder-o" />
                    <span className="text-label">{this.props.t('toolbar.createFolder')}</span>
                    {this.props.isAddingFolder ? <span className="fa fa-circle-o-notch fa-spin" /> : null}
                </button>);
            }

            if (this.props.browser === true) {
                actions = (<div className="pull-left">
                    <button
                      type="button"
                      className="btn btn-sm btn-default"
                      disabled={this.props.selected.length === 0}
                      // files that are currently in selected will be moved to the clipboard
                      onClick={this.props.onCut}
                    >
                        <span className="fa fa-cut" />
                        <span className="text-label">{this.props.t('toolbar.cut')}</span>
                        {this.props.selected.length > 0 ? ` (${this.props.selected.length})` : null}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-default"
                      disabled={this.props.clipboard.length === 0}
                      onClick={this.props.onPaste}
                    >
                        <span className="fa fa-paste" />
                        <span className="text-label">{this.props.t('toolbar.paste')}</span>
                        {this.props.clipboard.length > 0 ? ` (${this.props.clipboard.length})` : null}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-default"
                      disabled={this.props.clipboard.length + this.props.selected.length === 0}
                      onClick={this.props.onCancel}
                    >
                        <span className="fa fa-times-circle-o" />
                        <span className="text-label">{this.props.t('toolbar.cancel')}</span>
                    </button>
                </div>);
            }
        }

        return (
            <div className="toolbar">
                {actions}
                {buttonRecycleBin}
                {buttonCreateFolder}
                <div className={`form-inline pull-right ${this.state.showForm ? '' : 'hide'}`}>
                    <input
                      className="form-control input-sm"
                      ref={(input: HTMLInputElement) => { this.folderName = input; }}
                      type="text"
                      placeholder={this.props.t('toolbar.folderName')}
                      onKeyUp={this.onKeyUp}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-success pull-right"
                      onClick={this.onAddFolder}
                    >
                        <span className="fa fa-save" />
                        <span className="text-label">{this.props.t('toolbar.save')}</span>
                    </button>
                </div>
                {buttonUpload}
            </div>
        );
    }
}

export default translate('common')(Toolbar);

