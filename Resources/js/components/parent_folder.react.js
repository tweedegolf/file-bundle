// @flow
import React from 'react';

type PropsType = {
    folder: FolderType,
    openFolder: (id: string) => void,
};

export default (props: PropsType): React$Element<*> => {
    const folder = props.folder;
    const icon = <span className="fa fa-chevron-up" />;

    const p = {
        onClick: () => {
            props.openFolder(folder.id);
        },
        className: 'folder',
    };

    return (
        <tr {...p}>
            <td className="select" />
            <td className="preview">{icon}</td>
            <td className="name">{folder.name}</td>
            <td className="size" />
            <td className="date" />
            <td className="buttons" />
        </tr>
    );
};

