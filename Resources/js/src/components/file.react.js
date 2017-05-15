// @flow
/**
 * @file       Component that renders a file in the filelist. It consists of a row
 *             that shows the name, type, creation date of the file. In case the
 *             file is an image, a thumb is added, otherwise a filetype icon is
 *             displayed. A download button and a delete button is shown as
 *             well. If the user clicks the delete button, the component will
 *             render a confirmation popup.
 */
import React from 'react';
import { translate } from 'react-i18next';

const icons = {
    pdf: 'file-pdf-o',
    doc: 'file-word-o',
    docx: 'file-word-o',
    ppt: 'file-powerpoint-o',
    pptx: 'file-powerpoint-o',
    xls: 'file-excel-o',
    xlsx: 'file-excel-o',
};

type PropsType = {
    file: FileType,
    allowEdit: boolean,
    allowDelete: boolean,
    confirmDelete: (id: null | string) => void,
    showPreview: (id: string) => void,
    selectFile: (file: FileType) => void,
    deleteFile: (id: string) => void,
    clipboard: FileType[],
    selected: FileType[],
    hovering: boolean,
    browser: boolean,
    deleteFileWithId: null | string,
    showingRecycleBin: boolean,
    t: (string) => string,
};

const File = (props: PropsType): React$Element<*> => {
    const file = props.file;
    let checked = false;
    if (props.clipboard.length > 0) {
        const index = props.clipboard.find((f: FileType): boolean => f.id === file.id);
        checked = index !== 'undefined';
    }
    let selected = false;
    if (props.selected.length > 0) {
        const index = typeof props.selected.find((f: FileType): boolean => f.id === file.id);
        selected = index !== 'undefined';
    }
    // console.log(file.name, selected)
    let className = `cutable${props.hovering ? ' selected' : ''}`;
    let preview = <span className={`fa fa-${icons[file.type] ? icons[file.type] : 'file'}`} />;

    let checkbox = null;
    let actions = null;
    let confirmPane = null;
    let buttonDelete = null;
    let buttonDownload = null;

    if (props.deleteFileWithId === file.id) {
        confirmPane = (<div className="confirm">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={(e: SyntheticEvent) => {
                  e.stopPropagation();
                  props.confirmDelete(null);
              }}
            >
                <span className="text-label">{props.t('remove.cancel')}</span>
                <span className="fa fa-times" />
            </button>

            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={(e: SyntheticEvent) => {
                  e.stopPropagation();
                  props.deleteFile(file.id);
              }}
            >
                <span className="text-label">{props.t('remove.permanently')}</span>
                <span className="fa fa-trash-o" />
            </button>
        </div>);
    } else if (
        props.selected.length + props.clipboard.length === 0 &&
        props.allowDelete === true &&
        props.showingRecycleBin === false
    ) {
        buttonDelete = (<button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={(e: SyntheticEvent) => {
              e.stopPropagation();
              props.confirmDelete(file.id);
          }}
        >
            <span className="fa fa-trash-o" />
        </button>);
    }

    if (props.browser === true) {
        if (props.deleteFileWithId !== file.id && props.showingRecycleBin === false) {
            buttonDownload =
                (<a
                  className="btn btn-sm btn-primary"
                  title="Download"
                  download={file.name}
                  href={file.original}
                  onClick={(e: SyntheticEvent): void => e.stopPropagation()}
                >
                    <span className="fa fa-download" />
                </a>);
        }
        if (props.allowEdit) {
            checkbox = <input type="checkbox" checked={selected} readOnly />;
        }
        actions = (<div className="actions">
            {buttonDelete}
            {buttonDownload}
            {confirmPane}
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

    if (file.isNew === true) {
        className += ' success';
    }

    if (file.thumb !== null) {
        const p = {
            src: file.thumb,
            onClick: (e: SyntheticEvent) => {
                if (typeof file.original !== 'undefined') {
                    const original: string = file.original;
                    e.stopPropagation();
                    props.showPreview(original);
                }
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

File.defaultProps = {
    deleteFileWithId: null,
};

export default translate('common')(File);
