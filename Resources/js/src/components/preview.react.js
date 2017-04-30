// @flow
import React from 'react';
import R from 'ramda';
import { showPreview } from '../actions';

type PropsType = {
    url: null | string,
};

const Preview = (props: PropsType): null | React$Element<*> => {
    if (props.url === null) {
        return null;
    }
    const p = {
        className: 'preview-image',
        onClick: (e: SyntheticEvent) => {
            e.stopPropagation();
            showPreview(null);
        },
    };
    return (<div {...p}>
        <div style={{ backgroundImage: `url(${props.url})` }} />
    </div>);
};


Preview.defaultProps = {
    url: null,
};

export default Preview;
