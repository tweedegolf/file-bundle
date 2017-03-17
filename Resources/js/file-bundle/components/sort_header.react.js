/**
 * @file       Component renders a header at the top of the filelist; this
 *             toolbar displays the column names 'name', 'size' and 'creation
 *             date'. By clicking on one of these names the filelist will be
 *             sorted by that column. Clicking again on the currently selected
 *             column will reverse the order.
 */
import React from 'react';

export default class SortHeader extends React.Component {
    constructor(props) {
        super(props);
        this.class_names = {
            name: 'name',
            size_bytes: 'size',
            create_ts: 'date',
        };
    }

    render() {
        let sort_class = null;

        if (this.props.sort === this.props.column) {
            sort_class = this.props.ascending ? 'fa fa-sort-down' : 'fa fa-sort-up';
        }

        const className = `sort ${this.class_names[this.props.column]}`;

        return (
            <th onClick={this.props.sortBy.bind(this, this.props.column)} className={className}>
                {this.props.name}
                <span className={sort_class} />
            </th>
        );
    }
}
