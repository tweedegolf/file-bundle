/**
 * @file       Component renders a toolbar at the top of the filebrowser. This
 *             toolbar contains buttons for cut & paste, for uploading new files
 *             and for creating new folders.
 */

import React from 'react';

export default class Toolbar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show_form: false,
        };

    // hide create new folder popup if user clicks somewhere outside the popup
/*
    addEventListener('mousedown', e => {
      if(e.target !== this.refs.button_add_folder && e.target !== this.refs.button_save_folder && e.target !== this.refs.folder_name){
        this.setState({
          show_form: false
        })
      }
    })
*/
    }

    render() {
        const loader = this.props.uploading ? <span className="fa fa-circle-o-notch fa-spin" /> : null;
        const new_folder_class = `btn btn-sm btn-default pull-right ${this.state.show_form ? 'hide' : ''}`;
        let actions = null;

        if (this.props.browser) {
            actions = (<div className="pull-left">
                <button
                  type="button"
                  className="btn btn-sm btn-default"
                  disabled={this.props.selected.length === 0}
                  onClick={this.props.onCut.bind(this)}
                >
                    <span className="fa fa-cut" />
                    <span className="text-label">Knippen</span>
                    {this.props.selected.length > 0 ? ` (${this.props.selected.length})` : null}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-default"
                  disabled={this.props.clipboard.length === 0}
                  onClick={this.props.onPaste.bind(this)}
                >
                    <span className="fa fa-paste" />
                    <span className="text-label">Plakken</span>
                    {this.props.clipboard.length > 0 ? ` (${this.props.clipboard.length})` : null}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-default"
                  disabled={this.props.clipboard.length + this.props.selected.length === 0}
                  onClick={this.props.onCancel.bind(this)}
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
                  ref="button_add_folder"
                  className={new_folder_class}
                  onClick={this.onShowForm.bind(this)}
                  disabled={this.props.adding_folder}
                >
                    <span className="fa fa-folder-o" />
                    <span className="text-label">Nieuwe map</span>
                    {this.props.adding_folder ? <span className="fa fa-circle-o-notch fa-spin" /> : null}
                </button>
                <div className={`form-inline pull-right ${this.state.show_form ? '' : 'hide'}`}>
                    <input
                      className="form-control input-sm"
                      ref="folder_name"
                      type="text"
                      placeholder="Mapnaam"
                      onKeyPress={this.onKeyPress.bind(this)}
                    />
                    <button
                      type="button"
                      ref="button_save_folder"
                      className="btn btn-sm btn-success pull-right"
                      onClick={this.onAddFolder.bind(this)}
                    >
                        <span className="fa fa-save" />
                        <span className="text-label">Opslaan</span>
                    </button>
                </div>
                <span
                  className="btn btn-sm btn-default btn-file pull-right"
                  disabled={this.props.uploading}
                >
                    <span className="fa fa-arrow-circle-o-up" />
                    <span className="text-label">Upload</span>
                    {loader}
                    <input
            // id="upload_files"
            // name="upload_files"
                      type="file"
                      multiple="multiple"
                      onChange={this.props.onUpload}
                    />
                </span>
            </div>
        );
    }

    onKeyPress(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.onAddFolder();
        }
    }

    onShowForm() {
        this.setState({
            show_form: true,
        }, () => {
            this.refs.folder_name.value = '';
            this.refs.folder_name.focus();
        });
    }

    onAddFolder() {
        this.setState({ show_form: false });
        const name = this.refs.folder_name.value;
        if (name !== '') {
            this.props.onAddFolder(name, this.props.current_folder.id);
        }
    }
}
