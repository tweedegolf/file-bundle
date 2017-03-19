import React, { PropTypes } from 'react';
import R from 'ramda';
import { showPreview } from '../actions';

const Preview = (props) => {
    if (R.isNil(props.preview)) {
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
        <div style={{ backgroundImage: `url(${props.preview})` }} />
    </div>);
};

Preview.propTypes = {
    preview: PropTypes.string,
};

Preview.defaultProps = {
    preview: null,
};

export default Preview;
