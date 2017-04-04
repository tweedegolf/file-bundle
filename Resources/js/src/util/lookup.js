/* eslint no-use-before-define: off */

import R from 'ramda';

const mapIndexed = R.addIndex(R.map);

// Here we store all data paths for memoization
const filesById = {};
const foldersById = {};


const replaceFolderById = () => {
};


const removeFiles = () => {
};

export {
    replaceFolderById,
    // replaceFileById,
    removeFiles,
};
