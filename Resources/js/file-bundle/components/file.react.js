import React from 'react';

const icons = {
    pdf: 'file-pdf-o',
    mp4: 'file-movie-o',
    webm: 'file-movie-o',
    ogg: 'file-movie-o',
    doc: 'file-word-o',
    docx: 'file-word-o',
    ppt: 'file-powerpoint-o',
    pptx: 'file-powerpoint-o',
    xls: 'file-excel-o',
    xlsx: 'file-excel-o'
};

export default class File extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirm_delete: false,
            preview: false
        };

        this.onDelete = this.onDelete.bind(this);
        this.onCancelDelete = this.onCancelDelete.bind(this);
        this.onConfirmDelete = this.onConfirmDelete.bind(this);
    }

    render() {
        let file = this.props.file;
        let checked = this.props.clipboard.indexOf(file.id) > -1;
        let selected = this.props.selected.indexOf(file.id) > -1;
        let class_name = 'cutable' + (this.props.hovering ? ' selected' : '');
        let preview = <span className={'fa fa-' + (icons[file.type] ? icons[file.type] : 'file')} />;

        let checkbox = null;
        let actions = null;
        let confirm = null;
        let delete_btn = null;
        let download_btn = null;

        if (this.props.confirm_delete === file.id) {
            confirm = <div className="confirm">
                <button type="button" className="btn btn-sm btn-primary" onClick={this.onCancelDelete}>
                    <span className="text-label">Cancel</span>
                    <span className="fa fa-times"/>
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={this.onDelete}>
                    <span className="text-label">Delete</span>
                    <span className="fa fa-trash-o"/>
                </button>
            </div>;
        } else if (this.props.selected.length + this.props.clipboard.length === 0 && this.props.allow_delete === true) {
            delete_btn = <button type="button" className="btn btn-sm btn-danger" onClick={this.onConfirmDelete}>
                <span className="fa fa-trash-o" />
            </button>;
        }

        if (this.props.browser) {
            if (this.props.confirm_delete !== file.id) {
                download_btn =
                    <a className="btn btn-sm btn-primary" title="Download" download={file.name} href={file.original} onClick={(e) => e.stopPropagation()}>
                        <span className="fa fa-download"/>
                    </a>;
            }

            checkbox = <input type="checkbox" checked={selected} />;
            actions = <div className="actions">
                {delete_btn}
                {download_btn}
                {confirm}
            </div>;
        } else {
            checkbox = <span className={selected ? 'fa fa-check-square-o' : 'fa fa-square-o'} />;
            class_name = selected ? 'selected' : 'selectable';
        }

        if (this.props.clipboard.length > 0) {
            checkbox = <span className={checked ? 'fa fa-thumb-tack' : ''} />;
            class_name = checked ? 'cut' : '';
        }

        if (this.props.confirm_delete === file.id) {
            class_name += ' danger';
        }


        if (file.new) {
            class_name += ' success';
        }


        if (file.thumb) {
            preview = <img
                src={file.thumb}
                alt={file.name}
                onClick={this.props.onPreview.bind(this, file.original)}
            />;
        }

        return (
            <tr className={class_name} onClick={this.props.onSelect.bind(this, file.id)}>
                <td className="select">
                    {checkbox}
                </td>
                <td className="preview">
                    {preview}
                </td>
                <td className="name">
                    {file.name}
                </td>
                <td className="size">
                    {file.size}
                </td>
                <td className="date">
                    {file.created}
                </td>
                <td className="buttons">
                    {actions}
                </td>
            </tr>
        );
    }

    onDelete(e) {
        e.stopPropagation();
        this.props.onDelete(this.props.file.id);
    }

    onCancelDelete(e) {
        e.stopPropagation();
        this.props.onConfirmDelete(null);
    }

    onConfirmDelete(e) {
        e.stopPropagation();
        this.props.onConfirmDelete(this.props.file.id);
    }
}
