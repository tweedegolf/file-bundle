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
        let tmp: string = '';
        let message: string = '';

        if (error.type === ErrorTypes.ERROR_UPLOADING_FILE) {
            message = t('error.upload', { files: error.data });
        } else if (error.type === ErrorTypes.ERROR_DELETING_FILE) {
            tmp = t('words.file');
            if (typeof error.data !== 'undefined') {
                tmp = `"${error.data}"`;
            }
            message = t('error.deleteFile', { file: tmp });
        } else if (error.type === ErrorTypes.ERROR_DELETING_FOLDER) {
            message = t('error.deleteFolder', { folder: error.data });
        } else if (error.type === ErrorTypes.ERROR_ADDING_FOLDER) {
            message = t('error.deleteFolder', { folder: error.data });
        } else if (error.type === ErrorTypes.ERROR_OPENING_FOLDER) {
            message = t('error.openFolder', { folder: error.data });
        } else if (error.type === ErrorTypes.ERROR_MOVING_ITEMS) {
            if (typeof error.data !== 'undefined') {
                tmp = `"${error.data}"`;
            }
            message = t('error.moveItem', { item: tmp });
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

