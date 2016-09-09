import React from 'react';
import FileDragAndDrop from 'react-file-drag-and-drop';

import List from '../components/list.react.js';
import SortHeader from '../components/sort_header.react.js';
import Toolbar from '../components/toolbar.react.js';
import SelectedFiles from '../components/selected_files.react.js';
import Errors from '../components/errors.react.js';

import Actions from '../actions';
import {connect} from 'react-redux'

const mapStateToProps = (state) => {

  return {
    // tree props
    folders: state.tree.folders,
    files: state.tree.files,
    current_folder: state.tree.current_folder,
    parent_folder: state.tree.parent_folder,
    selected: state.tree.selected,
    clipboard: state.tree.clipboard,

    // ui props
    sort: state.ui.sort,
    ascending: state.ui.ascending,
    preview: state.ui.preview,
    confirm_delete: state.ui.confirm_delete,
    expanded: state.ui.expanded,
    hover: state.ui.hover,
    loading_folder: state.ui.loading_folder, // null or number
    deleting_file: state.ui.deleting, // null or number
    deleting_folder: state.ui.deleting, // null or number
    adding_folder: state.ui.adding_folder, // true or false
    uploading_files: state.ui.uploading_files, // true or false
    scroll_position: state.ui.scroll_position, // null or numeric value

    // collect all errors
    errors: [...state.tree.errors, ...state.ui.errors],
  }
}

const mapDispatchToProps = function (dispatch) {
  return {
    dispatch,
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Browser extends React.Component {

  constructor(props) {
    super(props);
  }


  componentDidMount() {

    // Filepicker mode: gets its selected files from a dataset, not from local
    // storage. In case no selected files are passed in from the dataset, we
    // pass an empty array to loadFromLocalStorage(). This overrides the
    // selected files in the local storage.
    if (this.props.browser === false) {
      let selected = []
      if(typeof this.props.options !== 'undefined'){
        selected = this.props.options.selected
      }
      Actions.loadFromLocalStorage(selected)
    }

    // Browser mode: by default, the browser is not expanded, therefor we have
    // to call the expandBrowser action to expand the browser
    if (this.props.browser === true) {
      document.addEventListener('keydown', this.onKeyDown.bind(this), false);
      Actions.expandBrowser()
      Actions.loadFromLocalStorage()
    }
  }


  componentWillUnmount() {
    if (this.props.browser) {
      document.removeEventListener('keydown', this.onKeyDown.bind(this), false);
    }
  }


  componentDidUpdate() {
    if (this.props.scroll_position !== null) {
      this.refs.container.scrollTop = this.props.scroll_position
      Actions.setScrollPosition(null)
    }
  }


  render() {
    let headers = Object.entries({
      name: 'Naam',
      size_bytes: 'Grootte',
      create_ts: 'Aangemaakt'
    }).map(([column, name]) =>
      <SortHeader
        key={column}
        sortBy={this.sortBy.bind(this)}
        sort={this.props.sort}
        ascending={this.props.ascending}
        column={column}
        name={name}
      />
    );

    let toolbar = <Toolbar
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
    />;

    let selected = null;
    if (!this.props.browser && this.props.selected.length > 0) {
      selected = <SelectedFiles
        selected={this.props.selected}
        onSelect={this.onSelect.bind(this)}
        onPreview={this.onPreview.bind(this)}
      />;
    }

    let browser = null;
    let browser_class = 'file-browser text-left' + (this.props.browser ? ' fullpage' : '');

    let preview = null
    if (this.props.preview !== null) {
      preview = <div
        className="preview-image"
        onClick={this.onPreview.bind(this, null)}>
        <div style={{ backgroundImage: 'url(' + this.props.preview + ')' }}></div>
      </div>
    }

    if (this.props.expanded) {
      browser = (
        <div className="text-center">
          {selected}
          {preview}
          <div className={browser_class}>
            <FileDragAndDrop onDrop={this.handleDrop.bind(this)}>
              {toolbar}
              <Errors errors={this.props.errors} onDismiss={this.onDismiss.bind(this)}/>
              <div ref="container" className="table-container">
                <table className="table table-condensed">
                  <thead>
                  <tr>
                    <th className="select"/>
                    <th className="preview"/>
                    {headers}
                    <th className="buttons"/>
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
            onClick={this.toggleExpand.bind(this)}>
            <span className="fa fa-chevron-up"/>
          </button>
            : null
          }
        </div>
      );
    } else {
      browser = <div>
        {selected}
        {preview}
        <button
          type="button"
          className="btn btn-default expand-button"
          onClick={this.toggleExpand.bind(this)}>
          Bladeren
          <span className="fa fa-folder-open-o"/>
        </button>
      </div>
    }

    return browser;
  }

  onKeyDown(event) {
    event.stopPropagation();
    if (event.keyCode === 38) {
      Actions.setHover(-1, this.props.current_folder.id);
    } else if (event.keyCode === 40) {
      Actions.setHover(+1, this.props.current_folder.id);
    }
  }

  onPreview(image_url, e) {
    e.stopPropagation();
    Actions.showPreview(image_url)
  }

  onDismiss(error_id) {
    Actions.dismissError(error_id)
  }

  onConfirmDelete(id) {
    Actions.confirmDelete(id)
  }

  onDelete(id) {
    Actions.deleteFile(id, this.props.current_folder.id)
  }

  onDeleteFolder(id) {
    Actions.deleteFolder(id, this.props.current_folder.id)
  }

  onCut() {
    Actions.cutFiles(this.props.current_folder.id)
  }

  onCancel() {
    Actions.cancelCutAndPasteFiles()
  }

  onPaste() {
    Actions.pasteFiles(this.props.clipboard, this.props.current_folder.id)
  }

  onSelect(id) {
    if (this.props.clipboard.length > 0) {
      return;
    }

    let multiple = true
    if (this.props.options && this.props.options.multiple) {
      multiple = this.props.options.multiple
    }

    Actions.selectFile({
      id,
      multiple,
      browser: this.props.browser,
    })
  }

  sortBy(sort) {
    let ascending
    if (this.props.sort === sort) {
      ascending = !this.props.ascending
    }
    Actions.changeSorting({
      ascending,
      sort,
    })
  }

  toggleExpand() {
    Actions.expandBrowser()
  }

  handleDrop(dataTransfer) {
    this.doUpload(dataTransfer.files);
  }

  onUpload(event) {
    this.doUpload(event.target.files);
  }

  onOpenFolder(id) {
    if (this.props.uploading_files === true || this.props.loading_folder !== null) {
      return;
    }
    Actions.openFolder(id)
  }

  onAddFolder(new_folder_name, current_folder_id) {
    Actions.addFolder(new_folder_name, current_folder_id)
  }

  doUpload(file_list) {
    if (this.props.uploading_files === true || this.props.loading_folder !== null) {
      return;
    }
    Actions.upload(file_list, this.props.current_folder.id)
  }
}
