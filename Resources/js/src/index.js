import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Browser from './containers/browser.react';
import { getStore } from './reducers/store';

const store = getStore();

// an element with the id 'tg_file_browser' will be converted to a interactive file browser
// note that there can only be one of these
const browser = document.getElementById('tg_file_browser');

if (browser !== null) {
    ReactDOM.render(<Provider store={store} >
        <Browser
          browser={true}
        />
    </Provider>, browser);
}


// an element with the class 'tg_file_picker' will be converted to a file selector
// note there can be multiple file selectors in a single form
const pickers = document.getElementsByClassName('tg_file_picker');
if (pickers.length > 0) {
    Array.from(pickers).forEach((element) => {
        let options = element.dataset.options;
        if (options === '' || typeof options === 'undefined') {
            options = null;
        } else {
            options = JSON.parse(options);
        }
        ReactDOM.render(<Provider store={store} >
            <Browser
              browser={false}
              options={options}
            />
        </Provider>, element);
    });
}