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
                    Knippen
                    {this.props.selected.length > 0 ? ' (' + this.props.selected.length + ')' : null}
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-default"
                    disabled={this.props.clipboard.length === 0}
                    onClick={this.props.onPaste.bind(this)}>
                    <span className="fa fa-paste" />
                    Plakken
                    {this.props.clipboard.length > 0 ? ' (' + this.props.clipboard.length + ')' : null}
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-default"
                    disabled={this.props.clipboard.length + this.props.selected.length === 0}
                    onClick={this.props.onCancel.bind(this)}>
                    <span className="fa fa-times-circle-o" />
                    Annuleren
                </button>
            </div>;
        }

        return (
            <div className="toolbar">
                {actions}
                <button
                    type="button"
                    className={new_folder_class}
                    onClick={this.onShowForm.bind(this)}
                    disabled={this.state.folder_loading}>
                    <span className="fa fa-folder-o" />
                    Nieuwe map
                    {this.state.folder_loading ? <span className="fa fa-circle-o-notch fa-spin" /> : null}
                </button>
                <div className={'form-inline pull-right ' + (this.state.show_form ? '' : 'hide')}>
                    <input
                        className="form-control input-sm"
                        ref="folder_name"
                        type="text"
                        placeholder="Mapnaam"
                        onKeyPress={this.onKeyPress.bind(this)} />
                    <button
                        type="button"
                        className="btn btn-sm btn-success pull-right"
                        onClick={this.onAddFolder.bind(this)}>
                        <span className="fa fa-save" />
                        Opslaan
                    </button>
                </div>
                <span className="btn btn-sm btn-default btn-file pull-right"
                      disabled={this.props.uploading}>
                    <span className="fa fa-arrow-circle-o-up" />
                    Upload
                    {loader}
                    <input
                        type="file"
                        multiple="multiple"
                        onChange={this.props.onUpload} />
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