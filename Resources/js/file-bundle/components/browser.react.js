import React from 'react';
import FileDragAndDrop from 'react-file-drag-and-drop';
import _ from 'lodash';

import List from './list.react.js';
import SortHeader from './sort_header.react.js';
import Toolbar from './toolbar.react.js';
import SelectedFiles from './selected_files.react.js';
import Errors from './errors.react.js';

import Actions from '../actions/tree_actions';
import {connect} from 'react-redux'

const mapStateToProps = (state) => {

  let sort = state.ui.sort
  let files = _.sortBy(state.tree.files, sort)
  let folders = _.sortBy(state.tree.folders, sort)

  return {

    // tree props
    folders,
    files,
    loading_folder: state.tree.loading_folder,
    adding_folder: state.tree.adding_folder,
    current_folder: state.tree.current_folder,
    parent_folder: state.tree.parent_folder,
    uploading_files: state.tree.uploading_files,
    selected: state.tree.selected,
    clipboard: state.tree.clipboard,
    errors: state.tree.errors, // to ui_reducer?

    // ui props
    sort,
    ascending: state.ui.ascending,
    preview: state.ui.preview,
    hover: state.ui.hover,
  }
}

const mapDispatchToProps = function(dispatch){
  return {
    dispatch,
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Browser extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      confirm_delete: null, // local state
      expanded: this.props.browser, // local state
    };
  }


  componentDidMount() {

    if (this.props.options && this.props.options.selected) {
      Actions.cacheSelectedFiles(this.props.options.selected)
    }

    this.onOpenFolder(this.props.current_folder.id);

    if (this.props.browser) {
      document.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }
  }

  componentWillUnmount() {
    if (this.props.browser) {
      document.removeEventListener('keydown', this.onKeyDown.bind(this), false);
    }
  }

  render() {
    let headers = _.map({
      name: 'Naam',
      size_bytes: 'Grootte',
      create_ts: 'Aangemaakt'
    }, (name, column) =>
      <SortHeader
        key={column}
        sortBy={this.sortBy.bind(this)}
        sort={this.state.sort}
        ascending={this.state.ascending}
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
      uploading={this.props.uploading_files !== null}
    />;

    let selected = null;
    if (!this.props.browser && this.props.selected.length > 0) {
      selected = <SelectedFiles
        selected={this.props.selected}
        name={this.props.options.name}
        onSelect={this.onSelect.bind(this)}
        onPreview={this.onPreview.bind(this)}
      />;
    }

    let browser = null;
    let browser_class = "file-browser text-left" + (this.props.browser ? " fullpage" : "");

    if (this.state.expanded) {
      browser = (
      <div className="text-center">
        {selected}
        {this.state.preview ? <div
          className="preview-image"
          onClick={this.onPreview.bind(this, null)}>
          <div style={{backgroundImage: 'url(' + this.state.preview + ')'}}></div>
        </div> : null}
        <div className={browser_class}>
          <FileDragAndDrop onDrop={this.handleDrop.bind(this)}>
            {toolbar}
            <Errors errors={this.props.errors} onDismiss={this.onDismiss.bind(this)} />
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
                files={this.props.files}
                folders={this.props.folders}
                current_folder={this.props.current_folder}
                parent_folder={this.props.parent_folder}
                onSelect={this.onSelect.bind(this)}
                onPreview={this.onPreview.bind(this)}
                hover={this.state.hover}
                selected={this.props.selected}
                clipboard={this.props.clipboard}
                browser={this.props.browser}
                confirm_delete={this.state.confirm_delete}
                loading_folder={this.state.loading_folder}
                images_only={this.props.options ? this.props.options.images_only : false}
                onDelete={this.onDelete.bind(this)}
                onDeleteFolder={this.onDeleteFolder.bind(this)}
                onConfirmDelete={this.onConfirmDelete.bind(this)}
                onOpenFolder={this.onOpenFolder.bind(this)}
              />
            </table>
          </FileDragAndDrop>
        </div>
        {!this.props.browser
          ? <button
            type="button"
            className="btn btn-default btn-xs collapse-button"
            onClick={this.toggleExpand.bind(this)}>
            <span className="fa fa-chevron-up" />
            </button>
          : null
        }
      </div>
      );
    } else {
      browser = <div>
        {selected}
        <button
          type="button"
          className="btn btn-default expand-button"
          onClick={this.toggleExpand.bind(this)}>
          Bladeren
          <span className="fa fa-folder-open-o" />
        </button>
      </div>
    }

    return browser;
  }

  onKeyDown(event) {
    if (event.keyCode === 38) {
      this.setHover(this.state.hover - 1);
    } else if (event.keyCode === 40) {
      this.setHover(this.state.hover + 1);
    }
  }

  setHover(target) {
    let len = this.props.folders.length + this.props.files.length;
    target = target < 0 ? len - 1 : target % len;
    this.setState({hover: target});
  }

  onPreview(state, e) {
    e.stopPropagation();
    this.setState({preview: state});
  }

  onDismiss(index) {
    this.props.errors.splice(index, 1);
    this.setState({errors: this.props.errors});
  }

  onConfirmDelete(id) {
    this.setState({confirm_delete: id});
  }

  onDelete(id) {
    Actions.deleteFile(id)
  }

  onDeleteFolder(id) {
    Actions.deleteFolder(id)
  }

  onCut() {
    Actions.cutFiles(this.props.selected)
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
    if(this.props.options && this.props.options.multiple) {
      multiple = this.props.options.multiple
    }

    Actions.selectFile({
      id,
      multiple,
      browser: this.props.browser,
    })
  }

  sortBy(column) {
    if (this.state.sort === column) {
      this.state.ascending = !this.state.ascending;
    }
    this.setState({
      ascending: this.state.ascending,
      sort: column,
      folders: _.sortBy(this.props.folders, column),
      files: _.sortBy(this.state.files, column)
    });
  }

  toggleExpand() {
    this.setState({expanded: !this.state.expanded});
  }

  handleDrop(dataTransfer) {
    this.doUpload(dataTransfer.files);
  }

  onUpload(event) {
    this.doUpload(event.target.files);
  }

  onOpenFolder(id) {
    if (this.props.uploading_files !== null || this.props.loading_folder === true) {
      return;
    }
    Actions.openFolder(id)
  }

  onAddFolder() {
    Actions.addFolder()
  }

  doUpload(file_list) {
    if (this.props.uploading_files !== null || this.props.loading_folder === true) {
      return;
    }

    Actions.upload(file_list, this.props.current_folder)
  }
}