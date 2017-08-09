import React from 'react';
import ReactDOM from 'react-dom';
import Browser from './components/browser.react.js';
import _ from 'lodash';

// an element with the id 'tg_file_browser' will be converted to a interactive file browser
// note that there can only be one of these
var browser = document.getElementById('tg_file_browser');
var options = {
  allow_new_folder: true,
  allow_upload: true,
  allow_delete: true,
};
if (null !== browser) {
    var apiUrl = browser.dataset.apiUrl;
    ReactDOM.render(<Browser browser={true} options={options} apiUrl={apiUrl}/>, browser);
}

// an element with the class 'tg_file_picker' will be converted to a file selector
// note there can be multiple file selectors in a single form
var pickers = document.getElementsByClassName('tg_file_picker');
if (pickers.length > 0) {
    _.forEach(pickers, (element) => {
        var options = JSON.parse(element.dataset.options);
        var apiUrl = element.dataset.apiUrl;
        ReactDOM.render(<Browser browser={false} options={options} apiUrl={apiUrl}/>, element);
    });
}
