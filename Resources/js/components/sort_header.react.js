import React from 'react';

export default class SortHeader extends React.Component {

    render() {
        let sort_class = null;

        if (this.props.sort === this.props.column) {
            sort_class = this.props.ascending ? 'fa fa-sort-down' : 'fa fa-sort-up';
        }

        return (
            <th onClick={this.props.sortBy.bind(this, this.props.column)} className="sort">
                {this.props.name}
                <span className={sort_class} />
            </th>
        );
    }
}