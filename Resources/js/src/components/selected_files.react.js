// @flow
/**
 * @file       Component shows the currently selected files. This component only
 *             renders in Filepicker mode.
 */
import React from 'react';
import R from 'ramda';

type PropsType = {
    clipboard: FileType[],
    selected: FileType[],
    multiple: boolean,
    browser: boolean,
    selectFile: (id: null | string) => void,
    showPreview: (id: null | string) => void,
};

type DefaultPropsType = {};
type SelectedFilesStateType = {};

// export default class SelectedFiles extends React.Component<EmptyType, PropsType, EmptyType> {
export default class SelectedFiles extends
    React.Component<DefaultPropsType, PropsType, SelectedFilesStateType> {
    props: PropsType
    state: SelectedFilesStateType
    static defaultProps = {}

    render(): null | React$Element<*> {
        if (this.props.browser === true || this.props.selected.length === 0) {
            return null;
        }

        let files = R.map((file: FileType): React$Element<*> => {
            const id = file.id;
            let preview = <span className="fa fa-file" />;
            if (file.thumb) {
                const original = typeof file.original === 'undefined' ? null : file.original;
                const p = { onClick: () => { this.props.showPreview(original); } };
                preview = (<img
                  src={file.thumb}
                  alt={file.name}
                  {...p}
                />);
            }
            let p = {};
            if (typeof this.props.selectFile !== 'undefined') {
                p = { onClick: () => { this.props.selectFile(id); } };
            }
            return (<div key={id} className="btn btn-default" {...p}>
                {preview}
                <span className="name">{file.name}</span>
                <span className="remove">&times;</span>
                <input type="hidden" name={file.name} value={id} />
            </div>);
        }, this.props.selected);

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
