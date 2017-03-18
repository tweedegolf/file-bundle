/**
 * @file       Component renders a header at the top of the filelist; this
 *             toolbar displays the column names 'name', 'size' and 'creation
 *             date'. By clicking on one of these names the filelist will be
 *             sorted by that column. Clicking again on the currently selected
 *             column will reverse the order.
 */
import React, { PropTypes } from 'react';

const columns = {
    name: 'name',
    size_bytes: 'size',
    create_ts: 'date',
};

const SortHeader = (props) => {
    let sortClass = null;

    if (props.sort === props.column) {
        sortClass = props.ascending ? 'fa fa-sort-down' : 'fa fa-sort-up';
    }

    const p = {
        onClick: () => {
            props.sortBy(props.column);
        },
        className: `sort ${columns[props.column]}`,
    };

    return (<th {...p}>
        {props.name}
        <span className={sortClass} />
    </th>);
};

SortHeader.propTypes = {
    column: PropTypes.string.isRequired,
    sort: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ascending: PropTypes.bool.isRequired,
    sortBy: PropTypes.func.isRequired,
};

export default SortHeader;
