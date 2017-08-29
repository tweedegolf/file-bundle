// @flow

// polyfills
import 'core-js/es6/promise';
import 'core-js/fn/array/from';
import 'core-js/fn/array/find-index';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import R from 'ramda';
import Browser from './containers/browser.react';
import { getStore } from './reducers/store';
import i18n from './util/i18n';
import type { OptionsType } from './actions/init';

const store: StoreType<StateType, GenericActionType> = getStore();
const getOptions = (element: HTMLElement): OptionsType | null => R.cond([
    [R.isNil, R.always(null)],
    [R.T, (data: string): OptionsType => JSON.parse(data)],
])(element.dataset.options);

// an element with the id 'tg_file_browser' will be converted to a interactive file browser
// note that there can only be one of these
const browser: HTMLElement | null = document.getElementById('tg_file_browser');
if (browser !== null) {
    const options = getOptions(browser);
    let language;
    if (options !== null) {
        language = options.language;
    }
    // language = 'nl';
    // language = 'de';
    i18n.changeLanguage(language, () => {
        ReactDOM.render(<I18nextProvider i18n={i18n}>
            <Provider store={store} >
                <Browser
                  browser={true}
                  options={options}
                />
            </Provider>
        </I18nextProvider>, browser);
    });
}


// an element with the class 'tg_file_picker' will be converted to a file selector
// note there can be multiple file selectors in a single form
const pickers: HTMLElement[] = Array.from(document.getElementsByClassName('tg_file_picker'));
R.forEach((element: HTMLElement) => {
    const options = getOptions(element);
    let language;
    if (options !== null) {
        language = options.language;
    }
    // language = 'nl-NL';
    // language = 'de-DE';
    i18n.changeLanguage(language, () => {
        ReactDOM.render(<I18nextProvider i18n={i18n}>
            <Provider store={store} >
                <Browser
                  browser={false}
                  options={options}
                />
            </Provider>
        </I18nextProvider>, element);
    });
}, pickers);
