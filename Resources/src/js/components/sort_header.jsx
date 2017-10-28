// @flow
/**
 * @file       Component renders a header at the top of the filelist; this
 *             toolbar displays the column names 'name', 'size' and 'creation
 *             date'. By clicking on one of these names the filelist will be
 *             sorted by that column. Clicking again on the currently selected
 *             column will reverse the order.
 */
import React from 'react';
import { translate } from 'react-i18next';

const columns = {
    name: 'name',
    size_bytes: 'size',
    create_ts: 'date',
    type: 'type',
};

const getColumnHeader = (columnId: string, t: (string) => string): string =>
    t(`columns.${columns[columnId]}`);

type PropsType = {
    columnId: string,
    sort: string,
    ascending: boolean,
    sortBy: (sort: string) => void,
    t: (string) => string, // translate function
};

const SortHeader = (props: PropsType): React$Element<*> => {
    let sortClass = null;

    if (props.sort === props.columnId) {
        sortClass = props.ascending ? 'fa fa-sort-down' : 'fa fa-sort-up';
    }

    const p = {
        onClick: () => {
            props.sortBy(props.columnId);
        },
        className: 'sort',
    };

    return (<th {...p}>
        {getColumnHeader(props.columnId, props.t)}
        <span className={sortClass} />
    </th>);
};

export default translate('common')(SortHeader);
