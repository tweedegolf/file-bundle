/**
 * @file       Component that renders a file in the filelist. It consists of a row
 *             that shows the name, type, creation date of the file. In case the
 *             file is an image, a thumb is added, otherwise a filetype icon is
 *             displayed. A download button and a delete button is shown as
 *             well. If the user clicks the delete button, the component will
 *             render a confirmation popup.
 */
import React from 'react';
import PropTypes from 'prop-types';

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

const File = (props) => {
    const file = props.file;
    let checked = false;
    if (props.clipboard.length > 0) {
        const index = props.clipboard.find(f => f.id === file.id);
        checked = index !== 'undefined';
    }
    let selected = false;
    if (props.selected.length > 0) {
        const index = typeof props.selected.find(f => f.id === file.id);
        selected = index !== 'undefined';
    }
    // console.log(file.name, selected)
    let className = `cutable${props.hovering ? ' selected' : ''}`;
    let preview = <span className={`fa fa-${icons[file.type] ? icons[file.type] : 'file'}`} />;

    let checkbox = null;
    let actions = null;
    let confirm = null;
    let btnDelete = null;
    let btnDownload = null;

    if (props.deleteFileWithId === file.id) {
        confirm = (<div className="confirm">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                  e.stopPropagation();
                  props.confirmDelete(null);
              }}
            >
                <span className="text-label">Annuleren</span>
                <span className="fa fa-times" />
            </button>

            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={(e) => {
                  e.stopPropagation();
                  props.deleteFile(file.id);
              }}
            >
                <span className="text-label">Definitief verwijderen</span>
                <span className="fa fa-trash-o" />
            </button>
        </div>);
    } else if (props.selected.length + props.clipboard.length === 0) {
        btnDelete = (<button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={(e) => {
              e.stopPropagation();
              props.confirmDelete(file.id);
          }}
        >
            <span className="fa fa-trash-o" />
        </button>);
    }

    if (props.browser) {
        if (props.deleteFileWithId !== file.id) {
            btnDownload =
                (<a
                  className="btn btn-sm btn-primary"
                  title="Download"
                  download={file.name}
                  href={file.original}
                  onClick={e => e.stopPropagation()}
                >
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

    if (props.clipboard.length > 0) {
        checkbox = <span className={checked ? 'fa fa-thumb-tack' : ''} />;
        className = checked ? 'cut' : '';
    }

    if (props.deleteFileWithId === file.id) {
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
                props.showPreview(file.original);
            },
        };
        preview = <img alt={file.name} {...p} />;
    }

    const p = {
        className,
        onClick: () => {
            props.selectFile(file);
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
};

File.propTypes = {
    file: PropTypes.shape(fileShape).isRequired,
    confirmDelete: PropTypes.func.isRequired,
    showPreview: PropTypes.func.isRequired,
    selectFile: PropTypes.func.isRequired,
    deleteFile: PropTypes.func.isRequired,
    clipboard: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
    selected: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
    hovering: PropTypes.bool.isRequired,
    browser: PropTypes.bool.isRequired,
    deleteFileWithId: PropTypes.number,
};

File.defaultProps = {
    deleteFileWithId: null,
};

export default File;
