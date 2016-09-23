import React from 'react';
import * as ErrorTypes from '../constants'


export default class UploadErrors extends React.Component {
/*
  shouldComponentUpdate(nextProps){
    let update = false
    if(nextProps.errors.length === this.props.errors.length === 0){
      update = false
    }else if(nextProps.errors.length === this.props.errors.length){
      let currentErrorIds = this.props.errors.map(error => {
        return error.id
      })
      for(let error of nextProps.errors){
        let index = currentErrorIds.findIndex(id => {
          return id === error.id
        })
        if(index === -1){
          update = true
          break
        }
      }
    }else{
      update = true
    }
    return update
  }


  componentDidUpdate(){
    console.debug('Errors.react did update')
  }
*/

  render() {

    //console.log('error.react', this.props.errors)

    let messages = Object.entries(this.props.errors).map(([index, error]) => {
      let message = null;

      if (error.type === ErrorTypes.ERROR_UPLOADING_FILE) {
        message = <span>
          <strong>Uploaden van "{error.file}" niet gelukt.</strong>
          {error.messages.join(' ')}
        </span>
      } else if (error.type === ErrorTypes.ERROR_DELETING_FILE) {
        message = <span>
          <strong>Verwijderen van "{error.file}" niet gelukt.</strong>
          {error.messages.join(' ')}
          {/*Het bestand is in gebruik.*/}
        </span>
      } else if (error.type === ErrorTypes.ERROR_DELETING_FOLDER) {
        message = <span>
          <strong>Verwijderen van de folder "{error.folder}" is niet gelukt.</strong>
          {error.messages.join(' ')}
          {/*De map is niet helemaal leeg.*/}
        </span>
      } else if (error.type === ErrorTypes.ERROR_ADDING_FOLDER) {
        message = <span>
          <strong>Aanmaken van de folder "{error.folder}" is niet gelukt.</strong>
          {error.messages.join(' ')}
        </span>
      } else if (error.type === ErrorTypes.ERROR_OPENING_FOLDER) {
        message = <span>
          <strong>Kan de folder "{error.folder}" niet openen.</strong>
          {error.messages.join(' ')}
        </span>
      } else if (error.type === ErrorTypes.ERROR_MOVING_FILES) {
        message = <span>
          <strong>Kan de file niet "{error.file}" niet verplaatsen.</strong>
          {error.messages.join(' ')}
        </span>
      } else {
        message = <span>
          {error.messages.join(' ')}
        </span>
      }

      return <div key={index} className="alert alert-danger alert-dismissible">
        <button type="button" className="close" onClick={this.props.onDismiss.bind(this, error.id)}>&times;</button>
        <span className="fa fa-bell-o" />
        {message}
      </div>
    });

    return <div>{messages}</div>;
  }
}
