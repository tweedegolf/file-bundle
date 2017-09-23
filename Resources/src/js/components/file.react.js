// @flow
/**
 * @file       Component that renders a file in the filelist. It consists of a row
 *             that shows the name, type, creation date of the file. In case the
 *             file is an image, a thumb is added, otherwise a filetype icon is
 *             displayed. A download button and a delete button is shown as
 *             well. If the user clicks the delete button, the component will
 *             render a confirmation popup.
 */
import R from 'ramda';
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
    selectFile: (fileId: string) => void,
    deleteFile: (id: string) => void,
    clipboard: ClipboardType,
    selected: ClipboardType,
    hovering: boolean,
    browser: boolean,
    deleteFileWithId: null | string,
    showingRecycleBin: boolean,
    t: (string) => string,
};

const File = (props: PropsType): React$Element<*> => {
    const file = props.file;
    const clipboardFileIds = props.clipboard.fileIds;
    const selectedFileIds = props.selected.fileIds;
    let onClipboard = false;
    if (clipboardFileIds.length > 0) {
        const index = R.find((fileId: string): boolean => file.id === fileId, clipboardFileIds);
        onClipboard = R.isNil(index) === false;
    }
    let isSelected = false;
    if (selectedFileIds.length > 0) {
        const index = R.find((fileId: string): boolean => file.id === fileId, selectedFileIds);
        isSelected = R.isNil(index) === false;
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
                className="btn btn-xs btn-primary"
                onClick={(e: SyntheticEvent) => {
                    e.stopPropagation();
                    props.confirmDelete(null);
                }}
            >
                <span className="text-label">{props.t('remove.cancel')}</span>
                <span className="fa fa-times" />
            </button>
            &nbsp;
            <button
                type="button"
                className="btn btn-xs btn-danger"
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
        selectedFileIds.length + clipboardFileIds.length === 0 &&
        props.allowDelete === true &&
        props.showingRecycleBin === false
    ) {
        buttonDelete = (<button
            type="button"
            className="btn btn-xs btn-danger"
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
                    className="btn btn-xs btn-primary"
                    title="Download"
                    download={file.name}
                    href={file.original}
                    onClick={(e: SyntheticEvent): void => e.stopPropagation()}
                >
                    <span className="fa fa-download" />
                </a>);
        }
        if (props.allowEdit) {
            checkbox = <input type="checkbox" checked={isSelected} readOnly />;
        }
        const separator = buttonDelete !== null && buttonDownload !== null ? '\ ' : null;
        actions = (<div className="actions">
            {buttonDelete}
            {separator}
            {buttonDownload}
            {confirmPane}
        </div>);
    } else {
        checkbox = <span className={isSelected ? 'fa fa-check-square-o' : 'fa fa-square-o'} />;
        className = isSelected ? 'selected' : 'selectable';
    }

    if (clipboardFileIds.length + props.clipboard.folderIds.length > 0) {
        checkbox = <span className={onClipboard ? 'fa fa-thumb-tack' : ''} />;
        className = onClipboard ? 'cut' : '';
    }

    if (props.deleteFileWithId === file.id) {
        className += ' danger';
    }

    if (file.is_new === true) {
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
            if (clipboardFileIds.length === 0) {
                props.selectFile(file.id);
            }
        },
    };
    return (
        <tr {...p}>
            <td>
                {checkbox}
            </td>
            <td>
                {preview}
            </td>
            <td>
                {file.name}
            </td>
            <td>
                {file.size}
            </td>
            <td>
                {file.created}
            </td>
            <td>
                {actions}
            </td>
        </tr>
    );
};

File.defaultProps = {
    deleteFileWithId: null,
};

export default translate('common')(File);
