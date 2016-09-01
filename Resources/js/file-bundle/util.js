export const chainPromises = function(index, promises, resolve, reject, values = [], errors = []){

  let func = promises[index].func
  let args = promises[index].args
  let numPromises = promises.length

  if(typeof func !== 'function'){
    reject('not a function', func)
  }

  func(...args).then(
    payload => {
      index++
      values.push(payload)
      if(index === numPromises){
        resolve(values)
      }else{
        chainPromises(index, promises, resolve, reject, values, errors)
      }
    },
    error => {
      index++
      errors.push(error)
      if(index === numPromises){
        if(errors.length === numPromises){
          reject(errors)
        }
      }else{
        chainPromises(index, promises, resolve, reject, values, errors)
      }
      //reject(error)
    }
  )
}

