// @flow

// polyfills
import 'core-js/es6/promise';
import 'core-js/fn/array/from';
import 'core-js/fn/array/find-index';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { SubspaceProvider } from 'react-redux-subspace';
import { I18nextProvider } from 'react-i18next';
import R from 'ramda';
import Browser from './containers/browser.jsx';
import createNameSpacedStore from './reducers/store';
import i18n from './util/i18n';
import type { DatasetType } from './actions/init';

let index = 0;
// const getDataset = (element: HTMLElement): OptionsType | null => R.cond([
//     [R.isNil, R.always(null)],
//     [R.T, (data: string): OptionsType => JSON.parse(data)],
// ])(element.dataset.options);
const getDataset = (element: HTMLElement): DatasetType | null => {
    let dataset = element.dataset.options;
    if (R.isNil(dataset)) {
        return null;
    }
    dataset = JSON.parse(dataset);
    dataset = {
        language: dataset.language || 'nl',
        rootFolderId: dataset.rootFolderId || dataset.root_folder_id || 'null',
        selected: dataset.selected || [],

        // permissions
        multiple: dataset.multiple || false,
        imagesOnly: dataset.imagesOnly || dataset.images_only || false,
        allowMove: dataset.allowMove || dataset.allow_move || false,
        allowUpload: dataset.allowUpload || dataset.allow_upload || false,
        allowNewFolder: dataset.allowNewFolder || dataset.allow_new_folder || false,
        allowDeleteFile: dataset.allowDeleteFile || dataset.allow_delete_file || false,
        allowDeleteFolder: dataset.allowDeleteFolder || dataset.allow_delete_folder || false,
        allowRenameFolder: dataset.allowRenameFolder || dataset.allow_rename_folder || false,
        allowEmptyRecycleBin: dataset.allowEmptyRecycleBin || dataset.allow_empty_recycle_bin || false,
    }
    return dataset;
};


// an element with the id 'tg_file_browser' will be converted to a interactive file browser
// note that there can only be one of these
const browser: HTMLElement | null = document.getElementById('tg_file_browser');

// an element with the class 'tg_file_picker' will be converted to a file selector
// note there can be multiple file selectors in a single form
const pickers: HTMLElement[] = Array.from(document.getElementsByClassName('tg_file_picker'));

const apps = [];

if (browser !== null) {
    apps.push('browser');
}
R.forEach(() => {
    apps.push(`filepicker_${index += 1}`)
}, pickers);

const { store, persistor } = createNameSpacedStore(apps);

if (browser !== null) {
    const dataset = getDataset(browser);
    let language;
    if (dataset !== null) {
        language = dataset.language;
    }
    const storeId = 'browser';
    i18n.changeLanguage(language, () => {
        ReactDOM.render(
            <I18nextProvider i18n={i18n}>
                <Provider store={store}>
                    <PersistGate
                        loading={<div>loading</div>}
                        persistor={persistor}
                    >
                        <SubspaceProvider
                            mapState={(state: State2Type): StoreType<StateType, GenericActionType> => state[storeId]}
                            namespace={storeId}
                        >
                            <Browser
                                browser={true}
                                dataset={dataset}
                            />
                        </SubspaceProvider>
                    </PersistGate>
                </Provider>
            </I18nextProvider>
            , browser);
    });
}

index = 0;

R.forEach((element: HTMLElement) => {
    const dataset = getDataset(element);
    let language;
    if (dataset !== null) {
        language = dataset.language;
    }
    const storeId = `filepicker_${index += 1}`;
    i18n.changeLanguage(language, () => {
        ReactDOM.render(
            <I18nextProvider i18n={i18n}>
                <Provider store={store}>
                    <PersistGate
                        loading={<div>loading</div>}
                        persistor={persistor}
                    >
                        <SubspaceProvider
                            mapState={(state: State2Type): StoreType<StateType, GenericActionType> => state[storeId]}
                            namespace={storeId}
                        >
                            <Browser
                                browser={false}
                                dataset={dataset}
                            />
                        </SubspaceProvider>
                    </PersistGate>
                </Provider>
            </I18nextProvider>
            , element);
    });
}, pickers);
