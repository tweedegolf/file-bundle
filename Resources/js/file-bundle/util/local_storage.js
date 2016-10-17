/**
 * Utility functions that handle saving to and retrieving from local storage
 */


// for parsing JSON, not needed for now
const reviver = function(k, v){
  let tmp = parseInt(v, 10)
  if(isNaN(tmp) === false){
    return tmp
  }else if(v === 'null'){
    return null
  }
  return v
}

/**
 * Retrieves the state from the local storage. If nothing has been saved to
 * local storage yet, default values will be returned.
 *
 * @return     {Object}  The current state.
 */
export function getLocalState(){

  // default values
  let all_files = {}
  let all_folders = {
    null: {
      id: null,
      name: '..',
      file_count: 0,
      folder_count: 0,
    }
  }
  let selected = []
  let current_folder_id = null

  let tree = localStorage.getItem('tree')
  if(tree !== null){
    tree = JSON.parse(tree)
    all_files = JSON.parse(localStorage.getItem('all_files'))
    all_folders = JSON.parse(localStorage.getItem('all_folders'))
    current_folder_id = JSON.parse(localStorage.getItem('current_folder_id'))
    selected = JSON.parse(localStorage.getItem('selected'))

    if(selected === null){
      selected = []
    }else{
      /**
       * Only the ids of the selected files are stored but the state expects
       * File description objects in the selected array; so we replace the ids
       * by their corresponding File objects
       */
      selected = selected.map(file_id => {
        return all_files[file_id]
      })
    }
  }else{
    tree = {}
  }

  return {
    current_folder_id,
    selected,
    tree,
    all_files,
    all_folders,
  }
}

/**
 * Stores a value to local storage. If the selected array is passed, only the
 * ids of the selected files will be stored.
 *
 * @param      {Array}  args    The values to be stored
 */
export function storeLocal(...args){
  // bypass for now
  return

  args.forEach(arg => {

    let key = Object.keys(arg)[0]
    let value = arg[key]

    switch(key){
      case 'selected':
        value = value.map(f => {
          return f.id
        })
        break

      default:
        // imagine the sound of one hand clapping
    }

    localStorage.setItem(key, JSON.stringify(value))
  })
}
