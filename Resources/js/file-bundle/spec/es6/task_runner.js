const phantom = global.phantom

export default class taskRunner{

  /**
   * Constructs the taskRunner
   */
  constructor(){
    // the currently running task
    this.taskIndex = -1
    /*
     * Array containing references to the task functions, will be populated at the
     * bottom of this file, after the task function are declared
     *
     * @type       {Array}
     */
    this.tasks = []
  }

  /**
   * Runs all tasks
   *
   * @param      {Object}  data    Optional data that is passed over from one
   *                               task to another
   */
  runTask(data){
    this.taskIndex++
    //console.log(this.taskIndex, this.tasks.length)
    if(this.taskIndex < this.tasks.length){
      this.tasks[this.taskIndex](data);
    }else{
      //console.log('done')
      phantom.exit(0);
    }
  }
}
