import React from 'react';
import api from '../api';

export default class Toolbar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show_form: false,
            folder_loading: false
        };
    }

    render() {
        let loader = this.props.uploading ? <span className="fa fa-circle-o-notch fa-spin" /> : null;
        let new_folder_class = 'btn btn-sm btn-default pull-right ' + (this.state.show_form ? 'hide' : '');
        let actions = null;

        if (this.props.browser) {
            actions = <div className="pull-left">
                <button
                    type="button"
                    className="btn btn-sm btn-default"
                    disabled={this.props.selected.length === 0}
                    onClick={this.props.onCut.bind(this)}>
                    <span className="fa fa-cut" />
                    <span className="text-label">Cut</span>
                    {this.props.selected.length > 0 ? ' (' + this.props.selected.length + ')' : null}
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-default"
                    disabled={this.props.clipboard.length === 0}
                    onClick={this.props.onPaste.bind(this)}>
                    <span className="fa fa-paste" />
                    <span className="text-label">Paste</span>
                    {this.props.clipboard.length > 0 ? ' (' + this.props.clipboard.length + ')' : null}
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-default"
                    disabled={this.props.clipboard.length + this.props.selected.length === 0}
                    onClick={this.props.onCancel.bind(this)}>
                    <span className="fa fa-times-circle-o" />
                    <span className="text-label">Cancel</span>
                </button>
            </div>;
        }

        let newFolderButton = (
            <button
                type="button"
                className={new_folder_class}
                onClick={this.onShowForm.bind(this)}
                disabled={this.state.folder_loading}>
                <span className="fa fa-folder-o" />
                <span className="text-label">New folder</span>
                {this.state.folder_loading ? <span className="fa fa-circle-o-notch fa-spin" /> : null}
            </button>
        );

        let newFolderForm = (
            <div className={'form-inline pull-right ' + (this.state.show_form ? '' : 'hide')}>
                <input
                    className="form-control input-sm"
                    ref="folder_name"
                    type="text"
                    placeholder="Folder name"
                    onKeyPress={this.onKeyPress.bind(this)} />
                <button
                    type="button"
                    className="btn btn-sm btn-success pull-right"
                    onClick={this.onAddFolder.bind(this)}>
                    <span className="fa fa-save" />
                    <span className="text-label">Save</span>
                </button>
            </div>
        );

        if(this.props.allow_new_folder === false){
            newFolderButton = null;
            newFolderForm = null;
        }

        let uploadButton = (
            <span className="btn btn-sm btn-default btn-file pull-right"
                  disabled={this.props.uploading}>
                <span className="fa fa-arrow-circle-o-up" />
                <span className="text-label">Upload</span>
                {loader}
                <input
                    type="file"
                    multiple="multiple"
                    onChange={this.props.onUpload} />
            </span>
        );

        if(this.props.allow_upload === false){
            uploadButton = null;
        }

        return (
            <div className="toolbar">
                {newFolderButton}
                {actions}
                {newFolderForm}
                {uploadButton}
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
            show_form: true
        }, () => {
            this.refs.folder_name.focus();
        });
    }

    reset() {
        this.setState({
            show_form: false,
            folder_loading: false
        });
        this.refs.folder_name.value = '';
    }

    onAddFolder() {
        this.setState({folder_loading: true});
        api.addFolder(this.refs.folder_name.value, this.props.current_folder.id, (errors) => {
            // success
            this.reset();
            this.props.onAddFolder(errors);
        }, () => {
            // error
            this.reset();
        });
    }
}
