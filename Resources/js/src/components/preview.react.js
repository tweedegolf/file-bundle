import React, { PropTypes } from 'react';
import R from 'ramda';
import { showPreview } from '../actions';

const Preview = (props) => {
    if (R.isNil(props.url)) {
        return null;
    }
    const p = {
        className: 'preview-image',
        onClick: (e) => {
            e.stopPropagation();
            showPreview(null);
        },
    };
    return (<div {...p}>
        <div style={{ backgroundImage: `url(${props.url})` }} />
    </div>);
};

Preview.propTypes = {
    url: PropTypes.string,
};

Preview.defaultProps = {
    url: null,
};

export default Preview;
