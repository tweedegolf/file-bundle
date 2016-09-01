export const chainPromises = function(index, promises, resolve, reject, values = [], errors = []){

  let id = promises[index].id
  let func = promises[index].func
  let args = promises[index].args
  let parsePayload = promises[index].parsePayload
  let parseError = promises[index].parseError

  if(typeof parsePayload === 'undefined'){
    parsePayload = payload => {
      return {...payload, id}
    }
  }

  if(typeof parseError === 'undefined'){
    parseError = error => {
      return {...error, id}
    }
  }

  let numPromises = promises.length

  if(typeof func !== 'function'){
    errors.push({
      type: 'general',
      messages: ['not a function']
    })
    index++
    chainPromises(index, promises, resolve, reject, values, errors)
  }

  func(...args).then(
    payload => {
      index++
      values.push(parsePayload(payload))
      if(index === numPromises){
        resolve(values, errors)
      }else{
        chainPromises(index, promises, resolve, reject, values, errors)
      }
    },
    error => {
      index++
      errors.push(parseError(error))
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

