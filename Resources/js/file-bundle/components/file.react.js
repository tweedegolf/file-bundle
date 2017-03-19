/**
 * @file       Component that renders a file in the filelist. It consists of a row
 *             that shows the name, type, creation date of the file. In case the
 *             file is an image, a thumb is added, otherwise a filetype icon is
 *             displayed. A download button and a delete button is shown as
 *             well. If the user clicks the delete button, the component will
 *             render a confirmation popup.
 */
import React, { PropTypes } from 'react';

const icons = {
    pdf: 'file-pdf-o',
    doc: 'file-word-o',
    docx: 'file-word-o',
    ppt: 'file-powerpoint-o',
    pptx: 'file-powerpoint-o',
    xls: 'file-excel-o',
    xlsx: 'file-excel-o',
};

export const fileShape = {
    create_ts: PropTypes.number.isRequired,
    created: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    original: PropTypes.string.isRequired,
    thumb: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    size_bytes: PropTypes.number.isRequired,
};

export default class File extends React.Component {

    static propTypes = {
        file: PropTypes.shape(fileShape).isRequired,
        onConfirmDelete: PropTypes.func.isRequired,
        onPreview: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        clipboard: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        selected: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        hovering: PropTypes.bool.isRequired,
        browser: PropTypes.bool.isRequired,
        deleteFileWithId: PropTypes.number,
    }

    static defaultProps = {
        deleteFileWithId: null,
    }

    constructor(props) {
        super(props);
        this.onDelete = this.onDelete.bind(this);
        this.onCancelDelete = this.onCancelDelete.bind(this);
        this.onConfirmDelete = this.onConfirmDelete.bind(this);
/*
        // hide confirmation popup if user clicks somewhere outside the popup
        addEventListener('mousedown', e => {
            //console.log(e.target)
            if(e.target === document.body){
                this.onCancelDelete(e)
            }
        })
*/
    }

    onCancelDelete(e) {
        e.stopPropagation();
        this.props.onConfirmDelete(null);
    }

    onConfirmDelete(e) {
        e.stopPropagation();
        this.props.onConfirmDelete(this.props.file.id);
    }

    onDelete(e) {
        e.stopPropagation();
        this.props.onDelete(this.props.file.id);
    }

    render() {
        const file = this.props.file;
        let checked = false;
        if (this.props.clipboard.length > 0) {
            const index = this.props.clipboard.find(f => f.id === file.id);
            checked = index !== 'undefined';
        }
        let selected = false;
        if (this.props.selected.length > 0) {
            const index = typeof this.props.selected.find(f => f.id === file.id);
            selected = index !== 'undefined';
        }
        // console.log(file.name, selected)
        let className = `cutable${this.props.hovering ? ' selected' : ''}`;
        let preview = <span className={`fa fa-${icons[file.type] ? icons[file.type] : 'file'}`} />;

        let checkbox = null;
        let actions = null;
        let confirm = null;
        let btnDelete = null;
        let btnDownload = null;

        if (this.props.deleteFileWithId === file.id) {
            confirm = (<div className="confirm">
                <button type="button" className="btn btn-sm btn-primary" onClick={this.onCancelDelete}>
                    <span className="text-label">Annuleren</span>
                    <span className="fa fa-times" />
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={this.onDelete}>
                    <span className="text-label">Definitief verwijderen</span>
                    <span className="fa fa-trash-o" />
                </button>
            </div>);
        } else if (this.props.selected.length + this.props.clipboard.length === 0) {
            btnDelete = (<button type="button" className="btn btn-sm btn-danger" onClick={this.onConfirmDelete}>
                <span className="fa fa-trash-o" />
            </button>);
        }

        if (this.props.browser) {
            if (this.props.deleteFileWithId !== file.id) {
                btnDownload =
                    (<a className="btn btn-sm btn-primary" title="Download" download={file.name} href={file.original} onClick={e => e.stopPropagation()}>
                        <span className="fa fa-download" />
                    </a>);
            }

            checkbox = <input type="checkbox" checked={selected} readOnly />;
            actions = (<div className="actions">
                {btnDelete}
                {btnDownload}
                {confirm}
            </div>);
        } else {
            checkbox = <span className={selected ? 'fa fa-check-square-o' : 'fa fa-square-o'} />;
            className = selected ? 'selected' : 'selectable';
        }

        if (this.props.clipboard.length > 0) {
            checkbox = <span className={checked ? 'fa fa-thumb-tack' : ''} />;
            className = checked ? 'cut' : '';
        }

        if (this.props.deleteFileWithId === file.id) {
            className += ' danger';
        }

        if (file.new) {
            className += ' success';
        }

        if (file.thumb) {
            const p = {
                src: file.thumb,
                onClick: (e) => {
                    e.stopPropagation();
                    this.props.onPreview(file.original);
                },
            };
            preview = <img alt={file.name} {...p} />;
        }

        const p = {
            className,
            onClick: () => {
                this.props.onSelect(file.id);
            },
        };
        return (
            <tr {...p}>
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
}
