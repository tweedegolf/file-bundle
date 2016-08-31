export const chainPromises = function(index, promises, resolve, reject){

  let func = promises[index].func
  let args = promises[index].args

  if(typeof func !== 'function'){
    reject('not a function', func)
  }

  console.log(func)

  func(...args)
  .then(
    payload => {
      index++
      if(index === promises.length){
        resolve(payload)
      }else{
        chainPromises(index, promises, resolve, reject)
      }
    },
    error => {
      reject(error)
    }
  )
}
