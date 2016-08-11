import React from 'react';
import cache from '../cache';

export default class SelectedFiles extends React.Component {

  render() {
    console.log(this.props.selected)
    let files = _.map(this.props.selected, (id) => {
      let file = cache.findFile(id);

      let preview = <span className="fa fa-file" />;
      if (file.thumb) {
        preview = <img src={file.thumb} alt={file.name} onClick={this.props.onPreview.bind(this, file.original)} />
      }

      return <div key={id} className="btn btn-default" onClick={this.props.onSelect.bind(this, id)}>
        {preview}
        <span className="name">{file.name}</span>
        <span className="remove">&times;</span>
        <input type="hidden" name={this.props.name} value={id} />
      </div>;
    });

    if (files.length === 0) {
      files = <span className="none-selected">Geen bestand(en) geselecteerd.</span>;
    }

    return (
      <div className="text-left file-picker-selection">
        {files}
      </div>
    );
  }
}