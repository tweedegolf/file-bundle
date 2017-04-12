// @flow
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import R from 'ramda';
import Browser from './containers/browser.react';
import { getStore } from './reducers/store';

const store: StoreType = getStore();
const getOptions = (element: HTMLElement | null): HTMLElement | null => R.cond([
    [R.isNil, R.always(null)],
    [R.T, (data: any) => JSON.parse(data)],
])(element.dataset.options);

// an element with the id 'tg_file_browser' will be converted to a interactive file browser
// note that there can only be one of these
const browser: HTMLElement | null = document.getElementById('tg_file_browser');
if (browser !== null) {
    ReactDOM.render(<Provider store={store} >
        <Browser
          browser={true}
          options={getOptions(browser)}
        />
    </Provider>, browser);
}


// an element with the class 'tg_file_picker' will be converted to a file selector
// note there can be multiple file selectors in a single form
const pickers = document.getElementsByClassName('tg_file_picker');
R.forEach((element: HTMLElement) => {
    ReactDOM.render(<Provider store={store} >
        <Browser
          browser={false}
          options={getOptions(element)}
        />
    </Provider>, element);
}, pickers);
