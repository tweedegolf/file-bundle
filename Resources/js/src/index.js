import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import R from 'ramda';
import Browser from './containers/browser.react';
import { getStore } from './reducers/store';

const store = getStore();

// an element with the id 'tg_file_browser' will be converted to a interactive file browser
// note that there can only be one of these
const browser = document.getElementById('tg_file_browser');
const getOptions = element => R.cond([
    [R.isNil, R.always(null)],
    [R.T, options => JSON.parse(options)],
])(element.dataset.options);

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
R.forEach((element) => {
    ReactDOM.render(<Provider store={store} >
        <Browser
          browser={false}
          options={getOptions(element)}
        />
    </Provider>, element);
}, pickers);
