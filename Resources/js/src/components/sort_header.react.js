// @flow
/**
 * @file       Component renders a header at the top of the filelist; this
 *             toolbar displays the column names 'name', 'size' and 'creation
 *             date'. By clicking on one of these names the filelist will be
 *             sorted by that column. Clicking again on the currently selected
 *             column will reverse the order.
 */
import React from 'react';

const columns = {
    name: 'name',
    size_bytes: 'size',
    create_ts: 'date',
};

type PropsType = {
    column: string,
    sort: string,
    name: string,
    ascending: boolean,
    sortBy: (sort: string) => void,
};

const SortHeader = (props: PropsType): React$Element<*> => {
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

export default SortHeader;
