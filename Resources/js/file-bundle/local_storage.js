let tree = {}
let all_files = {}
let all_folders = {
  null: {
    id: null,
    name: '..',
  }
}
let selected = []
let current_folder_id = null


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


export function getLocalState(){

  let tmp = localStorage.getItem('tree')

  if(tmp !== null){
    tree = JSON.parse(tmp)
    all_files = JSON.parse(localStorage.getItem('all_files'))
    all_folders = JSON.parse(localStorage.getItem('all_folders'))
    current_folder_id = JSON.parse(localStorage.getItem('current_folder_id'))
    selected = JSON.parse(localStorage.getItem('selected'))

    if(selected === null){
      selected = []
    }else{
      selected = selected.map(file_id => {
        return all_files[file_id]
      })
    }
  }

  return {
    current_folder_id,
    selected,
    tree,
    all_files,
    all_folders,
  }
}


export function storeLocal(...args){
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
