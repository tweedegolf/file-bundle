import React from 'react';
import ReactDOM from 'react-dom';
import Browser from './containers/browser.react.js';
import {Provider} from 'react-redux'
import getStore from './get_store'

const store = getStore()

// an element with the id 'tg_file_browser' will be converted to a interactive file browser
// note that there can only be one of these
let browser = document.getElementById('tg_file_browser');
let dataset = {
    selected: [
        {"id":1,"name":"Olive.jpg","size_bytes":2087,"size":"2 kB","create_ts":1470914525,"created":"11-08-2016 13:22","thumb":"http:\/\/localhost:8080\/media\/cache\/admin_thumb\/57ac5fdd4aa99_OliveDrab.jpg","original":"\/media\/57ac5fdd4aa99_OliveDrab.jpg","type":"jpg"},
        {"id":5,"name":"DodgerBlue.jpg","size_bytes":2086,"size":"2 kB","create_ts":1470914525,"created":"11-08-2016 13:22","thumb":"http:\/\/localhost:8080\/media\/cache\/admin_thumb\/57ac5fdd4f51a_DodgerBlue.jpg","original":"\/media\/57ac5fdd4f51a_DodgerBlue.jpg","type":"jpg"},
    ]
}

if(browser !== null){
  ReactDOM.render(
    <Provider store={store}>
      <Browser browser={true} options={dataset}/>
    </Provider>,
    browser
  );
}

// an element with the class 'tg_file_picker' will be converted to a file selector
// note there can be multiple file selectors in a single form
let pickers = document.getElementsByClassName('tg_file_picker');
if(pickers.length > 0){
  Array.from(pickers).forEach(element => {
    let options = JSON.parse(element.dataset.options);
    ReactDOM.render(<Browser browser={false} options={options} />, element);
  });
}
