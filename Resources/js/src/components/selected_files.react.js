/**
 * @file       Component shows the currently selected files. This component only
 *             renders in Filepicker mode.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { fileShape } from '../components/file.react';

export default class SelectedFiles extends React.Component {

    static propTypes = {
        clipboard: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        selected: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        multiple: PropTypes.bool.isRequired,
        browser: PropTypes.bool.isRequired,
        selectFile: PropTypes.func.isRequired,
        showPreview: PropTypes.func.isRequired,
    }

    render() {
        if (this.props.browser === true || this.props.selected.length === 0) {
            return false;
        }

        let files = [];
        this.props.selected.forEach((file) => {
            const id = file.id;
            let preview = <span className="fa fa-file" />;
            if (file.thumb) {
                const p = { onClick: () => { this.props.showPreview(file.original); } };
                preview = (<img
                  src={file.thumb}
                  alt={file.name}
                  {...p}
                />);
            }

            const p = { onClick: () => { this.selectFile(id); } };
            files.push(<div key={id} className="btn btn-default" {...p}>
                {preview}
                <span className="name">{file.name}</span>
                <span className="remove">&times;</span>
                <input type="hidden" name={file.name} value={id} />
            </div>);
        });

        if (files.length === 0) {
            files = <span className="none-selected">Geen bestand(en) geselecteerd.</span>;
        }

        return (
            <div className="text-left file-picker-selection">
                {files}
            </div>
        );
    }
}
