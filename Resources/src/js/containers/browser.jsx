// @flow
/**
 * @file       Main component, or container. All other React components in this
 *             application are child of this component, as such, it ties
 *             together the application.
 */
import R from 'ramda';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FileDragAndDrop from 'react-file-drag-and-drop';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import List from '../containers/list.jsx';
import SelectedFiles from '../components/selected_files.jsx';
import SortHeader from '../components/sort_header.jsx';
import Toolbar from '../components/toolbar.jsx';
import Preview from '../components/preview.jsx';
import Errors from '../components/errors.jsx';
import getSelectedFiles from '../reducers/get_selected_files';
import * as Actions from '../actions/index';
import { RECYCLE_BIN_ID } from '../util/constants';
import type { DatasetType, PermissionsType } from '../actions/init';
import type { SortEnumType, ActionChangeSortingType } from '../actions/index';

// START FLOW TYPES

type PassedPropsType = {
    browser: boolean,
    dataset: DatasetType,
    t: (string) => string,
};

type OtherPropsType = {
    children: React$Element<*>,
};

type PropsType = {
    permissions: PermissionsType,
    scrollPosition: null | number,
    sort: string,
    previewUrl: null | string,
    ascending: boolean,
    expanded: boolean,
    currentFolderId: string,
    isAddingFolder: boolean,
    isUploadingFiles: boolean,
    loadingFolderWithId: null | string,
    numItemsInCurrentFolder: number,
    errors: ErrorType[],
    clipboard: ClipboardType,
    selected: ClipboardType,
    selectedFiles: FileType[],
    showingRecycleBin: boolean,
    currentFolderName: string,
};

type DefaultPropsType = {
    previewUrl: null,
    // sort: null,
    scrollPosition: null,
    loadingFolderWithId: null,
    currentFolderId: null,
    children: null,
};


type ActionsPropsType = {
    init: (DatasetType, boolean) => ReduxThunkType,
    setHover: (number, number) => GenericActionType,
    uploadFiles: (File[] | FileList) => ReduxThunkType,
    expandBrowser: () => BasicActionType,
    setScrollPosition: (number | null) => GenericActionType,
    changeSorting: (SortEnumType) => ActionChangeSortingType,
    openFolder: (string) => ReduxThunkType,
    cutFiles: () => BasicActionType,
    moveItems: () => ReduxThunkType,
    cancelMoveItems: () => BasicActionType,
    addFolder: (string) => ReduxThunkType,
    openRecycleBin: () => ReduxThunkType,
    closeRecycleBin: () => ReduxThunkType,
    emptyRecycleBin: () => ReduxThunkType,
    selectFile: (string) => GenericActionType,
    showPreview: (null | string) => GenericActionType,
    dismissError: (string) => GenericActionType,
};

type AllPropsType = PassedPropsType & PropsType & OtherPropsType & ActionsPropsType;
type BrowserStateType = {};

// type DivConfigType = {
//     type: ReactClass<Config>;
//     props: $PropsOf<Config>;
//     key: ?string;
// };

// END FLOW TYPES

const columnHeaderIds: [string, string, string] = ['name', 'size_bytes', 'create_ts'];

const mapStateToProps = (state: StateType, ownProps: PassedPropsType): PropsType => {
    const {
        sort,
        ascending,
        currentFolderId,
    } = state.ui;

    let numItemsInCurrentFolder = 0;
    let currentFolderName = '';

    if (currentFolderId === RECYCLE_BIN_ID) {
        const bin = state.tree.recycleBin;
        numItemsInCurrentFolder = R.length(bin.folders) + R.length(bin.files);
        currentFolderName = ownProps.t('recycleBin');
    } else {
        const currentFolder: TreeFolderType = state.tree.tree[currentFolderId];
        if (typeof currentFolder !== 'undefined') {
            numItemsInCurrentFolder = R.length(currentFolder.folderIds) + R.length(currentFolder.fileIds);
            currentFolderName = state.tree.foldersById[currentFolderId].name;
        }
    }

    return {
        // tree props
        numItemsInCurrentFolder,
        currentFolderId,

        // ui props
        sort,
        ascending,
        selectedFiles: getSelectedFiles(state),
        previewUrl: state.ui.previewUrl,
        expanded: state.ui.expanded,
        selected: state.ui.selected,
        clipboard: state.ui.clipboard,
        loadingFolderWithId: state.ui.loadingFolderWithId, // null or number
        isAddingFolder: state.ui.isAddingFolder, // true or false
        isUploadingFiles: state.ui.isUploadingFiles, // true or false
        scrollPosition: state.ui.scrollPosition, // null or numeric value
        errors: state.ui.errors,
        permissions: state.ui.permissions,
        showingRecycleBin: state.ui.showingRecycleBin,
        currentFolderName,
    };
};

const mapDispatchToProps = (dispatch: DispatchType): ActionsPropsType => {
    return {
        ...bindActionCreators({
            init: Actions.init,
            setHover: Actions.setHover,
            uploadFiles: Actions.uploadFiles,
            expandBrowser: Actions.expandBrowser,
            setScrollPosition: Actions.setScrollPosition,
            changeSorting: Actions.changeSorting,
            openFolder: Actions.openFolder,
            cutFiles: Actions.cutFiles,
            moveItems: Actions.moveItems,
            cancelMoveItems: Actions.cancelMoveItems,
            addFolder: Actions.addFolder,
            openRecycleBin: Actions.openRecycleBin,
            closeRecycleBin: Actions.closeRecycleBin,
            emptyRecycleBin: Actions.emptyRecycleBin,
            selectFile: Actions.selectFile,
            showPreview: Actions.showPreview,
            dismissError: Actions.dismissError,
        }, dispatch)
    };
}

class Browser extends React.Component<DefaultPropsType, AllPropsType, BrowserStateType> {
    static defaultProps = {
        previewUrl: null,
        sort: null,
        scrollPosition: null,
        loadingFolderWithId: null,
        currentFolderId: null,
        children: null,
    }

    constructor(props: AllPropsType) {
        super(props);
        // select files and folders using the arrow up and -down key of your keyboard
        this.onKeyDown = (event: Event) => {
            event.stopPropagation();
            if (event.keyCode === 38) {
                this.props.setHover(+1, this.props.numItemsInCurrentFolder);
            } else if (event.keyCode === 40) {
                this.props.setHover(-1, this.props.numItemsInCurrentFolder);
            }
        };

        // upload files by drag and drop or file dialog
        this.uploadFiles = (event: SyntheticEvent | DataTransfer) => {
            if (this.props.isUploadingFiles === true || this.props.loadingFolderWithId !== null) {
                return;
            }
            // Phantomjs' page object does not recognize SyntheticEvent nor DataTransfer, so this
            // flow error can not be fixed
            if (typeof DataTransfer === 'undefined') {
                this.props.uploadFiles(event.target.files);
                return;
            }

            if (event instanceof DataTransfer) {
                this.props.uploadFiles(event.files);
            } else {
                const target = event.target;
                if (target instanceof HTMLInputElement) {
                    this.props.uploadFiles(Array.from(target.files));
                }
            }
        };
    }

    state: BrowserStateType

    componentDidMount() {
        // Filepicker mode: the selected files can be set in the dataset of the HTML
        // element.
        if (this.props.browser === false) {
            document.addEventListener('keydown', this.onKeyDown, false);
            this.props.init(this.props.dataset, this.props.browser);
        }

        // Browser mode: by default, the browser is not expanded, therefor we have
        // to call the expandBrowser action to expand the browser
        if (this.props.browser === true) {
            // The keydown listener listens for arrow up and down keys allowing the
            // user to select files and folders with her keyboard.
            document.addEventListener('keydown', this.onKeyDown, false);
            this.props.expandBrowser();
            this.props.init(this.props.dataset, this.props.browser);
        }
    }

    componentDidUpdate() {
        // After the component has been updated, we might need to scroll the file
        // list. For instance after new files have been uploaded, the file list
        // needs to be scrolled to the top (scroll position 0) to make sure that the
        // newly uploaded files are in the visible area of the scroll list. Another
        // use case might be when the user has searched for a certain file; if
        // found, the scroll list can highlight the file an scroll it into the
        // visible area if needed.
        if (this.props.scrollPosition !== null) {
            this.containerRef.scrollTop = this.props.scrollPosition;
            this.props.setScrollPosition(null);
        }
    }

    componentWillUnmount() {
        if (this.props.browser) {
            document.removeEventListener('keydown', this.onKeyDown, false);
        }
    }

    onKeyDown: (event: Event) => void
    containerRef: HTMLElement
    props: AllPropsType
    uploadFiles: (event: SyntheticEvent | DataTransfer) => void
    selectFile: (file: string) => void

    // render() {
    // render(): ?React$Element<*> {
    render(): ?React$Element<any> {
        // if (typeof this.props.currentFolderId === 'undefined') {
        //     return <div>initializing...</div>;
        // }
        const headers = R.map((columnId: string): SortHeader =>
            <SortHeader
                key={columnId}
                sortBy={this.props.changeSorting}
                sort={this.props.sort}
                ascending={this.props.ascending}
                columnId={columnId}
            />, columnHeaderIds);

        const toolbar = (<Toolbar
            permissions={this.props.permissions}
            selected={this.props.selected}
            clipboard={this.props.clipboard}
            currentFolderId={this.props.currentFolderId}
            isAddingFolder={this.props.isAddingFolder}
            browser={this.props.browser}
            uploadFiles={this.uploadFiles}
            openFolder={this.props.openFolder}
            onCut={this.props.cutFiles}
            onPaste={this.props.moveItems}
            onCancel={this.props.cancelMoveItems}
            onAddFolder={this.props.addFolder}
            showRecycleBin={this.props.openRecycleBin}
            hideRecycleBin={this.props.closeRecycleBin}
            emptyRecycleBin={this.props.emptyRecycleBin}
            isUploadingFiles={this.props.isUploadingFiles}
            loadingFolderWithId={this.props.loadingFolderWithId}
            showingRecycleBin={this.props.showingRecycleBin}
            currentFolderName={this.props.currentFolderName}
        />);


        let selected = null;
        if (this.props.browser === false) {
            // selected files for filepicker mode
            selected = (<SelectedFiles
                selectedFiles={this.props.selectedFiles}
                selectFile={this.props.selectFile}
                showPreview={this.props.showPreview}
            />);
        }

        const preview = <Preview
            url={this.props.previewUrl}
            showPreview={this.props.showPreview}
        />;

        if (this.props.expanded === false) {
            return (<div>
                {selected}
                {preview}
                <button
                    type="button"
                    className="btn btn-default expand-button"
                    onClick={this.props.expandBrowser}
                >
                    {this.props.t('browse')}
                    <span className="fa fa-folder-open-o" />
                </button>
            </div>);
        }

        let buttonExpand = null;
        if (this.props.browser === false) {
            buttonExpand = (<button
                type="button"
                className="btn btn-default btn-xs collapse-button"
                onClick={this.props.expandBrowser}
            >
                <span className="fa fa-chevron-up" />
            </button>);
        }

        const browserClassName = classNames('file-browser', 'text-left', {
            fullpage: this.props.browser === true,
        });

        return (
            <div className="text-center" >
                {selected}
                {preview}
                <div className={browserClassName} >
                    <FileDragAndDrop onDrop={this.uploadFiles}>
                        {toolbar}
                        <Errors
                            errors={this.props.errors}
                            onDismiss={this.props.dismissError}
                        />
                        <div ref={(div: HTMLElement) => { this.containerRef = div; }} className="table-container">
                            <table className="table table-condensed">
                                <thead>
                                    <tr>
                                        <th />
                                        <th />
                                        {headers}
                                        <th />
                                    </tr>
                                </thead>
                                <List
                                    browser={this.props.browser}
                                />
                            </table>
                        </div>
                    </FileDragAndDrop>
                </div>
                {buttonExpand}
            </div>
        );
    }
}

export default translate('common')(connect(mapStateToProps, mapDispatchToProps)(Browser));
