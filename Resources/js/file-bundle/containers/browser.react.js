/**
 * @file       Main component, or container. All other React components in this
 *             application are child of this component, as such, it ties
 *             together the application.
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FileDragAndDrop from 'react-file-drag-and-drop';
import R from 'ramda';
import classNames from 'classnames';
import List from '../containers/list.react';
import SelectedFiles from '../components/selected_files.react';
import SortHeader from '../components/sort_header.react';
import Toolbar from '../components/toolbar.react';
import Preview from '../components/preview.react';
import Errors, { errorShape } from '../components/errors.react';
import * as Actions from '../actions';
import { fileShape } from '../components/file.react';
import { folderShape } from '../components/folder.react';

const columnHeaders = {
    name: 'Naam',
    size_bytes: 'Grootte',
    create_ts: 'Aangemaakt',
};

const mapStateToProps = (state) => {
    const {
        sort,
        ascending,
    } = state.ui;

    return {
        // tree props
        currentFolder: state.tree.current_folder,

        // ui props
        sort,
        ascending,
        preview: state.ui.preview,
        expanded: state.ui.expanded,
        selected: state.ui.selected,
        clipboard: state.ui.clipboard,
        loadingFolderWithId: state.ui.loading_folder, // null or number
        isAddingFolder: state.ui.adding_folder, // true or false
        isUploadingFiles: state.ui.uploading_files, // true or false
        scrollPosition: state.ui.scroll_position, // null or numeric value
        errors: state.ui.errors,
    };
};

const mapDispatchToProps = dispatch => ({ dispatch });

// Use the @connect decorator to make the state available as properties
@connect(mapStateToProps, mapDispatchToProps)
export default class Browser extends React.Component {

    static propTypes = {
        browser: PropTypes.bool.isRequired,
        options: PropTypes.shape({
            selected: PropTypes.number,
            multiple: PropTypes.bool,
            images_only: PropTypes.bool,
        }),
        scrollPosition: PropTypes.number,
        sort: PropTypes.string,
        preview: PropTypes.string,
        ascending: PropTypes.bool.isRequired,
        expanded: PropTypes.bool.isRequired,
        currentFolder: PropTypes.shape(folderShape),
        isAddingFolder: PropTypes.bool.isRequired,
        isUploadingFiles: PropTypes.bool.isRequired,
        loadingFolderWithId: PropTypes.number,
        errors: PropTypes.arrayOf(PropTypes.shape(errorShape)).isRequired,
        clipboard: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
        selected: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
   }

    static defaultProps = {
        options: null,
        preview: null,
        sort: null,
        scrollPosition: null,
        loadingFolderWithId: null,
        currentFolder: null,
    }

    constructor(props) {
        super(props);
        // select files and folders using the arrow up and -down key of your keyboard
        this.onKeyDown = (event) => {
            event.stopPropagation();
            if (event.keyCode === 38) {
                Actions.setHover(-1, this.props.currentFolder.id);
            } else if (event.keyCode === 40) {
                Actions.setHover(+1, this.props.currentFolder.id);
            }
        };

        // upload files by drag and drop or file dialog
        this.uploadFiles = (event) => {
            if (this.props.isUploadingFiles === true || this.props.loadingFolderWithId !== -1) {
                return;
            }
            if (R.isNil(event.files) === false) {
                Actions.upload(event.files, this.props.currentFolder.id);
            } else {
                Actions.upload(Array.from(event.target.files), this.props.currentFolder.id);
            }
        };

        this.canSelectMultipleFiles = R.isNil(props.options) === false &&
            R.isNil(props.options.multiple) === false;
    }

    componentDidMount() {
        // Filepicker mode: the selected files can be set in the dataset of the HTML
        // element.
        if (this.props.browser === false) {
            let selected = null;
            if (this.props.options !== null) {
                selected = this.props.options.selected;
            }
            Actions.init(selected);
        }

        // Browser mode: by default, the browser is not expanded, therefor we have
        // to call the expandBrowser action to expand the browser
        if (this.props.browser === true) {
            // The keydown listener listens for arrow up and down keys allowing the
            // user to select files and folders with her keyboard.
            document.addEventListener('keydown', this.onKeyDown, false);
            Actions.expandBrowser();
            Actions.init();
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

    render() {
        const headers = R.map(([column, name]) =>
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
          current_folder={this.props.currentFolder}
          adding_folder={this.props.isAddingFolder}
          browser={this.props.browser}
          onCut={Actions.cutFiles}
          onPaste={Actions.pasteFiles}
          onCancel={Actions.cancelCutAndPasteFiles}
          uploadFiles={this.uploadFiles}
          onAddFolder={Actions.addFolder}
          isUploadingFiles={this.props.isUploadingFiles}
          loading_folder={this.props.loadingFolderWithId}
        />);

        const selected = (<SelectedFiles
          browser={this.props.browser}
          multiple={this.canSelectMultipleFiles}
          selected={this.props.selected}
          clipboard={this.props.clipboard}
          selectFile={Actions.selectFile}
          showPreview={Actions.showPreview}
        />);

        const preview = <Preview file={this.props.preview} />;

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
                        <div ref={(div) => { this.containerRef = div; }} className="table-container">
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
                                  browser={this.props.browser} 
                                  imagesOnly={this.props.options ? this.props.options.images_only : false} 
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
