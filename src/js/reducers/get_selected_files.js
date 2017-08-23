// @flow
import R from 'ramda';
import { createSelector } from 'reselect';

const getUI = (state: StateType): UIStateType => state.ui;
const getTree = (state: StateType): TreeStateType => state.tree;

export default createSelector(
    [getUI, getTree],
    (uiState: UIStateType, treeState: TreeStateType): FileType[] => {
        const {
            selected,
        } = uiState;
        const {
            filesById,
        } = treeState;

        if (filesById === null) {
            return [];
        }

        const files: FileType[] = [];
        R.forEach((fileId: string) => {
            const file = filesById[fileId];
            if (typeof file !== 'undefined') {
                files.push(file);
            }
        }, selected.fileIds);

        return files;
    },
);
