import React from 'react';
import _ from 'lodash';
import * as ErrorTypes from '../constants'

export default class UploadErrors extends React.Component {


  render() {

    //console.log('error.react', this.props.errors)

    let messages = _.map(this.props.errors, (error, index) => {
      let message = null;

      if (error.type === ErrorTypes.ERROR_UPLOAD_FILE) {
        message = <span>
          <strong>Uploaden van "{error.file}" niet gelukt.</strong>
          {error.messages.join(' ')}
        </span>
      } else if (error.type === 'delete') {
        message = <span>
          <strong>Verwijderen van "{error.file}" niet gelukt.</strong>
          {error.messages.join(' ')}
          {/*Het bestand is in gebruik.*/}
        </span>
      } else if (error.type === 'delete_folder') {
        message = <span>
          <strong>Verwijderen van "{error.folder}" niet gelukt.</strong>
          {error.messages.join(' ')}
          {/*De map is niet helemaal leeg.*/}
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

    return <div>{messages}</div>;
  }
}
