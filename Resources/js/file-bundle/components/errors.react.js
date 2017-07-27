import React from 'react';
import _ from 'lodash';

export default class UploadErrors extends React.Component {

    render() {
        let messages = _.map(this.props.errors, (error, index) => {
            let message = null;

            if (error.type === 'upload') {
                message = <span>
                    <strong>Could not upload "{error.file}"</strong>
                    {error.messages.join(' ')}
                </span>
            } else if (error.type === 'delete') {
                message = <span>
                    <strong>Could not delete "{error.file}"</strong>
                    The file is in use.
                </span>
            } else if (error.type === 'delete_folder') {
                message = <span>
                    <strong>Could not delete "{error.folder}"</strong>
                    This folder is not empty.
                </span>
            } else {
                message = <span>
                    {error.messages.join(' ')}
                </span>
            }

            return <div key={index} className="alert alert-danger alert-dismissible">
                <button type="button" className="close" onClick={this.props.onDismiss.bind(this, index)}>&times;</button>
                <span className="fa fa-bell-o" />
                {message}
            </div>
        });

        return  <div>{messages}</div>;
    }
}
