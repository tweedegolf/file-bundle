/**
 * @file       Main component, or container. All other React components in this
 *             application are child of this component, as such, it ties
 *             together the application.
 */

import React from 'react';
import { connect } from 'react-redux';
import FileDragAndDrop from 'react-file-drag-and-drop';
import List from '../components/list.react';
import SortHeader from '../components/sort_header.react';
import Toolbar from '../components/toolbar.react';
import SelectedFiles from '../components/selected_files.react';
import Errors from '../components/errors.react';
import Actions from '../actions';
import { sortBy } from '../util/util';

const mapStateToProps = (state) => {
    const {
    sort,
    ascending,
  } = state.ui;

    return {
        // tree props
        folders: sortBy(state.tree.folders, sort, ascending),
        files: sortBy(state.tree.files, sort, ascending),
        current_folder: state.tree.current_folder,
        parent_folder: state.tree.parent_folder,

        // ui props
        sort,
        ascending,
        preview: state.ui.preview,
        expanded: state.ui.expanded,
        hover: state.ui.hover,
        selected: state.ui.selected,
        clipboard: state.ui.clipboard,
        loading_folder: state.ui.loading_folder, // null or number
        confirm_delete: state.ui.confirm_delete, // null or number
        deleting_file: state.ui.deleting, // null or number
        deleting_folder: state.ui.deleting, // null or number
        adding_folder: state.ui.adding_folder, // true or false
        uploading_files: state.ui.uploading_files, // true or false
        scroll_position: state.ui.scroll_position, // null or numeric value
        errors: state.ui.errors,
    };
};

const mapDispatchToProps = function (dispatch) {
    return {
        dispatch,
    };
};

// Use the @connect decorator to make the state available as properties
@connect(mapStateToProps, mapDispatchToProps)
export default class Browser extends React.Component {

    constructor(props) {
        super(props);
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
            document.addEventListener('keydown', this.onKeyDown.bind(this), false);
            Actions.expandBrowser();
            Actions.init();
        }
    }


    componentWillUnmount() {
        if (this.props.browser) {
            document.removeEventListener('keydown', this.onKeyDown.bind(this), false);
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
        if (this.props.scroll_position !== null) {
            this.refs.container.scrollTop = this.props.scroll_position;
            Actions.setScrollPosition(null);
        }
    }


    render() {
        const headers = Object.entries({
            name: 'Naam',
            size_bytes: 'Grootte',
            create_ts: 'Aangemaakt',
        }).map(([column, name]) =>
            <SortHeader
              key={column}
              sortBy={this.sortBy.bind(this)}
              sort={this.props.sort}
              ascending={this.props.ascending}
              column={column}
              name={name}
            />,
    );

        const toolbar = (<Toolbar
          selected={this.props.selected}
          clipboard={this.props.clipboard}
          current_folder={this.props.current_folder}
          adding_folder={this.props.adding_folder}
          browser={this.props.browser}
          onCut={this.onCut.bind(this)}
          onPaste={this.onPaste.bind(this)}
          onCancel={this.onCancel.bind(this)}
          onUpload={this.onUpload.bind(this)}
          onAddFolder={this.onAddFolder.bind(this)}
          uploading={this.props.uploading_files}
        />);

        let selected = null;
        if (!this.props.browser && this.props.selected.length > 0) {
            selected = (<SelectedFiles
              selected={this.props.selected}
              onSelect={this.onSelect.bind(this)}
              onPreview={this.onPreview.bind(this)}
            />);
        }

        let browser = null;
        const browser_class = `file-browser text-left${this.props.browser ? ' fullpage' : ''}`;

        let preview = null;
        if (this.props.preview !== null) {
            preview = (<div
              className="preview-image"
              onClick={this.onPreview.bind(this, null)}
            >
                <div style={{ backgroundImage: `url(${this.props.preview})` }} />
            </div>);
        }

        if (this.props.expanded) {
            browser = (
                <div className="text-center">
                    {selected}
                    {preview}
                    <div className={browser_class}>
                        <FileDragAndDrop onDrop={this.handleDrop.bind(this)}>
                            {toolbar}
                            <Errors errors={this.props.errors} onDismiss={this.onDismiss.bind(this)} />
                            <div ref="container" className="table-container">
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
                                      files={this.props.files}
                                      folders={this.props.folders}
                                      current_folder={this.props.current_folder}
                                      parent_folder={this.props.parent_folder}
                                      onSelect={this.onSelect.bind(this)}
                                      onPreview={this.onPreview.bind(this)}
                                      hover={this.props.hover}
                                      selected={this.props.selected}
                                      clipboard={this.props.clipboard}
                                      browser={this.props.browser}
                                      confirm_delete={this.props.confirm_delete}
                                      loading={this.props.loading_folder}
                                      images_only={this.props.options ? this.props.options.images_only : false}
                                      onDelete={this.onDelete.bind(this)}
                                      onDeleteFolder={this.onDeleteFolder.bind(this)}
                                      onConfirmDelete={this.onConfirmDelete.bind(this)}
                                      onOpenFolder={this.onOpenFolder.bind(this)}
                                    />
                                </table>
                            </div>
                        </FileDragAndDrop>
                    </div>
                    {this.props.browser === false
            ? <button
              type="button"
              className="btn btn-default btn-xs collapse-button"
              onClick={this.toggleExpand.bind(this)}
            >
                <span className="fa fa-chevron-up" />
            </button>
            : null
          }
                </div>
      );
        } else {
            browser = (<div>
                {selected}
                {preview}
                <button
                  type="button"
                  className="btn btn-default expand-button"
                  onClick={this.toggleExpand.bind(this)}
                >
          Bladeren
          <span className="fa fa-folder-open-o" />
                </button>
            </div>);
        }

        return browser;
    }

  // select files and folders using the arrow up and -down key of your keyboard
    onKeyDown(event) {
        event.stopPropagation();
        if (event.keyCode === 38) {
            Actions.setHover(-1, this.props.current_folder.id);
        } else if (event.keyCode === 40) {
            Actions.setHover(+1, this.props.current_folder.id);
        }
    }

  // when the user clicks on the thumb of an image, a fullscreen version will
  // be shown
    onPreview(image_url, e) {
        e.stopPropagation();
        Actions.showPreview(image_url);
    }

  // user removes error from error list by clicking the cross icon next to the
  // error message
    onDismiss(error_id) {
        Actions.dismissError(error_id);
    }

  // user clicks the delete button next to a file in the file list; this will
  // trigger a confirmation popup
    onDelete(id) {
        Actions.deleteFile(id, this.props.current_folder.id);
    }

  // user confirms that she wants to delete the file by clicking OK in the
  // confirmation popup
    onConfirmDelete(id) {
        Actions.confirmDelete(id);
    }

    onDeleteFolder(id) {
        Actions.deleteFolder(id, this.props.current_folder.id);
    }

  // files that are currently in selected will be moved to the clipboard
    onCut() {
        Actions.cutFiles(this.props.current_folder.id);
    }

  // user cancels cut & paste action
    onCancel() {
        Actions.cancelCutAndPasteFiles();
    }

  // files in the clipboard are moved to the selected folder
    onPaste() {
        Actions.pasteFiles(this.props.clipboard, this.props.current_folder.id);
    }

  // files can be selected by clicking the checkbox in front of the filename
  // in the filelist
    onSelect(id) {
    /**
     * User has already clicked on the 'cut' button so she can't select files
     * anymore until she pastes or cancels.
     */
        if (this.props.clipboard.length > 0) {
            return;
        }

    /**
     * In Filepicker mode you can set the multiple option to false which
     * restrict the user to select only one file at the time.
     *
     * @type       {boolean}
     */
        let multiple = true;
        if (this.props.options && this.props.options.multiple) {
            multiple = this.props.options.multiple;
        }

        Actions.selectFile({
            id,
            multiple,
            browser: this.props.browser,
        });
    }

    // user has selected a different sort column or sort order in the toolbar
    sortBy(column) {
        Actions.changeSorting(column);
    }

    // in Filepicker mode the browser can be collapsed and expanded
    toggleExpand() {
        Actions.expandBrowser();
    }

    // user can drag and drop files onto the filebrowser to upload files
    handleDrop(dataTransfer) {
        this.doUpload(dataTransfer.files);
    }

    onUpload(event) {
        this.doUpload(event.target.files);
    }

    onOpenFolder(id) {
        // isn't this a weird place for this if statement?
        if (this.props.uploading_files === true || this.props.loading_folder !== -1) {
            return;
        }
        Actions.openFolder(id);
    }

    onAddFolder(new_folder_name, current_folder_id) {
        Actions.addFolder(new_folder_name, current_folder_id);
    }

    doUpload(file_list) {
        // isn't this a weird place for this if statement?
        // console.log(this.props.uploading_files, this.props.loading_folder)
        if (this.props.uploading_files === true || this.props.loading_folder !== -1) {
            return;
        }
        Actions.upload(file_list, this.props.current_folder.id);
    }
}
