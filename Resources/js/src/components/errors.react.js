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
        let interpolation: {[string]: string} = {};
        if (typeof error.data !== 'undefined') {
            interpolation = error.data;
        }

        if (error.type === ErrorTypes.ERROR_UPLOADING_FILE) {
            message = t('error.upload', { interpolation });
        } else if (error.type === ErrorTypes.ERROR_DELETING_FILE) {
            if (typeof interpolation.file === 'undefined') {
                interpolation.file = t('words.file');
            }
            message = t('error.deleteFile', interpolation);
        } else if (error.type === ErrorTypes.ERROR_DELETING_FOLDER) {
            if (typeof interpolation.name !== 'undefined') {
                message = t('error.deleteFolder', interpolation);
            } else {
                message = t('error.deleteFolder2', interpolation);
            }
        } else if (error.type === ErrorTypes.ERROR_ADDING_FOLDER) {
            message = t('error.createFolder', interpolation);
        } else if (error.type === ErrorTypes.ERROR_RENAMING_FOLDER) {
            message = t('error.renameFolder', interpolation);
        } else if (error.type === ErrorTypes.ERROR_OPENING_FOLDER) {
            message = t('error.openFolder', interpolation);
        } else if (error.type === ErrorTypes.ERROR_MOVING_ITEMS) {
            message = t('error.moveItem', interpolation);
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
            {span}
        </div>);
    }, errors);

const Errors = (props: PropsType): React$Element<*> => <div>{createErrors(props)}</div>;

export default translate('common')(Errors);

