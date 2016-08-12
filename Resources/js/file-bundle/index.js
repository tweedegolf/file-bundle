import React from 'react';
import ReactDOM from 'react-dom';
import Browser from './components/browser.react.js';
import _ from 'lodash';
import {Provider} from 'react-redux'
import getStore from './get_store'



// an element with the id 'tg_file_browser' will be converted to a interactive file browser
// note that there can only be one of these
var browser = document.getElementById('tg_file_browser');
var options = {
    selected: [
        {"id":4,"name":"OliveDrab.jpg","size_bytes":2087,"size":"2 kB","create_ts":1470914525,"created":"11-08-2016 13:22","thumb":"http:\/\/localhost:8080\/media\/cache\/admin_thumb\/57ac5fdd4aa99_OliveDrab.jpg","original":"\/media\/57ac5fdd4aa99_OliveDrab.jpg","type":"jpg"},
        {"id":5,"name":"DodgerBlue.jpg","size_bytes":2086,"size":"2 kB","create_ts":1470914525,"created":"11-08-2016 13:22","thumb":"http:\/\/localhost:8080\/media\/cache\/admin_thumb\/57ac5fdd4f51a_DodgerBlue.jpg","original":"\/media\/57ac5fdd4f51a_DodgerBlue.jpg","type":"jpg"},
    ]
}
//<Browser browser={true} options={options}/> --> works
//<Browser browser={false} options={options}/> --> file not found error (need to implement local cache)
//<Browser browser={true}/>

if (null !== browser) {
     ReactDOM.render(
        <Provider store={getStore()}>
            <Browser browser={true}/>
        </Provider>,
        browser
    );
}

// an element with the class 'tg_file_picker' will be converted to a file selector
// note there can be multiple file selectors in a single form
var pickers = document.getElementsByClassName('tg_file_picker');
if (pickers.length > 0) {
    _.forEach(pickers, (element) => {
        var options = JSON.parse(element.dataset.options);
        ReactDOM.render(<Browser browser={false} options={options} />, element);
    });

}
