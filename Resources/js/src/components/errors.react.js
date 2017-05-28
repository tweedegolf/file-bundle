// @flow
/**
 * @file       Component that shows error messages. Error messages can be
 *             removed from the list by clicking the cross icon next to the
 *             error message.
 */
import React from 'react';
import R from 'ramda';
import { translate } from 'react-i18next';
import * as ErrorTypes from '../util/constants';

const mapIndexed = R.addIndex(R.map);

type PropsType = {
    errors: ErrorType[],
    onDismiss: (id: string) => void,
    t: (string) => string,
};

const createErrors = ({ errors, onDismiss, t }: PropsType): React$Element<*>[] =>
    mapIndexed((error: ErrorType, index: number): React$Element<*> => {
        let message: string = '';

        if (error.type === ErrorTypes.ERROR_UPLOADING_FILE) {
            message = t('error.upload');
            // message = typeof error.data !== 'undefined' ?
            //     `Uploaden van "${error.data}" niet gelukt.` :
            //     'Uploaden niet gelukt.';
        } else if (error.type === ErrorTypes.ERROR_DELETING_FILE) {
            message = typeof error.data !== 'undefined' ?
                `Verwijderen van "${error.data}" niet gelukt.` :
                'Verwijderen van file niet gelukt';
        } else if (error.type === ErrorTypes.ERROR_DELETING_FOLDER) {
            message = typeof error.data !== 'undefined' ?
                `Verwijderen van de folder "${error.data}" is niet gelukt.` :
                'Verwijderen van folder niet gelukt';
        } else if (error.type === ErrorTypes.ERROR_ADDING_FOLDER) {
            message = typeof error.data !== 'undefined' ?
                `Aanmaken van de folder "${error.data}" is niet gelukt.` :
                'Aanmaken van folder is niet gelukt';
        } else if (error.type === ErrorTypes.ERROR_OPENING_FOLDER) {
            message = typeof error.data !== 'undefined' ?
                `Kan de folder "${error.data}" niet openen.` :
                'Kan de folder niet openen';
        } else if (error.type === ErrorTypes.ERROR_MOVING_ITEMS) {
            message = typeof error.data !== 'undefined' ?
                `Kan de file niet "${error.data}" niet verplaatsen.` :
                'Kan de file niet verplaatsen';
        }

        const span: React$Element<*> = (<span>
            <strong>{message}</strong>
            {error.messages.join(' ')}
        </span>);

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

const Errors = (props: PropsType): React$Element<*> => <div>{createErrors(props)}</div>;

export default translate('common')(Errors);

