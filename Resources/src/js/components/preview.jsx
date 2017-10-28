// @flow
import React from 'react';

type PropsType = {
    url: null | string,
    // showPreview: (imageUrl: null | string) => void,
    showPreview: (imageUrl: null | string) => GenericActionType, // this is very weird!
};

const Preview = (props: PropsType): null | React$Element<*> => {
    if (props.url === null) {
        return null;
    }
    const p = {
        className: 'preview-image',
        onClick: (e: SyntheticEvent) => {
            e.stopPropagation();
            props.showPreview(null);
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
