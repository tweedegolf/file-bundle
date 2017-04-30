// @flow
/**
 * @file       Main component, or container. All other React components in this
 *             application are child of this component, as such, it ties
 *             together the application.
 */
import React from 'react';
import { connect } from 'react-redux';
import FileDragAndDrop from 'react-file-drag-and-drop';
import R from 'ramda';
import classNames from 'classnames';
import List from '../containers/list.react';
import SelectedFiles from '../components/selected_files.react';
import SortHeader from '../components/sort_header.react';
import Toolbar from '../components/toolbar.react';
import Preview from '../components/preview.react';
import Errors from '../components/errors.react';
import * as Actions from '../actions';

type PassedPropsType = {
    browser: boolean,
    options: OptionsType,
};

type OtherPropsType = {
    children: React$Element<*>,
};

type PropsType = {
    multiple: boolean,
    imagesOnly: boolean,
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
    clipboard: FileType[],
    selected: FileType[],
};

type DefaultPropsType = {
    previewUrl: null,
    // sort: null,
    scrollPosition: null,
    loadingFolderWithId: null,
    currentFolderId: null,
    children: null,
};

type AllPropsType = PassedPropsType & PropsType & OtherPropsType;
type BrowserStateType = {};

// type DivConfigType = {
//     type: ReactClass<Config>;
//     props: $PropsOf<Config>;
//     key: ?string;
// };

const columnHeaders = {
    name: 'Naam',
    size_bytes: 'Grootte',
    create_ts: 'Aangemaakt',
};

const mapStateToProps = (state: StateType): PropsType => {
    const {
        sort,
        ascending,
    } = state.ui;

    const [currentFolderId, numItemsInCurrentFolder] = R.cond([
        [R.isNil, R.always([null, 0])],
        [R.isEmpty, R.always([null, 0])],
        [R.T, (cf: FolderType): [string, number] =>
            [cf.id, R.length(cf.folders) + R.length(cf.files)]],
    ])(state.tree.currentFolder);

    return {
        // tree props
        numItemsInCurrentFolder,
        currentFolderId,

        // ui props
        sort,
        ascending,
        previewUrl: state.ui.previewUrl,
        expanded: state.ui.expanded,
        selected: state.ui.selected,
        clipboard: state.ui.clipboard,
        loadingFolderWithId: state.ui.loadingFolderWithId, // null or number
        isAddingFolder: state.ui.isAddingFolder, // true or false
        isUploadingFiles: state.ui.isUploadingFiles, // true or false
        scrollPosition: state.ui.scrollPosition, // null or numeric value
        errors: state.ui.errors,
        multiple: state.ui.multiple,
        imagesOnly: state.ui.imagesOnly,
    };
};

const mapDispatchToProps = (dispatch: DispatchType): {dispatch: () => void} => ({ dispatch });

class Browser extends React.Component<DefaultPropsType, AllPropsType, BrowserStateType> {
    static defaultProps = {
        previewUrl: null,
        sort: null,
        scrollPosition: null,
        loadingFolderWithId: null,
        currentFolderId: null,
        children: null,
    }
    containerRef: HTMLElement
    onKeyDown: (event: Event) => void
    props: AllPropsType
    uploadFiles: (event: SyntheticEvent | DataTransfer) => void
    selectFile: (id: string) => void
    state: BrowserStateType

    constructor() {
        super();
        // select files and folders using the arrow up and -down key of your keyboard
        this.onKeyDown = (event: Event) => {
            event.stopPropagation();
            if (event.keyCode === 38) {
                Actions.setHover(-1, this.props.numItemsInCurrentFolder);
            } else if (event.keyCode === 40) {
                Actions.setHover(+1, this.props.numItemsInCurrentFolder);
            }
        };

        // upload files by drag and drop or file dialog
        this.uploadFiles = (event: SyntheticEvent | DataTransfer) => {
            if (this.props.isUploadingFiles === true || this.props.loadingFolderWithId !== -1) {
                return;
            }
            if (event instanceof DataTransfer) {
                Actions.uploadFiles(event.files);
            } else {
                const target = event.target;
                if (target instanceof HTMLInputElement) {
                    Actions.uploadFiles(Array.from(target.files));
                }
            }
        };

        // files can be selected by clicking the checkbox in front of the filename
        // in the filelist
        this.selectFile = (id: string) => {
            /**
             * User has already clicked on the 'cut' button so she can't select files
             * anymore until she pastes or cancels.
             */
            if (this.props.clipboard.length > 0) {
                return;
            }

            Actions.selectFile({
                id,
                multiple: this.props.multiple,
                browser: this.props.browser,
            });
        };
    }

    componentDidMount() {
        // Filepicker mode: the selected files can be set in the dataset of the HTML
        // element.
        if (this.props.browser === false) {
            Actions.init(this.props.options);
        }

        // Browser mode: by default, the browser is not expanded, therefor we have
        // to call the expandBrowser action to expand the browser
        if (this.props.browser === true) {
            // The keydown listener listens for arrow up and down keys allowing the
            // user to select files and folders with her keyboard.
            document.addEventListener('keydown', this.onKeyDown, false);
            Actions.expandBrowser();
            Actions.init(this.props.options);
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
            Actions.setScrollPosition(null);
        }
    }

    componentWillUnmount() {
        if (this.props.browser) {
            document.removeEventListener('keydown', this.onKeyDown, false);
        }
    }

    // render() {
    // render(): ?React$Element<*> {
    render(): ?React$Element<any> {
        if (R.isNil(this.props.currentFolderId)) {
            return <div>initializing...</div>;
        }

        const headers = R.map(([column, name]: [string, string]): SortHeader =>
            <SortHeader
              key={column}
              sortBy={Actions.changeSorting}
              sort={this.props.sort}
              ascending={this.props.ascending}
              column={column}
              name={name}
            />, R.toPairs(columnHeaders));

        const toolbar = (<Toolbar
          selected={this.props.selected}
          clipboard={this.props.clipboard}
          currentFolderId={this.props.currentFolderId}
          isAddingFolder={this.props.isAddingFolder}
          browser={this.props.browser}
          onCut={Actions.cutFiles}
          onPaste={Actions.pasteFiles}
          onCancel={Actions.cancelCutAndPasteFiles}
          uploadFiles={this.uploadFiles}
          onAddFolder={Actions.addFolder}
          isUploadingFiles={this.props.isUploadingFiles}
          loadingFolderWithId={this.props.loadingFolderWithId}
        />);

        const selected = (<SelectedFiles
          browser={this.props.browser}
          multiple={this.props.multiple}
          selected={this.props.selected}
          clipboard={this.props.clipboard}
          selectFile={this.selectFile}
          showPreview={Actions.showPreview}
        />);

        const preview = <Preview url={this.props.previewUrl} />;

        if (this.props.expanded === false) {
            return (<div>
                {selected}
                {preview}
                <button
                  type="button"
                  className="btn btn-default expand-button"
                  onClick={Actions.expandBrowser}
                >
                  Bladeren
                  <span className="fa fa-folder-open-o" />
                </button>
            </div>);
        }

        let buttonExpand = null;
        if (this.props.browser === false) {
            buttonExpand = (<button
              type="button"
              className="btn btn-default btn-xs collapse-button"
              onClick={Actions.expandBrowser}
            >
                <span className="fa fa-chevron-up" />
            </button>);
        }

        const browserClassName = classNames('file-browser', {
            'text-left': this.props.browser === false,
            'text-left-fullpage': this.props.browser === true,
        });

        return (
            <div className="text-center">
                {selected}
                {preview}
                <div className={browserClassName}>
                    <FileDragAndDrop onDrop={this.uploadFiles}>
                        {toolbar}
                        <Errors
                          errors={this.props.errors}
                          onDismiss={Actions.dismissError}
                        />
                        <div ref={(div: HTMLElement) => { this.containerRef = div; }} className="table-container">
                            <table className="table table-condensed">
                                <thead>
                                    <tr>
                                        <th className="select" />
                                        <th className="preview" />
                                        {headers}
                                        <th className="buttons" />
                                    </tr>
                                </thead>
                                <List
                                  // deleteFile={R.curry(deleteFile)(this.props.currentFolder.id)}
                                  selectFile={this.selectFile}
                                  browser={this.props.browser}
                                  imagesOnly={this.props.imagesOnly}
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

export default connect(mapStateToProps, mapDispatchToProps)(Browser);
