/**
 * @file       Component that shows error messages. Error messages can be
 *             removed from the list by clicking the cross icon next to the
 *             error message.
 */

import React, { PropTypes } from 'react';
import R from 'ramda';
import * as ErrorTypes from '../util/constants';

const mapIndexed = R.addIndex(R.map);

export const errorShape = {
    type: PropTypes.string,
    messages: PropTypes.arrayOf(PropTypes.string),
};

const createErrors = ({ errors, onDismiss }) => mapIndexed((error, index) => {
    let message = null;

    if (error.type === ErrorTypes.ERROR_UPLOADING_FILE) {
        message = (<span>
            <strong>{'Uploaden van "{error.data}" niet gelukt.'}</strong>
            {error.messages.join(' ')}
        </span>);
    } else if (error.type === ErrorTypes.ERROR_DELETING_FILE) {
        message = (<span>
            <strong>{`Verwijderen van "${error.data}" niet gelukt.`}</strong>
            {error.messages.join(' ')}
        </span>);
    } else if (error.type === ErrorTypes.ERROR_DELETING_FOLDER) {
        message = (<span>
            <strong>{`Verwijderen van de folder "${error.data}" is niet gelukt.`}</strong>
            {error.messages.join(' ')}
        </span>);
    } else if (error.type === ErrorTypes.ERROR_ADDING_FOLDER) {
        message = (<span>
            <strong>{`Aanmaken van de folder "${error.data}" is niet gelukt.`}</strong>
            {error.messages.join(' ')}
        </span>);
    } else if (error.type === ErrorTypes.ERROR_OPENING_FOLDER) {
        message = (<span>
            <strong>{`Kan de folder "${error.data}" niet openen.`}</strong>
            {error.messages.join(' ')}
        </span>);
    } else if (error.type === ErrorTypes.ERROR_MOVING_FILES) {
        message = (<span>
            <strong>{`Kan de file niet "${error.data}" niet verplaatsen.`}</strong>
            {error.messages.join(' ')}
        </span>);
    } else {
        message = (<span>
            {error.messages.join(' ')}
        </span>);
    }

    return (<div key={`error_${index}`} className="alert alert-danger alert-dismissible">
        <button
          type="button"
          className="close"
          onClick={() => {
              onDismiss(error.id);
          }}
        >
          &times;
        </button>
        <span className="fa fa-bell-o" />
        {message}
    </div>);
}, errors);

const Errors = props => <div>{createErrors(props)}</div>;

Errors.propTypes = {
    errors: PropTypes.arrayOf(PropTypes.shape(errorShape)).isRequired,
    onDismiss: PropTypes.func.isRequired,
};

export default Errors;
