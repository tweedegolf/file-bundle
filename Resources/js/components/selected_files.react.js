// @flow
/**
 * @file       Component shows the currently selected files. This component only
 *             renders in Filepicker mode.
 */
import React from 'react';
import R from 'ramda';
import { translate } from 'react-i18next';

type PropsType = {
    selectedFiles: FileType[],
    selectFile: (file: string) => void,
    showPreview: (id: null | string) => void,
    t: (string) => string,
};

type DefaultPropsType = {};
type SelectedFilesStateType = {};

// export default class SelectedFiles extends React.Component<EmptyType, PropsType, EmptyType> {
class SelectedFiles extends
    React.Component<DefaultPropsType, PropsType, SelectedFilesStateType> {
    static defaultProps = {}
    state: SelectedFilesStateType
    props: PropsType

    render(): null | React$Element<*> {
        if (this.props.selectedFiles.length === 0) {
            return null;
        }

        let files = R.map((file: FileType): React$Element<*> => {
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
                p = { onClick: () => { this.props.selectFile(file.id); } };
            }
            return (<div key={file.id} className="btn btn-default" {...p}>
                {preview}
                <span className="name">{file.name}</span>
                <span className="remove">&times;</span>
                <input type="hidden" name={file.name} value={file.id} />
            </div>);
        }, this.props.selectedFiles);

        if (files.length === 0) {
            files = <span className="none-selected">{this.props.t('common.noFilesSelected')}</span>;
        }

        return (
            <div className="text-left file-picker-selection">
                {files}
            </div>
        );
    }
}

export default translate('common')(SelectedFiles);
