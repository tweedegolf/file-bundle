import _ from 'lodash';

class Cache {

    constructor() {
        this.folders = {
            null: {
                id: null,
                name: '..'
            }
        };
        this.files = {};
        this.data = {};
    }

    findFile(id) {
        if (!this.files[id]) {
            console.error('File not found', id);

            return null;
        }

        return this.files[id];
    }

    storeFiles(files, folder_id) {
        _.forEach(files, (file) => {
            this.files[file.id] = file;
        });

        if (folder_id !== undefined && this.data[folder_id]) {
            this.data[folder_id].files = this.data[folder_id].files.concat(files);
        }
    }

    removeFiles(file_ids) {
        _.forEach(this.data, (folder) => {
            folder.files = _.filter(folder.files, (file) => (file_ids.indexOf(file.id) === -1));
        });
    }

    getFiles(folder_id) {
        if (!this.data[folder_id]) {
            return [];
        }

        return this.data[folder_id].files;
    }

    findFolder(id) {
        if (!this.folders[id]) {
            console.error('Folder not found', id);

            return null;
        }

        return this.folders[id];
    }

    storeFolders(folders, folder_id) {
        _.forEach(folders, (folder) => {
            this.folders[folder.id] = folder;
        });

        if (folder_id !== undefined && this.data[folder_id]) {
            this.data[folder_id].folders = this.data[folder_id].folders.concat(folders);
        }
    }
    
    loadFolder(key, mis, hit) {
        if (this.data[key]) {
            if(!this.data[key].loading) {
                hit(this.data[key].folders, this.data[key].files);
            } else {
                this.data[key].waiting.push(hit)
            }
        } else {
            this.data[key] = {
                loading: true,
                waiting: [hit]
            };
            mis();
        }
    }

    getFolders(folder_id) {
        if (!this.data[folder_id]) {
            return [];
        }

        return this.data[folder_id].folders;
    }

    storeFolder(key, folders, files) {
        if (!this.data[key]) {
            this.data[key] = {
                waiting: []
            };
        }

        this.data[key].loading = false;
        this.data[key].folders = folders;
        this.data[key].files = files;

        this.storeFolders(folders);
        this.storeFiles(files);

        _.forEach(this.data[key].waiting, (hit) => {
            hit(folders, files);
        });
    }
}
export default new Cache();
