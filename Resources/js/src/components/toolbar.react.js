/**
 * @file       Component renders a toolbar at the top of the filebrowser. This
 *             toolbar contains buttons for cut & paste, for uploading new files
 *             and for creating new folders.
 */

import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { fileShape } from './file.react';

export default class Toolbar extends React.Component {

    static propTypes = {
        onAddFolder: PropTypes.func.isRequired,
        uploadFiles: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        onPaste: PropTypes.func.isRequired,
        onCut: PropTypes.func.isRequired,
        isUploadingFiles: PropTypes.bool.isRequired,
        loadingFolderWithId: PropTypes.number,
        isAddingFolder: PropTypes.bool.isRequired,
        browser: PropTypes.bool.isRequired,
        selected: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        clipboard: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
    }

    static defaultProps = {
        loadingFolderWithId: null,
    }

    constructor(props) {
        super(props);
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

        this.onKeyPress = (e) => {
            if (e.which === 13) {
                e.preventDefault();
                this.onAddFolder();
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

    render() {
        const loader = this.props.isUploadingFiles ? <span className="fa fa-circle-o-notch fa-spin" /> : null;
        const newFolderClass = classNames('btn btn-sm btn-default pull-right', { hide: this.state.showForm });
        let actions = null;

        if (this.props.browser) {
            actions = (<div className="pull-left">
                <button
                  type="button"
                  className="btn btn-sm btn-default"
                  disabled={this.props.selected.length === 0}
                  // files that are currently in selected will be moved to the clipboard
                  onClick={this.props.onCut}
                >
                    <span className="fa fa-cut" />
                    <span className="text-label">Knippen</span>
                    {this.props.selected.length > 0 ? ` (${this.props.selected.length})` : null}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-default"
                  disabled={this.props.clipboard.length === 0}
                  onClick={this.props.onPaste}
                >
                    <span className="fa fa-paste" />
                    <span className="text-label">Plakken</span>
                    {this.props.clipboard.length > 0 ? ` (${this.props.clipboard.length})` : null}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-default"
                  disabled={this.props.clipboard.length + this.props.selected.length === 0}
                  onClick={this.props.onCancel}
                >
                    <span className="fa fa-times-circle-o" />
                    <span className="text-label">Annuleren</span>
                </button>
            </div>);
        }

        return (
            <div className="toolbar">
                {actions}
                <button
                  type="button"
                  ref={(btn) => { this.buttonAdd = btn; }}
                  className={newFolderClass}
                  onClick={this.onShowForm}
                  disabled={this.props.isAddingFolder}
                >
                    <span className="fa fa-folder-o" />
                    <span className="text-label">Nieuwe map</span>
                    {this.props.isAddingFolder ? <span className="fa fa-circle-o-notch fa-spin" /> : null}
                </button>
                <div className={`form-inline pull-right ${this.state.showForm ? '' : 'hide'}`}>
                    <input
                      className="form-control input-sm"
                      ref={(input) => { this.folderName = input; }}
                      type="text"
                      placeholder="Mapnaam"
                      onKeyPress={this.onKeyPress}
                    />
                    <button
                      type="button"
                      ref={(btn) => { this.buttonSave = btn; }}
                      className="btn btn-sm btn-success pull-right"
                      onClick={this.onAddFolder}
                    >
                        <span className="fa fa-save" />
                        <span className="text-label">Opslaan</span>
                    </button>
                </div>
                <span
                  className="btn btn-sm btn-default btn-file pull-right"
                  disabled={this.props.isUploadingFiles}
                >
                    <span className="fa fa-arrow-circle-o-up" />
                    <span className="text-label">Upload</span>
                    {loader}
                    <input
                      // id="upload_files"
                      // name="upload_files"
                      type="file"
                      multiple="multiple"
                      onChange={this.props.uploadFiles}
                    />
                </span>
            </div>
        );
    }
}
